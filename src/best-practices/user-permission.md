# 用户权限管理最佳实践

> 基于 `uscapi`（artifactId: `upmserv`）模块，统一身份认证平台管理面板。

## 服务概览

| 项 | 内容 |
|---|---|
| **GroupId** | `api.gateway` |
| **ArtifactId** | `upmserv` |
| **版本** | `3.0.0-SNAPSHOT` |
| **Parent** | `com.snz1:spring-boot3-app:3.0.0-SNAPSHOT` |
| **启动类** | `com.snz1.gateway.upmserv.Application` |
| **上下文根** | `/user/security/center/dashboard/api` |
| **默认端口** | `8089`（dev/test），`80`（prod） |

## 核心模型

权限管理模型由 `sc-client-api` SDK 提供，`uscapi` 作为管理接口层。

| 概念 | 类 | 说明 |
|------|---|------|
| 用户 | `User` | 支持 id/uname/mobi/email/code/idcard/empid 多种标识 |
| 角色 | `Role` | 权限代码实体，关联 appid |
| 功能节点 | `FunctionNode` / `FunctionTreeNode` | 功能树（app→function→action） |
| 部门 | `Department` | 组织机构部门 |
| 职位 | `Position` | 岗位职位 |
| 组织域 | `UserScope` | 组织域/租户隔离 |
| 第三方用户 | `ThirdPartyUser` | 第三方平台关联用户 |

## 启动注解

```java
@EnableAspectJAutoProxy(proxyTargetClass = true)
@SpringBootApplication
@com.snz1.annotation.EnableAutoCaching    // 缓存
@com.snz1.annotation.EnableWebMvc          // MVC
@com.snz1.annotation.EnableSecurity       // 安全权限
@com.snz1.annotation.EnableWebSso         // 单点登录
@com.snz1.annotation.EnableMyBatis        // MyBatis
@com.snz1.gateway.sc.EnableSecurityClient // 安全客户端
```

## 权限控制

### Spring Security `@PreAuthorize`

角色命名约定：`usc_dashboard_<模块>_<操作>`

| 角色 | 说明 |
|------|------|
| `usc_dashboard_organization_users_newperson` | 创建用户 |
| `usc_dashboard_organization_users_editperson` | 编辑用户 |
| `usc_dashboard_organization_users_delperson` | 删除用户 |
| `usc_dashboard_authority_roles_add` | 添加角色 |
| `usc_dashboard_authority_roles_edit` | 编辑角色 |
| `usc_dashboard_authority_roles_delete` | 删除角色 |
| `usc_dashboard_authority_functions_addapp` | 添加应用 |
| `usc_dashboard_authority_functions_addfunction` | 添加功能 |
| `usc_dashboard_audit_loginlogs` | 审计日志 |
| `usc_dashboard_config_policyconfig` | 系统配置 |

### 数据权限

- `hasRole('usc_dashboard_authority_functions_allfunction')` 控制是否可看全部功能数据
- 否则只能看自己创建的

### 登录用户上下文

```java
LoggedUserContext context = ...;
context.getLoggedUser();      // 当前用户
context.getLoginUserInfo();  // 用户信息 + 角色列表
context.hasRole("xxx");      // 角色判断
context.hasAnyRole("a", "b"); // 任一角色
```

## API 接口

### 用户管理（`/users`）

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/users` | 用户分页列表 |
| POST | `/users` | 创建用户 |
| GET | `/users/{userid}` | 用户详情 |
| POST | `/users/{userid}` | 修改用户 |
| DELETE | `/users/{userid}` | 删除用户 |
| POST | `/users/{userid}/roles` | 设置用户角色 |
| POST | `/users/{userid}/password` | 重置密码 |
| GET | `/users/{userid}/totp` | OTP 状态 |

### 角色管理（`/roles`）

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/roles` | 角色分页 |
| POST | `/roles` | 创建角色 |
| GET | `/roles/{code}` | 获取角色 |
| POST | `/roles/{code}` | 更新角色 |
| DELETE | `/roles/{code}` | 删除角色 |
| GET | `/roles/{code}/users` | 拥有角色的用户 |

### 功能树管理（`/functions`）

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/functions` | 功能列表 |
| POST | `/functions` | 创建功能 |
| POST | `/functions/{functionid}/import` | 导入功能树 |
| POST | `/functions/{functionid}/export` | 导出功能树 |

### 部门管理（`/departments`）

- 部门 CRUD、导入导出、排序

### 审计日志（`/audit`）

- 用户登录日志、OAuth 登录日志、SMS 发送日志、邮件发送日志

### 系统配置（`/setup`）

- 支付宝/微信/OIDC/SAML/Hexin 集成配置
- 登录安全策略配置
- 弱密码本管理

## 关键配置

```properties
# 统一配置
app.config.type=cluster
app.config.server-url=http://localhost:8081/appconfig

# SSO
app.xeai.url=http://localhost:8585/xeai
spring.security.ssoheader=true
spring.security.ssoheader.simulate=true

# 管理员
app.admin.default.username=root
app.admin.default.password=changeme

# 虚拟线程
spring.threads.virtual.enabled=true
```

## 最佳实践

### 1. 功能树设计

- 按 `应用 → 功能模块 → 操作` 三层结构组织
- 使用导入/导出功能在不同环境间同步配置
- `PermissionDefinition` 包含完整权限定义，支持 YAML 导入导出

### 2. 组织域隔离

- 使用 `UserScope` 实现租户/组织域隔离
- 通过 `ScopeManagerApi` 管理组织域
- 用户可关联多个组织域

### 3. OAuth2 集成

- 通过 `ThirdPartyChannelController` 管理第三方认证渠道
- 通过 `ThirdPartyClientController` 管理 OAuth 客户端应用
- 用户可关联多个第三方账号
