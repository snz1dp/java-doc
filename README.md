# snz1-java-docs

snz1 Java 框架官方文档站，基于 [VitePress](https://vitepress.dev/) 构建。

## 本地开发

```bash
# 使用 nvm 切换 Node 20
nvm use 20

# 安装依赖
npm install

# 启动开发服务器
npm run docs:dev
```

访问 `http://localhost:5173` 预览文档。

## 构建

```bash
npm run docs:build
npm run docs:preview
```

## Docker 构建

```bash
make init    # 初始化依赖
make docs-build  # 构建静态文件
make build   # Docker 镜像构建
make push    # 推送镜像
make deploy  # 部署
```

## 文档结构

| 目录 | 内容 |
|------|------|
| `src/overview/` | 框架总览 |
| `src/framework/` | 基础框架（spring-boot3-app、utility 系列） |
| `src/middleware/` | 中间件（OpenSearch、Elasticsearch） |
| `src/sdk/` | SDK 库（sc-client-api、admin-api） |
| `src/best-practices/` | 业务服务最佳实践 |
| `src/migration/` | V2→V3 迁移指南 |
| `src/reference/` | FAQ 与变更日志 |
