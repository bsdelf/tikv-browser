package procs

import (
	"tikv-browser/internal/service"

	"github.com/vmihailenco/msgpack"
)

func profileList(inputBytes []byte) ([]byte, error) {
	config := service.GetConfig()
	return msgpack.Marshal(config.Profiles)
}

func profileAdd(inputBytes []byte) ([]byte, error) {
	return nil, nil
}

func profileSave(inputBytes []byte) ([]byte, error) {
	return nil, nil
}

func profileRemove(inputBytes []byte) ([]byte, error) {
	return nil, nil
}

func init() {
	addProc("/profile/list", profileList)
	addProc("/profile/add", profileAdd)
	addProc("/profile/save", profileSave)
	addProc("/profile/remove", profileRemove)
}
