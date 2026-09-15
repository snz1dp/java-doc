# 依赖变更

V2 → V3 迁移过程中的主要依赖变更清单。

## JDK 与构建

| 依赖 | V2 | V3 | 说明 |
|------|-----|-----|------|
| JDK | 8 | 21 | LTS 升级 |
| Maven Compiler | 1.8 | 21 | `maven.compiler.source/target` |
| Parent POM | `spring-boot2-app:2.0.0` | `spring-boot3-app:3.0.0` | 统一版本管理 |

## Spring 生态

| 依赖 | V2 | V3 | 说明 |
|------|-----|-----|------|
| Spring Boot | 2.x | 3.x | 主框架升级 |
| Spring Security | 5.x | 6.x | 安全框架升级 |
| Spring Security OAuth2 | spring-security-oauth2 | spring-security-oauth2-authorization-server | OAuth2 授权服务器迁移 |
| Spring Session | spring-session | spring-session-core + spring-session-data-redis | 拆分依赖 |
| SpringDoc | SpringFox (Swagger 2) | springdoc-openapi-starter-webmvc-ui | API 文档替代 |

## 命名空间迁移

| V2 (`javax.*`) | V3 (`jakarta.*`) | 说明 |
|----------------|-------------------|------|
| `javax.servlet` | `jakarta.servlet` | Servlet API |
| `javax.persistence` | `jakarta.persistence` | JPA |
| `javax.validation` | `jakarta.validation` | Bean Validation |
| `javax.mail` | `jakarta.mail` | 邮件 |
| `javax.annotation` | `jakarta.annotation` | 注解 |

## 数据访问

| 依赖 | V2 | V3 | 说明 |
|------|-----|-----|------|
| MyBatis | mybatis-spring-boot-starter | 同（版本升级） | ORM |
| PostgreSQL | 42.x | 同 | 驱动 |
| Druid | 1.2.x | 同 | 连接池 |
| Redis 前缀 | `spring.redis.*` | `spring.data.redis.*` | 配置前缀变更 |
| Redisson | redisson-spring-boot-starter | 同 | 分布式锁/缓存 |

## 搜索引擎

| 依赖 | V2 | V3 | 说明 |
|------|-----|-----|------|
| OpenSearch | N/A | `opensearch-cli:3.0.0` | 新增独立模块 |
| Elasticsearch | REST High Level Client | Java API Client 8.18.8 | 客户端升级 |
| 配置前缀 | `elasticsearch.*` | `opensearch.*`（兼容） | 前缀统一 |

## 安全与加密

| 依赖 | V2 | V3 | 说明 |
|------|-----|-----|------|
| OpenSAML | 3.x | 4.2.0 | SAML 库升级 |
| Bouncy Castle | bcprov-jdk15on | bcpkix-jdk18on:1.79 | 安全库升级 |
| Jasypt | jasypt-spring-boot | 同 3.0.4 | 配置加密 |
| Caffeine | ehcache | caffeine | 本地缓存替代 |

## 工具库

| 依赖 | V2 | V3 | 说明 |
|------|-----|-----|------|
| Lombok | 同 | 同 | 简化代码 |
| commons-lang3 | 同 | 同 | 工具类 |
| Guava | 旧版 | 32.0.1-jre | 版本升级 |
| fastjson | fastjson | **已移除** | 统一使用 Jackson |
| commons-logging | commons-logging | **已移除** | 统一使用 spring-jcl |

## 新增依赖

| 依赖 | 版本 | 说明 |
|------|------|------|
| `spring-boot-starter-websocket` | Spring Boot 3 | WebSocket 支持 |
| `org.java-websocket:Java-WebSocket` | 1.5.3 | WebSocket 客户端 |
| `springdoc-openapi-starter-webmvc-ui` | Spring Boot 3 | OpenAPI 文档 |
| `swagger-annotations-jakarta` | Jakarta | Swagger 注解 |
| `retrofit` | 2.11.0 | HTTP 客户端 |
| `converter-jackson` | 2.11.0 | Retrofit JSON 转换 |
| `fastjson2` | 2.0.58 | JSON 处理（workflow） |
| `hutool-all` | 5.8.x | 工具库（workflow/datasync） |
| `spring-kafka` | Spring Boot 3 | Kafka 消费（datasync） |

## 移除/替代

| V2 依赖 | V3 替代 | 说明 |
|---------|---------|------|
| `fastjson` | Jackson | 安全漏洞，统一使用 Jackson |
| `commons-logging` | spring-jcl | 与 spring-jcl 冲突 |
| `commons-collections 3.x` | `commons-collections4:4.4` | 安全漏洞修复 |
| `SpringFox` | `springdoc-openapi` | Swagger 2 → OpenAPI 3 |
| `ehcache` | `caffeine` | 本地缓存替代 |
| `bcprov-jdk15on` | `bcpkix-jdk18on` | Bouncy Castle 升级 |
| `joda-time` | `java.time` | JDK 8+ 时间 API |
