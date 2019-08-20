package main

import (
	"context"
	"net/http"
	"tikv-browser/internal/service"
)

var (
	httpServer *http.Server
	wsSessions = map[string]*Session{}
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

		addr := session.RemoteAddr().String()
		wsSessions[addr] = session
		logger.Info("new session: ", addr)

		cleanup := func() {
			delete(wsSessions, addr)
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

	for addr, session := range wsSessions {
		logger.Info("close ws", addr)
		session.Stop()
	}
	wsSessions = map[string]*Session{}
}
