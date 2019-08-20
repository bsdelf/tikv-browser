package main

import (
	"os"
	"os/signal"
	"syscall"

	"tikv-browser/internal/service"
)

func main() {
	service.InitLogger()
	service.InitConfig()
	startServer()
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	stopServer()
}
