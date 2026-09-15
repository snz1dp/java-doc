.PHONY:

export SHELL:=/bin/bash

OS := $(shell uname | awk '{print tolower($$0)}')
ROOT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
SNZ1DPCTL_BIN = $(shell which snz1dpctl)

# 显示信息
debug:
	@echo OS=$(OS)
	@echo ROOT_DIR=$(ROOT_DIR)
	@echo SNZ1DP_CTL=$(SNZ1DPCTL_BIN)

# 初始化
init:
	bash -c ". ~/.nvm/nvm.sh && nvm use 20 && npm i"

# ============================================================
# 文档站点
# ============================================================

# 文档开发模式（本地预览）
docs-dev:
	bash -c ". ~/.nvm/nvm.sh && nvm use 20 && npm run docs:dev"

# 文档构建
docs-build:
	bash -c ". ~/.nvm/nvm.sh && nvm use 20 && npm run docs:build"

# 文档构建预览
docs-preview:
	bash -c ". ~/.nvm/nvm.sh && nvm use 20 && npm run docs:preview"

# ============================================================
# snz1dpctl 组件构建与发布
# ============================================================

# 使用 snz1dpctl 构建镜像
build:
	snz1dpctl make docker

# 使用 snz1dpctl 推送镜像
push:
	snz1dpctl make docker --push

# 使用 snz1dpctl 部署组件
deploy:
	snz1dpctl make deploy

# 使用 snz1dpctl 构建并推送
release:
	snz1dpctl make publish

# ============================================================
# 清理
# ============================================================

# 清理上下文内容
clean:
	- rm -rf out
	- snz1dpctl make clean

# 清理所有内容（包括依赖）
clean-all: clean
	- snz1dpctl make standalone clean
	- snz1dpctl standalone clean all --really
