package service

import (
	"context"
	"strings"
	"sync"

	tikvConfig "github.com/tikv/client-go/config"
	"github.com/tikv/client-go/txnkv"
)

// TODO: cleanup clients on exit
var tikvClients = sync.Map{}

type TikvClientCallback func(client *txnkv.Client, err error)

func UseTikvClient(endpoints []string, callback TikvClientCallback) {
	var (
		err error
		cli *txnkv.Client
	)
	key := strings.Join(endpoints, ",")
	if value, ok := tikvClients.Load(key); ok {
		cli = value.(*txnkv.Client)
	} else {
		cli, err = txnkv.NewClient(context.TODO(), endpoints, tikvConfig.Default())
		if err == nil {
			if actual, loaded := tikvClients.LoadOrStore(key, cli); loaded {
				cli.Close()
				cli = actual.(*txnkv.Client)
			}
		}
	}
	callback(cli, err)
}
