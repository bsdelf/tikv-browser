package service

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func init() {
	InitLogger()
	getConfigPath = func() string {
		return configName
	}
}

func TestConfig(t *testing.T) {
	t.Run("Get", func(t *testing.T) {
		assert.NotNil(t, GetConfig())
	})

	t.Run("InitWithoutConfigFile", func(t *testing.T) {
		configPath := getConfigPath()

		os.Remove(configPath)
		defer os.Remove(configPath)
		InitConfig()

		assert.Nil(t, func() error {
			_, err := os.Stat(configPath)
			return err
		}())
		assert.Equal(t, 1, GetConfig().Version)
	})

	t.Run("InitWithExistingConfigFile", func(t *testing.T) {
		configPath := getConfigPath()

		os.Remove(configPath)
		defer os.Remove(configPath)
		InitConfig()
		GetConfig().Version = 0
		assert.Nil(t, SaveConfig())

		InitConfig()
		assert.Equal(t, 0, GetConfig().Version)
	})
}
