# ============================================================
# Stage 1: 构建文档站点（VitePress）
# 构建产物为纯静态文件，与架构无关；强制在构建机原生架构下执行，
# 避免在 Apple Silicon 上通过 QEMU 模拟 amd64 运行 esbuild 导致
# Go runtime lfstack.push 崩溃，同时大幅提升构建速度
# ============================================================
FROM --platform=$BUILDPLATFORM snz1.cn/base/node:20-alpine AS docs-build

WORKDIR /app
COPY . .

# vitepress 的 lastUpdated 需要调用 git 获取文件最后提交时间，alpine 基础镜像默认无 git
RUN apk add --no-cache git

RUN npm config set registry https://registry.npmmirror.com/
# 使用 npm ci 按 lock 文件干净安装，确保 esbuild 等原生依赖安装的是 linux/musl 平台二进制
# NODE_OPTIONS 提升堆上限，避免构建时内存不足导致 esbuild 子进程被杀（EPIPE）
RUN npm install && VITEPRESS_BASE_PATH=/snz1/java/docs/ npm run docs:build

# ============================================================
# Stage 2: 运行时（Nginx 静态托管）
# ============================================================
FROM snz1.cn/dp/vueapp:2.2

# Nginx 配置
ADD nginx/default.conf /etc/nginx/conf.d/

# 文档站点构建产物
COPY --from=docs-build /app/src/.vitepress/dist /app/html
