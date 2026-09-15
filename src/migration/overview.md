# V2 → V3 迁移总览

本文档概述从 Spring Boot 2（V2）迁移到 Spring Boot 3（V3）的主要变更和迁移路径。

## 背景

snz1 Java 框架从 V2（Spring Boot 2 + Java 8）迁移到 V3（Spring Boot 3 + Java 21），涉及 JDK 版本、依赖管理、API 变更等多方面调整。

## 主要变更

### 1. JDK 与运行时

| 项 | V2 | V3 |
|---|---|---|
| JDK | Java 8 | Java 21 |
| Spring Boot | 2.x | 3.x |
| Servlet API | `javax.servlet` | `jakarta.servlet` |
| 虚拟线程 | 不支持 | `spring.threads.virtual.enabled=true` |

### 2. 父 POM

| 项 | V2 | V3 |
|---|---|---|
| Parent | `com.snz1:spring-boot2-app` | `com.snz1:spring-boot3-app` |
| 版本 | `2.0.0-SNAPSHOT` | `3.0.0-SNAPSHOT` |

### 3. 命名空间迁移

| 变更项 | V2 | V3 |
|--------|-----|-----|
| Servlet | `javax.servlet.*` | `jakarta.servlet.*` |
| Persistence | `javax.persistence.*` | `jakarta.persistence.*` |
| Validation | `javax.validation.*` | `jakarta.validation.*` |
| Mail | `javax.mail.*` | `jakarta.mail.*` |
| OAuth2 | spring-security-oauth2 | spring-security-oauth2-authorization-server |

### 4. 依赖变更

详见 [依赖变更](./dependency-changes) 页面。

### 5. 配置变更

| 配置项 | V2 | V3 |
|--------|-----|-----|
| Redis 前缀 | `spring.redis.*` | `spring.data.redis.*` |
| 虚拟线程 | N/A | `spring.threads.virtual.enabled=true` |
| 优雅关机 | `server.shutdown=graceful` | 同 + `spring.lifecycle.timeout-per-shutdown-phase=30s` |
| Trailing slash | 默认允许 | `spring.mvc.pathmatch.match-trailing-slash=true` |

### 6. 新增特性

- **虚拟线程**：JDK 21 虚拟线程，提升高并发吞吐
- **OpenSearch 客户端**：独立的 `opensearch-cli` 模块
- **Elasticsearch Java API Client 8.x**：替代旧版 REST 客户端
- **SpringDoc OpenAPI**：替代 Swagger 2/SpringFox
- **统一配置中心**：`confserv` WebSocket + STOMP 动态配置推送
- **Caffeine 本地缓存**：替代 ehcache

## 迁移路径

### 模块迁移顺序

1. **父 POM**：`spring-boot3-app` 作为统一版本管理中心
2. **基础框架**：`utility-*` 系列模块（core/tools/config/security/data/mvc/redis）
3. **中间件**：`opensearch-cli`、`elasticsearch-cli`
4. **SDK**：`sc-client-api`、`admin-api`、`apihelper`
5. **业务服务**：`ssoserv`、`confserv`、`dashserv`、`workflow`、`uscapi`、`xeai-datasync-serv`

### 迁移步骤

1. 升级 JDK 到 21
2. 更新 parent POM 为 `spring-boot3-app:3.0.0-SNAPSHOT`
3. 全局替换 `javax.*` → `jakarta.*`（Servlet/Persistence/Validation/Mail）
4. 更新 Spring Security 配置（OAuth2 授权服务器迁移）
5. 更新 Redis 配置前缀
6. 添加虚拟线程和优雅关机配置
7. 替换 SpringFox → SpringDoc
8. 更新测试依赖（排除 objenesis）

## 兼容性说明

- `jdbcrest` 模块仍使用 Spring Boot 2 / Java 8，未迁移到 V3
- `spring-boot2-app` POM 保留，用于支持遗留模块
- OpenSAML 4.2.0 依赖 `javax.servlet` API，通过 `JavaxServletBridge` 桥接 `jakarta.servlet`
- `elasticsearch-cli` 复用 `opensearch.*` 配置前缀以兼容迁移
