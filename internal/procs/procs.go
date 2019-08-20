package procs

import (
	"fmt"
)

type Procedure func(inputBytes []byte) (outputBytes []byte, err error)

var procMap = map[string]Procedure{}

func GetProcMap() map[string]Procedure {
	return procMap
}

func AddProc(name string, proc Procedure) error {
	if _, ok := procMap[name]; ok {
		return fmt.Errorf("procedure %v already exists", name)
	}
	procMap[name] = proc
	return nil
}

func addProc(name string, proc Procedure) {
	if err := AddProc(name, proc); err != nil {
		panic(err.Error())
	}
}
