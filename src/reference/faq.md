---
title: 常见问题 FAQ
description: utility 框架使用过程中的常见问题与解答
---

# 常见问题 FAQ

## 环境相关

### Q: utility 框架需要哪个版本的 JDK？

utility 框架 3.0.0 要求 **JDK 21** 及以上版本。建议使用 LTS 版本避免兼容性问题。可通过以下命令检查当前 JDK 版本：

```bash
java -version
```

如果版本低于 21，请下载安装 [JDK 21](https://adoptium.net/) 或使用版本管理工具切换：

```bash
# 使用 sdkman 切换
sdk install java 21.0.3-tem
sdk use java 21.0.3-tem
```

### Q: 构建文档站需要什么版本的 Node.js？

构建 VitePress 文档站需要 **Node.js v22+**。低版本 Node.js 可能导致依赖安装失败或构建报错。

```bash
node -v  # 确认版本 >= v22
```

如需升级 Node.js：

```bash
# 使用 nvm 切换
nvm install 22
nvm use 22
```

### Q: Maven 构建需要哪个版本？

建议使用 **Maven 3.8+**，配合 JDK 21 使用。可通过 `mvn -v` 检查版本。

## 依赖相关

### Q: 编译时报 `javax.servlet` 找不到怎么办？

utility 框架 3.0.0 已迁移到 **Jakarta EE** 命名空间，`javax.servlet` 被替换为 `jakarta.servlet`。如果项目中仍引用了旧版 `javax.servlet` 依赖，需要：

1. 移除旧的 `javax.servlet` 依赖
2. 确保 Spring Boot 版本为 3.x（已使用 Jakarta 命名空间）

```xml
<!-- 移除旧依赖 -->
<!--
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
</dependency>
-->

<!-- Spring Boot 3.x 已内置 Jakarta Servlet -->
<dependency>
    <groupId>jakarta.servlet</groupId>
    <artifactId>jakarta.servlet-api</artifactId>
    <scope>provided</scope>
</dependency>
```

### Q: Jakarta 命名空间迁移有哪些影响？

从 `javax.*` 到 `jakarta.*` 的迁移影响所有 Jakarta EE 相关 API，包括 Servlet、JPA、Validation、WebSocket 等。主要变更：

| 旧包名 | 新包名 |
|--------|--------|
| `javax.servlet` | `jakarta.servlet` |
| `javax.persistence` | `jakarta.persistence` |
| `javax.validation` | `jakarta.validation` |
| `javax.annotation` | `jakarta.annotation` |

需要将所有 `import javax.*` 替换为 `import jakarta.*`。第三方库也需升级到支持 Jakarta 命名空间的版本。

### Q: 引入 utility-all 后出现依赖冲突怎么办？

使用 `mvn dependency:tree` 检查冲突的传递依赖，然后按需排除或改为按需引入子模块。详见 [utility-all 文档](./framework/utility-all.md#依赖冲突排查)。

## 配置相关

### Q: 如何覆盖 utility 框架的默认配置？

utility 框架的配置遵循 Spring Boot 约定优于配置原则。覆盖方式按优先级从高到低：

1. **命令行参数**：`--spring.data.redis.host=10.0.0.1`
2. **环境变量**：`SPRING_DATA_REDIS_HOST=10.0.0.1`
3. **应用配置文件**：`application.yml` / `application.properties`
4. **框架默认配置**：`snz1-app.properties`

### Q: `snz1-app.properties` 的加载顺序是什么？

`snz1-app.properties` 是 utility 框架的默认配置文件，加载顺序如下：

1. 框架内置的 `snz1-app.properties`（JAR 包内，最低优先级）
2. classpath 根目录的 `snz1-app.properties`（覆盖框架默认）
3. `application.yml` / `application.properties`（覆盖上述配置）
4. 命令行参数 / 环境变量（最高优先级）

::: tip
应用自定义配置始终覆盖框架默认配置。框架默认配置仅提供合理初始值，无需手动修改。
:::

## 安全相关

### Q: SSO 信任主机如何配置？

SSO 信任主机通过以下配置项指定，多个主机用逗号分隔：

```yaml
snz1:
  security:
    sso:
      trusted-hosts: sso.example.com,auth.example.com
```

只有信任主机发起的 SSO 请求才会被接受，防止伪造 SSO 票据。

### Q: JWT 密钥如何管理？

JWT 密钥通过以下配置项设置：

```yaml
snz1:
  security:
    jwt:
      secret: ${JWT_SECRET}  # 建议通过环境变量注入
      expiration: 86400000   # 过期时间（毫秒），默认 24 小时
```

::: warning 安全建议
- **生产环境**必须通过环境变量或密钥管理服务注入密钥，禁止硬编码在配置文件中
- 密钥长度建议不少于 256 位（32 字节）
- 定期轮换密钥，轮换时需兼容旧 Token 的验证期
:::

## 数据库相关

### Q: Schema 自动升级失败如何排查？

utility 框架支持 Flyway 自动 Schema 升级。排查步骤：

1. **检查日志**：查看 Flyway 报错信息，常见原因包括 SQL 语法错误、权限不足
2. **检查版本号**：确保迁移脚本版本号连续递增，无跳跃或重复
3. **检查权限**：数据库用户需要有 DDL 权限（CREATE、ALTER 等）
4. **手动执行**：尝试手动执行报错的 SQL，确认语法正确

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true  # 已有数据库时自动建立基线
```

### Q: 多个服务共用同一个数据库可以吗？

可以，但需要注意：

- **Schema 隔离**：建议每个服务使用独立的 Schema 或表前缀
- **Flyway 迁移**：多服务共用数据库时，避免迁移脚本冲突。建议每个服务管理自己的迁移目录
- **连接池**：合理配置连接池大小，避免多服务争抢连接

::: warning
不推荐多服务共用同一张表。如必须共用，需在应用层做好并发控制和数据一致性保障。
:::

## 部署相关

### Q: Docker 容器化部署有什么注意事项？

**JDK 镜像选择**：

```dockerfile
# 推荐 Eclipse Temurin JDK 21
FROM eclipse-temurin:21-jre-alpine
```

**时区设置**：

```dockerfile
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
```

**JVM 参数建议**：

```dockerfile
# 容器感知的 JVM 参数
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"
```

**健康检查**：

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1
```

**端口暴露**：

```yaml
# 如果使用了 utility-websocket，需额外暴露 WebSocket 端口
ports:
  - "8080:8080"    # HTTP
  - "9092:9092"    # WebSocket（如有）
```

::: tip Docker Compose 示例

```yaml
services:
  app:
    image: my-app:latest
    environment:
      - SPRING_DATA_REDIS_HOST=redis
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/myapp
      - JWT_SECRET=your-secret-key
      - TZ=Asia/Shanghai
    ports:
      - "8080:8080"
      - "9092:9092"
    depends_on:
      - redis
      - db
    deploy:
      resources:
        limits:
          memory: 512M
```
:::
