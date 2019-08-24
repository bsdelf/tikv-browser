package procs

import (
	"context"
	"fmt"

	tikvKey "github.com/tikv/client-go/key"
	"github.com/tikv/client-go/txnkv"
	tikvKv "github.com/tikv/client-go/txnkv/kv"
	"github.com/vmihailenco/msgpack"

	"tikv-browser/internal/service"
	"tikv-browser/pkg/utils"
)

func tikvSearchRange(client *txnkv.Client, lowerBound []byte, limit int) ([][]byte, error) {
	tx, err := client.Begin(context.TODO())
	if err != nil {
		return nil, err
	}

	tikvLowerBound := tikvKey.Key(lowerBound)
	it, err := tx.Iter(context.TODO(), tikvLowerBound, nil)
	if err != nil {
		return nil, err
	}
	defer it.Close()

	keys := [][]byte{}
	for count := 0; it.Valid() && count < limit; {
		keys = append(keys, it.Key()[:])
		count++
		it.Next(context.TODO())
	}
	return keys, nil
}

func tikvSearchPrefix(client *txnkv.Client, prefix []byte, limit int) ([][]byte, error) {
	tx, err := client.Begin(context.TODO())
	if err != nil {
		return nil, err
	}

	tikvPrefix := tikvKey.Key(prefix)
	it, err := tx.Iter(context.TODO(), tikvPrefix, nil)
	if err != nil {
		return nil, err
	}
	defer it.Close()

	keys := [][]byte{}
	for count := 0; it.Valid() && count < limit; {
		if !it.Key().HasPrefix(tikvPrefix) {
			break
		}
		keys = append(keys, it.Key()[:])
		count++
		it.Next(context.TODO())
	}
	return keys, nil
}

func tikvSearchWhole(client *txnkv.Client, key []byte) (bool, error) {
	tx, err := client.Begin(context.TODO())
	if err != nil {
		return false, err
	}
	_, err = tx.Get(context.TODO(), key)
	if err != nil {
		if tikvKv.IsErrNotFound(err) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func tikvSearch(inputBytes []byte) ([]byte, error) {
	type InputMessage struct {
		Endpoints []string `msgpack:"endpoints"`
		Mode      string   `msgpack:"mode"`
		Encoding  string   `msgpack:"encoding"`
		Contents  string   `msgpack:"contents"`
		Limit     int      `msgpack:"limit"`
	}

	type OutputMessage = [][]byte

	var inputMessage InputMessage
	if err := msgpack.Unmarshal(inputBytes, &inputMessage); err != nil {
		return nil, err
	}

	contents, err := func() ([]byte, error) {
		switch inputMessage.Encoding {
		case "utf8":
			{
				return []byte(inputMessage.Contents), nil
			}
		case "hex":
			{
				return utils.HexToBytes(inputMessage.Contents)
			}
		case "base64":
			{
				return utils.Base64ToBytes(inputMessage.Contents)
			}
		}
		return nil, fmt.Errorf("invalid encoding: %v", inputMessage.Encoding)
	}()
	if err != nil {
		return nil, err
	}

	var callbackErr error
	var outputMessage OutputMessage
	service.UseTikvClient(inputMessage.Endpoints, func(client *txnkv.Client, err error) {
		if err != nil {
			callbackErr = err
			return
		}
		switch inputMessage.Mode {
		case "scan":
			{
				outputMessage, callbackErr = tikvSearchRange(client, contents, inputMessage.Limit)
			}
		case "prefix":
			{
				outputMessage, callbackErr = tikvSearchPrefix(client, contents, inputMessage.Limit)
			}
		case "whole":
			{
				found, err := tikvSearchWhole(client, contents)
				callbackErr = err
				if found {
					outputMessage = [][]byte{contents}
				}
			}
		default:
			{
				callbackErr = fmt.Errorf("invalid mode: %v", inputMessage.Mode)
			}
		}
	})
	if callbackErr != nil {
		return nil, callbackErr
	}

	return msgpack.Marshal(&outputMessage)
}

func tikvGet(inputBytes []byte) ([]byte, error) {
	type InputMessage struct {
		Endpoints []string `msgpack:"endpoints"`
		Keys      [][]byte `msgpack:"keys"`
	}

	type Row struct {
		Key   []byte `msgpack:"key"`
		Value []byte `msgpack:"value"`
	}

	type OutputMessge struct {
		Rows []Row `msgpack:"rows"`
	}

	var inputMessage InputMessage
	if err := msgpack.Unmarshal(inputBytes, &inputMessage); err != nil {
		return nil, err
	}

	var callbackErr error
	outputMessage := OutputMessge{}
	service.UseTikvClient(inputMessage.Endpoints, func(client *txnkv.Client, err error) {
		if err != nil {
			callbackErr = err
			return
		}
		tx, err := client.Begin(context.TODO())
		if err != nil {
			callbackErr = err
			return
		}
		for _, key := range inputMessage.Keys {
			value, err := tx.Get(context.TODO(), tikvKey.Key(key))
			if err != nil {
				service.GetLogger().Info(err)
				continue
			}
			row := Row{Key: key, Value: value}
			outputMessage.Rows = append(outputMessage.Rows, row)
		}
	})

	if callbackErr != nil {
		return nil, callbackErr
	}
	return msgpack.Marshal(&outputMessage)
}

func init() {
	addProc("/tikv/search", tikvSearch)
	addProc("/tikv/get", tikvGet)
}
