# 变更日志

## V3.0.0 (2026-09)

### 框架升级

- 升级 JDK 8 → 21，启用虚拟线程
- 升级 Spring Boot 2 → 3
- 迁移 `javax.*` → `jakarta.*` 命名空间
- 升级 Spring Security 5 → 6
- 迁移 OAuth2 授权服务器到 `spring-security-oauth2-authorization-server`

### 新增模块

- `opensearch-cli`：OpenSearch 客户端自动配置（2.19.6）
- `elasticsearch-cli`：Elasticsearch Java API Client（8.18.8）
- `confserv`：集群配置中心，WebSocket + STOMP 动态推送
- `xeai-datasync-serv`：组织人员数据同步服务

### 依赖变更

- 移除 `fastjson`，统一使用 Jackson
- 移除 `commons-logging`，统一使用 spring-jcl
- 替换 `commons-collections 3.x` → `commons-collections4:4.4`
- 替换 SpringFox → springdoc-openapi
- 替换 ehcache → Caffeine
- 升级 Bouncy Castle → `bcpkix-jdk18on:1.79`
- 升级 OpenSAML → 4.2.0
- 升级 Guava → 32.0.1-jre

### 新特性

- 虚拟线程支持（`spring.threads.virtual.enabled=true`）
- 优雅关机（`server.shutdown=graceful`）
- 统一配置中心动态推送
- OpenSearch/Elasticsearch 双搜索引擎支持
- Caffeine 本地缓存
- SpringDoc OpenAPI 文档

### 配置变更

- Redis 配置前缀 `spring.redis.*` → `spring.data.redis.*`
- 新增 `spring.threads.virtual.enabled`
- 新增 `spring.lifecycle.timeout-per-shutdown-phase`

### 兼容性

- `jdbcrest` 保留 Spring Boot 2 / Java 8
- `spring-boot2-app` POM 保留
- `elasticsearch-cli` 复用 `opensearch.*` 配置前缀
- OpenSAML 通过 `JavaxServletBridge` 桥接 javax/jakarta

---

## V2.0.0

- 基于 Spring Boot 2 + Java 8
- 使用 `javax.*` 命名空间
- SpringFox Swagger 2 文档
- ehcache 本地缓存
- fastjson JSON 处理
