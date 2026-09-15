# 配置中心最佳实践

> 基于 `confserv` 模块，集群配置动态分发服务。

## 服务概览

| 项 | 内容 |
|---|---|
| **GroupId** | `api.gateway` |
| **ArtifactId** | `confserv` |
| **版本** | `3.0.0-SNAPSHOT` |
| **Parent** | `com.snz1:spring-boot3-app:3.0.0-SNAPSHOT` |
| **启动类** | `com.snz1.gateway.confserv.Application` |
| **上下文根** | `/appconfig` |
| **默认端口** | `8081`（dev/test），`80`（prod） |

## 核心架构

### 三层配置存储

```
CacheConfigurerProvider（缓存层）
  └── DAOConfigurerProvider（数据库层，MyBatis）
        └── SysPropertyMapper（SQL 映射，来自 apihelper）
```

- **缓存层**：Redis（集群）或 ehcache（单机），两级缓存：单条配置 + 列表缓存
- **数据库层**：PostgreSQL，表 `sys_properties`
- **自动建库**：`Initializer` 在 Spring Boot 启动早期通过 JDBC 直接 `CREATE DATABASE`

### 集群配置动态刷新

支持双模式，由 `spring.cache.type` 自动选择：

| 模式 | 条件 | 实现类 | 机制 |
|------|------|--------|------|
| **集群模式** | `spring.cache.type=redis` | `RedissonConfigurerBroadcaster` | Redisson `RTopic` 发布/订阅 |
| **单实例模式** | 其他 | `InnerConfigurerBroadcaster` | Spring `ApplicationEventPublisher` |

### 数据流

```
API 写入配置
  → ConfigurerChangeListener.onConfigurerUpdate()
  → 写入 Cache + DB
  → Redis Topic 广播（集群）或 进程内事件（单实例）
  → 各节点收到 → STOMP 广播
  → WebSocket 客户端实时收到配置变更
```

## WebSocket + STOMP 客户端推送

| 配置 | 值 |
|------|-----|
| STOMP 端点 | `/endpoint`（支持 SockJS） |
| 消息代理前缀 | `/sysproperties` |
| 心跳 | 25s |
| CORS | 全开 |
| 客户端标识 | 请求头 `WS-CONFIG-APPCODE` |

客户端连接后，连接/断开事件持久化到 `sys_sessions` 表。

## API 接口

### 配置管理（`/items`）

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/items` | 分页查询配置列表 | `appid`, `filter`, `offset`, `limit` |
| POST | `/items` | 创建配置项 | `code`(必填), `value`, `appid` |
| GET | `/items/{code}` | 获取单个配置 | `code`, `default`(缺省值) |
| POST/PATCH | `/items/{code}` | 设置/更新配置 | `code`, `value`(必填), `appid` |
| DELETE | `/items/{code}` | 删除配置 | `code` |

- 写入操作触发 `broadcastPropertyChanged()` → 集群广播 → WebSocket 客户端实时推送
- 返回格式统一使用 `Return<T>` 包装

### 版本信息

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/version` | 返回服务版本信息 |

## 关键配置

```properties
# 数据库
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.url=jdbc:postgresql://localhost:5432/conf
spring.datasource.auto.create=true

# 缓存
spring.cache.type=redis
spring.data.redis.host=localhost
spring.data.redis.database=2

# 虚拟线程
spring.threads.virtual.enabled=true

# 优雅关机
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s
```

## 多环境配置

| 配置项 | dev | test | prod |
|--------|-----|------|------|
| 端口 | 8081 | 8081 | 80 |
| 缓存 | redis | redis | redis |
| 日志级别 | DEBUG | DEBUG | INFO |

## 最佳实践

### 1. 客户端接入

```java
// WebSocket 连接
const socket = new SockJS('/appconfig/endpoint');
const stompClient = Stomp.over(socket);
stompClient.connect(
  { 'WS-CONFIG-APPCODE': 'my-app-code' },
  () => {
    stompClient.subscribe('/sysproperties', (message) => {
      const config = JSON.parse(message.body);
      // 处理配置变更
    });
  }
);
```

### 2. 集群部署

- 所有节点使用同一个 Redis 实例
- `spring.cache.type=redis` 确保集群模式
- `spring.data.redis.database` 保持一致

### 3. 配置命名规范

- 使用 `app.code` 区分不同应用
- 配置项 code 使用点分命名：`feature.subfeature.key`
- 敏感配置使用 Jasypt 加密
