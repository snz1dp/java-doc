---
title: 快速开始指南
description: 从零搭建一个基于 snz1 Java 框架的 Spring Boot 应用，涵盖环境要求、项目创建、最小可运行示例、常用注解速查与项目结构建议。
---

# 快速开始指南

本文以实战视角，手把手教你如何从零搭建一个基于 snz1 Java 框架的 Spring Boot 应用，涵盖环境准备、依赖引入、最小可运行示例和常用注解速查。

---

## 环境要求

在开始之前，请确保你的开发环境满足以下要求：

| 组件 | 最低版本 | 推荐版本 | 说明 |
|------|----------|----------|------|
| JDK | 21 | 21 (LTS) | 框架基于 Java 21 构建，低版本无法编译 |
| Maven | 3.8.0 | 3.9.x | 用于依赖管理与项目构建 |
| Spring Boot | 3.5.0 | 3.5.x | 父 POM `spring-boot3-app` 基于 Spring Boot 3.5.x |
| 数据库 | - | PostgreSQL 14+ | 可选，按需选择 MySQL / Oracle 等 |
| Redis | - | 6.x+ | 可选，使用缓存与分布式锁时需要 |

> **提示**：推荐使用 IntelliJ IDEA 2024.1+ 或 VS Code 配合 Java 扩展包进行开发。

### 验证环境

```bash
# 检查 JDK 版本
java -version
# 预期输出: openjdk version "21" ...

# 检查 Maven 版本
mvn -version
# 预期输出: Apache Maven 3.9.x ...
```

---

## 创建新项目

### 第 1 步：继承 spring-boot3-app 父 POM

在你的项目 `pom.xml` 中，将 `parent` 指向 `spring-boot3-app`：

```xml
<parent>
    <groupId>com.snz1</groupId>
    <artifactId>spring-boot3-app</artifactId>
    <version>3.0.0-SNAPSHOT</version>
    <relativePath/>
</parent>
```

> `spring-boot3-app` 父 POM 已经统一管理了 Spring Boot 版本、常用依赖版本和编译插件配置，继承后无需再手动指定 Spring Boot 版本号。

### 第 2 步：引入 utility-all 聚合包

`utility-all` 是框架的聚合依赖包，引入后自动传递以下核心模块：

| 模块 | 说明 |
|------|------|
| `utility-core` | 核心工具类、基础注解、通用异常处理 |
| `utility-web` | Web MVC 增强、全局异常处理、参数校验 |
| `utility-data` | 数据访问层：Druid 数据源、MyBatis 集成、自动建表 |
| `utility-security` | 安全认证：JWT、SSO 单点登录、Access Token |
| `utility-redis` | Redis 缓存、分布式锁、Spring Cache 集成 |

```xml
<dependencies>
    <!-- 引入聚合包，自动包含核心模块 -->
    <dependency>
        <groupId>com.snz1</groupId>
        <artifactId>utility-all</artifactId>
        <version>3.0.0-SNAPSHOT</version>
    </dependency>

    <!-- 数据库驱动（按需选择） -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>

    <!-- 测试依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

> **提示**：如果你只需要部分功能，也可以按需引入单独模块（如 `utility-web`、`utility-data`），而不引入 `utility-all` 聚合包。

### 第 3 步：创建启动类

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 第 4 步：创建 application.yml 配置

```yaml
spring:
  application:
    name: demo-app
  datasource:
    driver-class-name: org.postgresql.Driver
    url: jdbc:postgresql://localhost:5432/demo
    username: postgres
    password: 123456

server:
  port: 8080

# 日志配置
logging:
  level:
    com.snz1: DEBUG
    org.springframework.web: INFO
```

### 第 5 步：运行项目

```bash
# 在项目根目录执行
mvn spring-boot:run

# 或打包后运行
mvn clean package -DskipTests
java -jar target/demo-app.jar
```

启动成功后，访问 `http://localhost:8080` 即可看到应用响应。

---

## 最小可运行示例

下面是一个完整的最小可运行示例，包含启动类、配置文件和一个简单的 REST 接口。

### 项目结构

```
demo-app/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── com/example/demo/
        │       ├── Application.java          # 启动类
        │       └── controller/
        │           └── HelloController.java  # 示例接口
        └── resources/
            └── application.yml               # 配置文件
```

### Application.java

```java
package com.example.demo;

import com.snz1.annotation.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableWebMvc         // 启用 Web MVC 增强
@EnableDruid          // 启用 Druid 数据源
@EnableMyBatis        // 启用 MyBatis
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### HelloController.java

```java
package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/hello")
    public Map<String, Object> hello() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "Hello, snz1 Framework!");
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }
}
```

### application.yml

```yaml
spring:
  application:
    name: demo-app
  datasource:
    driver-class-name: org.postgresql.Driver
    url: jdbc:postgresql://localhost:5432/demo
    username: postgres
    password: 123456

server:
  port: 8080

logging:
  level:
    com.snz1: DEBUG
```

### 验证

```bash
# 启动应用后，执行以下命令验证
curl http://localhost:8080/api/hello

