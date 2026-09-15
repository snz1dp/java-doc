---
title: MVC 增强模块 utility-mvc
description: Web MVC 增强、全局错误处理、FreeMarker 模板支持、链路追踪
---

# utility-mvc MVC 增强模块

## 模块概述

`utility-mvc` 是 utility 框架的 Web MVC 增强模块，在 Spring Boot MVC 基础上提供全局错误处理、FreeMarker 模板渲染支持、链路追踪头注入和业务异常体系等能力。模块通过自动配置装配，开箱即用。

| 属性 | 值 |
|------|------|
| **groupId** | `com.snz1`（继承自 parent `utility`） |
| **artifactId** | `utility-mvc` |
| **version** | `3.0.0-SNAPSHOT` |
| **parent** | `com.snz1:utility:3.0.0-SNAPSHOT` |
| **描述** | MVC 增强模块：全局错误处理、模板支持、链路追踪 |

## 核心类

### WebMvcConfig

Web MVC 配置类，通过 `@Import` 引入三个 Spring Boot 自动配置类，完成 MVC 层增强装配：

```java
@Import({
    WebMvcAutoConfiguration.class,
    FreeMarkerAutoConfiguration.class,
    ErrorMvcAutoConfiguration.class
})
```

| 引入的自动配置 | 作用 |
|---------------|------|
| `WebMvcAutoConfiguration` | Spring MVC 基础配置，拦截器、消息转换器等 |
| `FreeMarkerAutoConfiguration` | FreeMarker 模板引擎自动配置 |
| `ErrorMvcAutoConfiguration` | 错误处理与错误页面自动配置 |

### DefaultErrorAttributes

全局错误属性处理器，实现 Spring Boot 的 `ErrorAttributes` 接口，统一格式化异常响应体。所有未捕获的异常经过此处理后，返回标准化的 JSON 错误结构：

```json
{
  "code": "ERROR_CODE",
  "message": "错误描述",
  "requestId": "请求追踪ID",
  "timestamp": "2026-09-15T10:05:44+08:00"
}
```

## @EnableWebMvc 注解

`@EnableWebMvc` 是模块提供的启用注解，标注在应用主类或配置类上，用于一键开启 MVC 增强能力：

```java
@EnableWebMvc
@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

该注解触发 `WebMvcConfig` 的装配，启用全局错误处理、FreeMarker 模板支持和链路追踪头注入。

## 业务异常体系

### JsonApiException

业务异常类，继承 `RuntimeException`，用于在业务逻辑中抛出带有错误码的异常。被 `DefaultErrorAttributes` 捕获后，自动转换为标准 JSON 错误响应：

```java
public class OrderService {

    public void cancelOrder(String orderId) {
        Order order = findById(orderId);
        if (order == null) {
            throw new JsonApiException(ErrorCodes.NOT_FOUND, "订单不存在: " + orderId);
        }
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new JsonApiException(ErrorCodes.BAD_REQUEST, "已完成的订单不可取消");
        }
        // 取消逻辑
    }
}
```

### ErrorCodes

错误码定义类，集中管理框架级和业务级错误码常量：

| 错误码 | 含义 |
|--------|------|
| `SUCCESS` | 请求成功 |
| `BAD_REQUEST` | 请求参数错误 |
| `UNAUTHORIZED` | 未认证 |
| `FORBIDDEN` | 无权限访问 |
| `NOT_FOUND` | 资源不存在 |
| `INTERNAL_ERROR` | 服务器内部错误 |

::: tip 扩展错误码
业务应用可继承 `ErrorCodes` 或自行定义错误码枚举，保持与框架错误码命名风格一致。
:::

## WebUtils 工具类

`WebUtils` 提供 Web 层通用工具方法，重点支持链路追踪头的注入与传递：

| 功能 | 说明 |
|------|------|
| `x-request-id` | 请求唯一标识，自动生成或从请求头透传，贯穿整个调用链路 |
| `x-trace-parent` | 链路追踪父级标识，支持分布式追踪上下文传递 |

```java
import com.snz1.utils.WebUtils;

// 获取当前请求 ID
String requestId = WebUtils.getRequestId();

// 获取链路追踪父级标识
String traceParent = WebUtils.getTraceParent();
```

::: tip 链路追踪集成
`x-request-id` 和 `x-trace-parent` 头在请求入口自动注入，并通过 `WebUtils` 在业务代码中随时获取。在服务间调用时，这些头会被自动透传到下游服务，实现全链路追踪。
:::

## AuthPlatform 认证平台枚举

`AuthPlatform` 枚举定义了框架支持的认证平台类型：

| 枚举值 | 说明 |
|--------|------|
| `LOCAL` | 本地认证（用户名/密码） |
| `SSO` | 单点登录 |
| `OAUTH2` | OAuth2 第三方授权 |
| `JWT` | JWT Token 认证 |

```java
import com.snz1.enums.AuthPlatform;

public class AuthService {

    public boolean validate(String token, AuthPlatform platform) {
        switch (platform) {
            case JWT:
                return validateJwt(token);
            case SSO:
                return validateSsoTicket(token);
            case LOCAL:
                return validateLocalCredentials(token);
            default:
                return false;
        }
    }
}
```

## 模块依赖

### 项目内依赖

| 依赖 | Scope | 说明 |
|------|--------|------|
| `utility-core` | `compile` | 基础接口契约、`WebAuthHeaderProvider` |
| `utility-tools` | `compile` | 通用工具类支持 |

### 第三方依赖

| 依赖 | 说明 |
|------|------|
| `spring-boot-starter-web` | Spring MVC 基础支持 |
| `freemarker` | FreeMarker 模板引擎 |
| `jackson-databind` | JSON 序列化 |

## 使用方式

### Maven 依赖引入

```xml
<dependency>
    <groupId>com.snz1</groupId>
    <artifactId>utility-mvc</artifactId>
    <version>3.0.0-SNAPSHOT</version>
</dependency>
```

::: warning 版本管理建议
`utility-mvc` 的版本由 parent `utility` BOM 统一管理。如果项目已继承 `utility` 作为 parent，则无需在子模块中显式指定 `<version>`。
:::

### 典型使用场景

#### 抛出业务异常

```java
import com.snz1.exception.JsonApiException;
import com.snz1.constants.ErrorCodes;

public class UserService {

    public User login(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new JsonApiException(ErrorCodes.UNAUTHORIZED, "用户不存在");
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new JsonApiException(ErrorCodes.UNAUTHORIZED, "密码错误");
        }
        return user;
    }
}
```

#### 使用 FreeMarker 模板

```java
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("username", "admin");
        return "dashboard"; // 渲染 templates/dashboard.ftl
    }
}
```

#### 获取链路追踪信息

```java
import com.snz1.utils.WebUtils;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/info")
    public Map<String, Object> info() {
        Map<String, Object> result = new HashMap<>();
        result.put("requestId", WebUtils.getRequestId());
        result.put("traceParent", WebUtils.getTraceParent());
        return result;
    }
}
```

## 版本信息

| 属性 | 值 |
|------|------|
| **当前版本** | `3.0.0-SNAPSHOT` |
| **Parent** | `com.snz1:utility:3.0.0-SNAPSHOT` |
| **模板引擎** | FreeMarker |
| **包前缀** | `com.snz1` |
