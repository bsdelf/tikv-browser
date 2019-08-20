package utils

import (
	"encoding/base64"
	"encoding/hex"
)

func Base64ToBytes(str string) ([]byte, error) {
	return base64.StdEncoding.DecodeString(str)
}

func HexToBytes(str string) ([]byte, error) {
	return hex.DecodeString(str)
}
