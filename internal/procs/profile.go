package procs

import (
	"time"

	"tikv-browser/internal/service"

	"github.com/vmihailenco/msgpack"
)

func profileList(inputBytes []byte) ([]byte, error) {
	config := service.GetConfig()
	return msgpack.Marshal(config.Profiles)
}

func profileAdd(inputBytes []byte) ([]byte, error) {
	var profile service.ConfigProfile
	if err := msgpack.Unmarshal(inputBytes, &profile); err != nil {
		return nil, err
	}
	now := time.Now().Unix()
	profile.CreatedAt = &now
	profile.UpdatedAt = &now
	config := service.GetConfig()
	config.Profiles = append(config.Profiles, profile)
	service.SaveConfig()
	return nil, nil
}

func profileUpdate(inputBytes []byte) ([]byte, error) {
	type InputMessage struct {
		Name    string                `msgpack:"name"`
		Profile service.ConfigProfile `msgpack:"profile"`
	}
	var inputMessage InputMessage
	if err := msgpack.Unmarshal(inputBytes, &inputMessage); err != nil {
		return nil, err
	}
	config := service.GetConfig()
	for i := range config.Profiles {
		if config.Profiles[i].Name != inputMessage.Name {
			continue
		}
		profile := inputMessage.Profile
		config.Profiles[i] = inputMessage.Profile
		config.Profiles[i].CreatedAt = profile.CreatedAt
		config.Profiles[i].UpdatedAt = profile.UpdatedAt
	}
	service.SaveConfig()
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
	addProc("/profile/update", profileUpdate)
	addProc("/profile/delete", profileDelete)
}
