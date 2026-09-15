# 常见问题

V2 → V3 迁移和日常开发中的常见问题与解决方案。

## 构建相关

### Q: `npm run docs:build` 报 SyntaxError `??=`

**原因**：默认 Node.js v14 不支持逻辑赋值运算符（`??=`）。

**解决**：切换到 Node.js v22。

```bash
nvm use 22
npm run docs:build
```

### Q: Maven 编译报 `javax.servlet` 找不到

**原因**：Spring Boot 3 迁移到 `jakarta.servlet`，但 OpenSAML 4.2.0 仍依赖 `javax.servlet`。

**解决**：在 pom.xml 中保留 `javax.servlet-api` 为 `provided` scope，运行时通过 `JavaxServletBridge` 桥接。

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>4.0.1</version>
    <scope>provided</scope>
</dependency>
```

### Q: Maven 测试报 `objenesis` 冲突

**解决**：在 `spring-boot-starter-test` 中排除 objenesis。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
    <exclusions>
        <exclusion>
            <groupId>org.objenesis</groupId>
            <artifactId>objenesis</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

## 配置相关

### Q: Redis 连接失败，配置前缀不识别

**原因**：Spring Boot 3 将 Redis 配置前缀从 `spring.redis.*` 改为 `spring.data.redis.*`。

**解决**：

```properties
# V2（旧）
spring.redis.host=localhost
spring.redis.port=6379

# V3（新）
spring.data.redis.host=localhost
spring.data.redis.port=6379
```

### Q: `spring.cache.type=ehcache` 不生效

**原因**：V3 使用 Caffeine 替代 ehcache，但兼容旧值。

**解决**：配置 `spring.cache.type=caffeine` 或 `spring.cache.type=redis`，`ehcache` 值会自动映射到 caffeine。

### Q: SSO 请求头模拟不生效

**原因**：开发环境需要模拟 SSO 请求头。

**解决**：

```properties
spring.security.ssoheader=true
spring.security.ssoheader.simulate=true
spring.security.ssoheader.test-user=root
```

生产环境务必设置 `simulate=false`。

## 依赖相关

### Q: `admin-api` 的 groupId 不是 `com.snz1`

**说明**：`admin-api` 的 groupId 是 `api.gateway`，不是 `com.snz1`。

```xml
<dependency>
    <groupId>api.gateway</groupId>
    <artifactId>admin-api</artifactId>
    <version>3.0.0-SNAPSHOT</version>
</dependency>
```

### Q: `elasticsearch-cli` 配置前缀是 `opensearch.*`

**说明**：`elasticsearch-cli` 故意复用 `opensearch.*` 配置前缀，以便从 OpenSearch 平滑迁移到 Elasticsearch。

### Q: `jdbcrest` 仍使用 Spring Boot 2

**说明**：`jdbcrest` 是遗留模块，基于 Spring Boot 2 / Java 8，未迁移到 V3。使用时需注意版本差异。

## 运行时相关

### Q: 虚拟线程不生效

**检查**：

1. 确认 JDK 版本 ≥ 21
2. 配置 `spring.threads.virtual.enabled=true`
3. Tomcat 请求处理线程自动使用虚拟线程

### Q: confserv WebSocket 客户端收不到配置变更

**排查**：

1. 确认 `spring.cache.type=redis`（集群模式）
2. 确认 Redis 连接正常
3. 确认客户端请求头 `WS-CONFIG-APPCODE` 已设置
4. 确认订阅了 `/sysproperties` Topic
5. 确认 STOMP 端点 `/endpoint` 可达

### Q: workflow 回调失败

**排查**：

1. 检查 `callbackStatus` 是否为 `3`（失败）
2. 确认 `gate.url` 可达
3. 等待定时任务重试（每 5 分钟）
4. 最多重试 3 次，超过后标记 `2`（耗尽）

### Q: xeai-datasync-serv Kafka 消费不启动

**排查**：

1. 确认通道 `enabled=true`
2. 确认 Kafka bootstrap servers 可达
3. 确认 `datasync.deltas[0].mq-type=kafka`
4. 检查 `ChannelAutoConfiguration` 初始化日志