# 预期输出
# {"code":200,"message":"Hello, snz1 Framework!","timestamp":1700000000000}
```

---

## 常用注解速查表

框架提供了一系列 `@Enable*` 注解，用于按需启用各模块功能。在启动类上添加对应注解即可激活。

| 注解 | 所属模块 | 功能说明 | 是否默认启用 |
|------|----------|----------|-------------|
| `@EnableWebMvc` | utility-web | 启用 Web MVC 增强：全局异常处理、JSON 序列化优化、参数校验 | 否 |
| `@EnableMyBatis` | utility-data | 启用 MyBatis 集成：Mapper 扫描、分页插件、类型处理器 | 否 |
| `@EnableDruid` | utility-data | 启用 Druid 数据源：连接池、SQL 监控、慢 SQL 记录 | 否 |
| `@EnableAutoScheme` | utility-data | 启用自动建表与数据库版本管理 | 否 |
| `@EnableSecurity` | utility-security | 启用 Spring Security 安全认证：JWT 令牌、请求过滤 | 否 |
| `@EnableWebSso` | utility-security | 启用 SSO 单点登录：请求头认证、信任主机校验 | 否 |
| `@EnableAutoCaching` | utility-redis | 启用 Spring Cache 集成：`@Cacheable` / `@CacheEvict` 自动代理 | 否 |
| `@EnableDynamicConfig` | utility-core | 启用动态配置：运行时刷新配置项，无需重启 | 否 |
| `@EnableSocketServer` | utility-web | 启用 WebSocket 服务端：实时双向通信 | 否 |

### 使用示例

```java
// 典型 Web + 数据库应用
@EnableWebMvc
@EnableDruid
@EnableMyBatis
@SpringBootApplication
public class WebApp { ... }

// 带安全认证与 SSO 的应用
@EnableWebMvc
@EnableDruid
@EnableMyBatis
@EnableSecurity
@EnableWebSso
@SpringBootApplication
public class SecureApp { ... }

// 带缓存与分布式锁的应用
@EnableWebMvc
@EnableDruid
@EnableMyBatis
@EnableAutoCaching
@SpringBootApplication
public class CacheApp { ... }

// 全功能应用
@EnableWebMvc
@EnableDruid
@EnableMyBatis
@EnableAutoScheme
@EnableSecurity
@EnableWebSso
@EnableAutoCaching
@EnableDynamicConfig
@SpringBootApplication
public class FullApp { ... }
```

> **提示**：注解之间没有强依赖关系，可以自由组合。但 `@EnableWebSso` 通常需要配合 `@EnableSecurity` 使用。

---

## 项目结构建议

对于中大型项目，推荐以下目录结构：

```
my-app/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── com/example/myapp/
        │       ├── Application.java              # 启动类
        │       ├── config/                        # 配置类
        │       │   ├── WebConfig.java             # Web 相关配置
        │       │   └── SecurityConfig.java        # 安全配置
        │       ├── controller/                    # 控制层
        │       │   └── UserController.java
        │       ├── service/                       # 业务层
        │       │   ├── UserService.java
        │       │   └── impl/
        │       │       └── UserServiceImpl.java
        │       ├── mapper/                        # MyBatis Mapper
        │       │   └── UserMapper.java
        │       ├── model/                         # 数据模型
        │       │   ├── entity/
        │       │   │   └── User.java
        │       │   ├── dto/
        │       │   │   └── UserDTO.java
        │       │   └── vo/
        │       │       └── UserVO.java
        │       ├── common/                        # 公共组件
        │       │   ├── exception/                  # 自定义异常
        │       │   ├── interceptor/               # 拦截器
        │       │   └── utils/                     # 工具类
        │       └── enums/                         # 枚举
        │           └── UserStatus.java
        └── resources/
            ├── application.yml                    # 主配置
            ├── application-dev.yml                # 开发环境
            ├── application-prod.yml               # 生产环境
            ├── mapper/                            # MyBatis XML
            │   └── UserMapper.xml
            └── sql/                               # 数据库脚本
                ├── VERSION
                ├── CREATE_V1.SQL
                └── ...
```

### 分层职责说明

| 层级 | 包名 | 职责 |
|------|------|------|
| 表现层 | `controller` | 接收 HTTP 请求，参数校验，调用 Service，返回结果 |
| 业务层 | `service` | 核心业务逻辑，事务管理，调用 Mapper |
| 数据层 | `mapper` | 数据库访问，MyBatis 接口定义 |
| 模型层 | `model` | 实体类、DTO（数据传输对象）、VO（视图对象） |
| 配置层 | `config` | Spring 配置类、Bean 注册 |
| 公共层 | `common` | 异常定义、拦截器、工具类 |
| 枚举层 | `enums` | 业务枚举常量 |

> **提示**：Entity 对应数据库表结构，DTO 用于接口入参，VO 用于接口出参。不要将 Entity 直接返回给前端。

---

## 下一步指引

完成快速开始后，你可以继续阅读以下指南深入了解各模块：

| 指南 | 说明 |
|------|------|
| [数据库自动升级建表指南](./database-schema.md) | 使用 `@EnableAutoScheme` 实现自动建表与版本升级 |
| [安全认证与 SSO 单点登录指南](./security-sso.md) | 使用 `@EnableSecurity` 和 `@EnableWebSso` 实现 JWT 认证与 SSO |
| [缓存与分布式锁指南](./cache-lock.md) | 使用 `@EnableAutoCaching` 和 Redisson 实现缓存与分布式锁 |

> 如果你在搭建过程中遇到问题，请先检查：
> 1. JDK 版本是否为 21+
> 2. Maven 是否正确继承了 `spring-boot3-app` 父 POM
> 3. `utility-all` 依赖版本是否与父 POM 一致
> 4. 数据库连接信息是否正确
