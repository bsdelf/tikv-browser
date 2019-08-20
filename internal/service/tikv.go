package service

import (
	"context"

	tikvConfig "github.com/tikv/client-go/config"
	"github.com/tikv/client-go/txnkv"
)

// type TikvClient struct {
// 	mutex  sync.Mutex
// 	client *rawkv.Client
// }

// type TikvClientPool struct {
// 	mutex   sync.Mutex
// 	clients map[string][]*TikvClient
// }

// var tikvClientPool = TikvClientPool{}

type TikvClientCallback func(client *txnkv.Client, err error)

func UseTikvClient(endpoints []string, callback TikvClientCallback) {
	cli, err := txnkv.NewClient(context.TODO(), endpoints, tikvConfig.Default())
	if err == nil && cli != nil {
		defer cli.Close()
	}
	callback(cli, err)
}
