PROJECT_NAME ?= tikv-browser
STAGING_DIR ?= ./staging

GOLANG_IMAGE ?= ${PROJECT_NAME}-golang:latest
RELEASE_IMAGE ?= ${PROJECT_NAME}:latest

BUILD_ARG_HTTP_PROXY ?= $(if ${http_proxy},--build-arg http_proxy=${http_proxy},)
BUILD_ARG_HTTPS_PROXY ?= $(if ${https_proxy},--build-arg https_proxy=${https_proxy},)
BUILD_ARG_PROXY = ${BUILD_ARG_HTTP_PROXY} ${BUILD_ARG_HTTPS_PROXY}

CGO_ENABLED ?= 0
export CGO_ENABLED := ${CGO_ENABLED}

.PHONY: all
all: server web

.PHONY: server
server:
	go build -mod=vendor -v -o ${STAGING_DIR}/server ./cmd/server

.PHONY: test
test:
	go test -v -cover ./...

.PHONY: web
web:
	npm run --prefix web build

.PHONY: clean
clean:
	rm -rf ${STAGING_DIR}
	rm -rf web/build
	go clean -cache ./cmd/server

.PHONY: base-image
base-image:
	docker build -t ${GOLANG_IMAGE} -f docker/golang.Dockerfile ${BUILD_ARG_PROXY} .

.PHONY: release-image
release-image:
	docker build -t ${RELEASE_IMAGE} -f docker/release.Dockerfile ${BUILD_ARG_PROXY} .

.PHONY: image
image: base-image release-image
