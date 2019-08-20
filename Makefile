PROJECT_NAME ?= tikv-browser
STAGING_DIR ?= ./staging

BUILD_IMAGE ?= ${PROJECT_NAME}-build:latest
RUN_IMAGE ?= ${PROJECT_NAME}-run:latest
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
	go build -v -mod=vendor -o ${STAGING_DIR}/server ./cmd/server

.PHONY: test
test:
	go test -v -cover ./...

.PHONY: web
web:
	npm run --prefix web build

.PHONY: staging
staging: server web

.PHONY: clean
clean:
	rm -rf ${STAGING_DIR}
	rm -rf web/build
	go clean -cache ./cmd/server

.PHONY: build-image
build-image:
	docker build -t ${BUILD_IMAGE} -f docker/build.Dockerfile ${BUILD_ARG_PROXY} .

.PHONY: run-image
run-image:
	docker build -t ${RUN_IMAGE} -f docker/run.Dockerfile ${BUILD_ARG_PROXY} .

.PHONY: image
image: build-image run-image
