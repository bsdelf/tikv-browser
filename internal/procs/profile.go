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

func profileDelete(inputBytes []byte) ([]byte, error) {
	type InputMessage struct {
		Name string `msgpack:"name"`
	}
	var inputMessage InputMessage
	if err := msgpack.Unmarshal(inputBytes, &inputMessage); err != nil {
		return nil, err
	}
	config := service.GetConfig()
	profiles := make([]service.ConfigProfile, 0, len(config.Profiles)-1)
	for _, profile := range config.Profiles {
		if profile.Name == inputMessage.Name {
			continue
		}
		profiles = append(profiles, profile)
	}
	config.Profiles = profiles
	service.SaveConfig()
	return nil, nil
}

func init() {
	addProc("/profile/list", profileList)
	addProc("/profile/add", profileAdd)
	addProc("/profile/save", profileSave)
	addProc("/profile/delete", profileDelete)
}
