package main

import (
	"fmt"
	"io"
	"net"
	"net/http"
	"time"

	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
	"github.com/vmihailenco/msgpack"

	"tikv-browser/internal/procs"
	"tikv-browser/internal/service"
)

type Session struct {
	conn      net.Conn
	createdAt time.Time
}

type InputMessage struct {
	ID   uint16 `msgpack:"id"`
	Proc string `msgpack:"proc"`
	Data []byte `msgpack:"data"`
}

type OutputMessage struct {
	ID    uint16 `msgpack:"id"`
	Data  []byte `msgpack:"data"`
	Error string `msgpack:"error"`
}

func NewSession(w http.ResponseWriter, r *http.Request) (*Session, error) {
	conn, _, _, err := ws.UpgradeHTTP(r, w)
	if err != nil {
		return nil, err
	}
	createdAt := time.Now().UTC()
	return &Session{conn: conn, createdAt: createdAt}, nil
}

func (s *Session) Run() {
	logger := service.GetLogger()
	procMap := procs.GetProcMap()

	for {
		inputBytes, op, err := wsutil.ReadClientData(s.conn)
		if err != nil {
			if err == io.EOF {
				logger.Info("session terminated")
			}
			logger.Error(err)
			return
		}

		var inputMessage InputMessage
		if err := msgpack.Unmarshal(inputBytes, &inputMessage); err != nil {
			continue
		}
		logger.Info(fmt.Sprintf(">>> %v, %v bytes", inputMessage.Proc, len(inputBytes)))

		outputMessage := OutputMessage{ID: inputMessage.ID}
		proc, ok := procMap[inputMessage.Proc]
		if ok {
			outputData, err := proc(inputMessage.Data)
			outputMessage.Data = outputData
			if err != nil {
				outputMessage.Error = err.Error()
			}
		} else {
			outputMessage.Error = "proc not found"
		}

		outputBytes, err := msgpack.Marshal(&outputMessage)
		if err != nil {
			logger.Error(err)
			continue
		}

		logger.Info(fmt.Sprintf("<<< %v, %v bytes", inputMessage.Proc, len(outputBytes)))
		err = wsutil.WriteServerMessage(s.conn, op, outputBytes)
		if err != nil {
			logger.Error(err)
		}
	}
}

func (s *Session) Stop() {
	if s.conn != nil {
		s.conn.Close()
		s.conn = nil
	}
}

func (s *Session) RemoteAddr() net.Addr {
	return s.conn.RemoteAddr()
}
