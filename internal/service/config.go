package service

import (
	"io/ioutil"
	"os"
	"os/user"
	"path"

	"gopkg.in/yaml.v2"
)

type Config struct {
	Version  int             `yaml:"version" json:"version" msgpack:"version"`
	Address  string          `yaml:"address" json:"address" msgpack:"address"`
	Profiles []ConfigProfile `yaml:"profiles" json:"profiles" msgpack:"profiles"`
}

type ProfileTag struct {
	Name  string `yaml:"name" json:"name" msgpack:"name"`
	Color string `yaml:"color" json:"color" msgpack:"color"`
}

type ConfigProfile struct {
	Name      string       `yaml:"name" json:"name" msgpack:"name"`
	Tags      []ProfileTag `yaml:"tags" json:"tags" msgpack:"tags"`
	Endpoints []string     `yaml:"endpoints" json:"endpoints" msgpack:"endpoints"`
	CreatedAt *int64       `yaml:"createdAt" json:"createdAt" msgpack:"createdAt"`
	UpdatedAt *int64       `yaml:"updatedAt" json:"updatedAt" msgpack:"updatedAt"`
}

var (
	config        Config
	getConfigPath func() string
)

const (
	configPerm           = 0600
	configName           = ".tikv-browser"
	configDefaultContent = `version: 1
address: ":3000"
profiles:
  - name: "tikv@localhost"
    tags:
	  - name: "localhost"
	    color: ""
    endpoints:
      - "localhost:2379"
`
)

func init() {
	getConfigPath = func() string {
		me, err := user.Current()
		if err != nil {
			GetLogger().Panic(err)
		}
		return path.Join(me.HomeDir, configName)
	}
}

func GetConfig() *Config {
	return &config
}

func InitConfig() {
	configPath := getConfigPath()
	if _, err := os.Stat(configPath); err != nil {
		if !os.IsNotExist(err) {
			GetLogger().Panic(err)
		}
		GetLogger().Info("create default config: ", configPath)
		bytes := []byte(configDefaultContent)
		if err := ioutil.WriteFile(configPath, bytes, configPerm); err != nil {
			GetLogger().Panic(err)
		}
	}
	if err := LoadConfig(); err != nil {
		GetLogger().Panic(err)
	}
}

func LoadConfig() error {
	configPath := getConfigPath()
	bytes, err := ioutil.ReadFile(configPath)
	if err != nil {
		return err
	}
	if err := yaml.Unmarshal(bytes, &config); err != nil {
		return err
	}
	return nil
}

func SaveConfig() error {
	bytes, err := yaml.Marshal(&config)
	if err != nil {
		return err
	}
	configPath := getConfigPath()
	return ioutil.WriteFile(configPath, bytes, configPerm)
}
