package main

import (
	"context"
	"net/http"
	"sync"
	"tikv-browser/internal/service"
)

var (
	httpServer *http.Server
	wsSessions = sync.Map{}
)

func startServer() {
	addr := service.GetConfig().Address
	logger := service.GetLogger()
	logger.Info("start http: ", addr)

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		session, err := NewSession(w, r)
		if err != nil {
			logger.Error(err)
			return
		}

		remoteAddr := session.RemoteAddr().String()
		if _, loaded := wsSessions.LoadOrStore(remoteAddr, session); loaded {
			logger.Error("duplicate session: ", remoteAddr)
			return
		}

		logger.Info("new session: ", remoteAddr)
		cleanup := func() {
			wsSessions.Delete(remoteAddr)
			session.Stop()
		}
		go func() {
			defer cleanup()
			session.Run()
		}()
	})

	httpServer = &http.Server{Addr: addr}
	go func() {
		if err := httpServer.ListenAndServe(); err != nil {
			logger.Error(err)
		}
	}()
}

func stopServer() {
	logger := service.GetLogger()
	logger.Info("shutdown http")
	if err := httpServer.Shutdown(context.TODO()); err != nil {
		logger.Error(err)
	}
	wsSessions.Range(func(key interface{}, value interface{}) bool {
		logger.Info("close ws: ", key.(string))
		value.(*Session).Stop()
		return true
	})
}
