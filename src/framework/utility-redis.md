---
title: 缓存模块 utility-redis
description: 基于 Redisson 的 Redis 客户端自动配置，提供分布式缓存和分布式锁能力
---

# utility-redis 缓存模块

## 模块概述

`utility-redis` 是 utility 框架的缓存模块，基于 Redisson 实现 Redis 客户端的自动配置，为应用提供分布式缓存和分布式锁能力。模块支持单机、哨兵、集群三种 Redis 部署模式，开箱即用。

| 属性 | 值 |
|------|------|
| **groupId** | `com.snz1`（继承自 parent `utility`） |
| **artifactId** | `utility-redis` |
| **version** | `3.0.0-SNAPSHOT` |
| **parent** | `com.snz1:utility:3.0.0-SNAPSHOT` |
| **描述** | 缓存模块：Redisson 自动配置、分布式缓存、分布式锁 |

## 核心类

### RedissonConfig

Redisson 自动配置类，标注 `@AutoConfiguration`，根据 `spring.data.redis.*` 配置自动创建 Redisson 客户端实例。支持三种部署模式：

| 模式 | 配置前缀 | 说明 |
|------|----------|------|
| **单机** | `spring.data.redis.host` / `spring.data.redis.port` | 单节点 Redis |
| **哨兵** | `spring.data.redis.sentinel.*` | 哨兵集群高可用 |
| **集群** | `spring.data.redis.cluster.*` | Redis Cluster 分片集群 |

::: tip 自动模式选择
`RedissonConfig` 会根据配置项自动判断部署模式：检测到 `sentinel` 配置时使用哨兵模式，检测到 `cluster` 配置时使用集群模式，否则默认使用单机模式。
:::

### CacheConfig

缓存配置类，创建 `RedissonSpringCacheManager` Bean，将 Redisson 客户端与 Spring Cache 抽象集成。通过 `@Cacheable`、`@CacheEvict` 等注解即可透明使用 Redis 作为缓存后端。

### RedissonRLockGuarder

分布式锁守卫实现，基于 Redisson 的 `RLock` 实现 `utility-core` 中定义的 `GLockGuarder` 接口，提供跨节点的分布式锁能力。

```java
import com.snz1.concurrent.GLockGuarder;

public class StockService {

    private final GLockGuarder lockGuarder;

    public StockService(GLockGuarder lockGuarder) {
        this.lockGuarder = lockGuarder;
    }

    public void deductStock(String sku, int qty) {
        GLock lock = lockGuarder.acquire("stock:lock:" + sku);
        try {
            // 安全扣减库存
        } finally {
            lockGuarder.release(lock);
        }
    }
}
```

## @EnableAutoCaching 注解

`@EnableAutoCaching` 是模块提供的启用注解，标注在应用主类或配置类上，用于一键开启分布式缓存能力：

```java
@EnableAutoCaching
@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

该注解会触发 Redisson 自动配置和 Spring Cache 管理器的装配。

## 配置项

所有配置项以 `spring.data.redis` 为前缀，遵循 Spring Boot 标准命名约定：

### 单机模式

```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      password: yourpassword
      database: 0
```

### 哨兵模式

```yaml
spring:
  data:
    redis:
      password: yourpassword
      sentinel:
        master: mymaster
        nodes: 192.168.1.10:26379,192.168.1.11:26379,192.168.1.12:26379
```

### 集群模式

```yaml
spring:
  data:
    redis:
      password: yourpassword
      cluster:
        nodes: 192.168.1.10:6379,192.168.1.11:6379,192.168.1.12:6379
        max-redirects: 3
```

## 模块依赖关系

### 项目内依赖

| 依赖 | Scope | 说明 |
|------|--------|------|
| `utility-core` | `compile` | 提供 `GLockGuarder` 接口契约 |
| `utility-data` | `compile`（可选） | 提供 `DaoGLockGuarder` 作为数据库降级实现 |

::: tip 锁守卫优先级
当 `utility-redis` 存在时，`RedissonRLockGuarder` 作为优先实现注册；当 Redis 不可用时，可降级为 `utility-data` 提供的 `DaoGLockGuarder`（基于数据库行锁）。
:::

### 模块关系图

```mermaid
graph TD
    UC["utility-core<br/>GLockGuarder 接口"] --> UR["utility-redis<br/>RedissonRLockGuarder"]
    UD["utility-data<br/>DaoGLockGuarder 降级"] -.->|可选降级| UR
    UCfg["utility-config<br/>CacheConfigurerProvider"] -->|@Cacheable| UR
```

## 与 utility-config 的集成

`utility-config` 模块中的 `CacheConfigurerProvider` 实现了 `ConfigurerProvider` 接口，通过 `@Cacheable` 注解将配置数据缓存到 Redis 中，减少重复配置读取开销。当 `utility-redis` 存在时，配置缓存自动使用 Redisson 作为后端；当 `utility-redis` 不存在时，回退到本地缓存。

## 使用方式

### Maven 依赖引入

```xml
<dependency>
    <groupId>com.snz1</groupId>
    <artifactId>utility-redis</artifactId>
    <version>3.0.0-SNAPSHOT</version>
</dependency>
```

::: warning 版本管理建议
`utility-redis` 的版本由 parent `utility` BOM 统一管理。如果项目已继承 `utility` 作为 parent，则无需在子模块中显式指定 `<version>`。
:::

### 典型使用场景

#### 使用 @Cacheable 注解缓存方法结果

```java
import org.springframework.cache.annotation.Cacheable;

public class UserService {

    @Cacheable(value = "users", key = "#userId")
    public User getUserById(String userId) {
        // 数据库查询
        return userRepository.findById(userId);
    }
}
```

#### 使用分布式锁

```java
import com.snz1.concurrent.GLockGuarder;

public class PaymentService {

    private final GLockGuarder lockGuarder;

    public PaymentService(GLockGuarder lockGuarder) {
        this.lockGuarder = lockGuarder;
    }

    public void processPayment(String orderId) {
        GLock lock = lockGuarder.acquire("payment:lock:" + orderId);
        try {
            // 支付处理逻辑
        } finally {
            lockGuarder.release(lock);
        }
    }
}
```

## 版本信息

| 属性 | 值 |
|------|------|
| **当前版本** | `3.0.0-SNAPSHOT` |
| **Parent** | `com.snz1:utility:3.0.0-SNAPSHOT` |
| **底层框架** | Redisson |
| **包前缀** | `com.snz1` |
