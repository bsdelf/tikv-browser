package service

import (
	"go.uber.org/zap"
)

var (
	logger *zap.SugaredLogger
)

func GetLogger() *zap.SugaredLogger {
	return logger
}

func InitLogger() {
	lg, err := zap.NewDevelopment()
	if err != nil {
		panic(err)
	}
	logger = lg.Sugar()
}
