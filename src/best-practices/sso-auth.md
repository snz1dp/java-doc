# SSO 认证服务最佳实践

> 基于 `ssoserv`（artifactId: `xeai`）模块，统一身份认证平台。

## 服务概览

| 项 | 内容 |
|---|---|
| **GroupId** | `com.snz1` |
| **ArtifactId** | `xeai` |
| **版本** | `3.0.0-SNAPSHOT` |
| **Parent** | `com.snz1:spring-boot3-app:3.0.0-SNAPSHOT` |
| **Java** | 21 |
| **启动类** | `com.snz1.gateway.xeai.Application` |
| **上下文根** | `/xeai` |
| **默认端口** | `8585` |

## 核心能力

### 认证方式

ssoserv 支持多种认证方式，通过 `AuthenticationMode` 枚举统一管理：

| 认证模式 | 说明 |
|---------|------|
| **密码认证** | 用户名/密码登录，支持弱密码检测、密码重试限制 |
| **验证码认证** | Kaptcha 图形验证码 |
| **短信验证码** | 腾讯云 SMS 服务 |
| **邮件验证码** | SMTP 邮件发送 |
| **OTP 二次认证** | Google Authenticator (TOTP) |
| **第三方 OAuth** | 微信、支付宝、和信（Hexin） |
| **SAML 2.0 IdP** | 基于 OpenSAML 4.2.0 的 SAML 身份提供者 |
| **WebSeal** | IBM WebSeal 集成认证 |
| **Trusted Gateway** | 信任网关委托认证 |

### 安全特性

- **持久化登录令牌**：`PersistentLoginToken` + `CachedPersistentTokenRememberMeServices`
- **会话管理**：Redisson 分布式 Session（`RedissonCacheSessionRepository`），支持单机/集群模式
- **密码安全**：弱密码本（`WeakPasswordBooker`）、密码加密存储（`DataSecureBox`）
- **登录安全策略**：`LoginSecurityConfigRegistry` 动态配置密码重试次数、锁定时间
- **License 授权**：`LicenseProvider` 商业授权校验

## 架构分层

```
com.snz1.gateway.xeai
├── security              安全认证核心
│   ├── authentication    认证模式与 Provider
│   ├── captcha           验证码过滤器
│   ├── config            安全配置
│   ├── login             登录跳转与集成
│   ├── oauth             OAuth 渠道解析
│   ├── otp               Google Authenticator
│   ├── password          密码安全
│   ├── remember          记住我
│   ├── session           会话管理
│   ├── storage           用户账号存储
│   ├── trusted           信任网关
│   └── tam               WebSeal 集成
├── oauth                 OAuth2 授权服务器
│   ├── api               OAuth 接口
│   ├── server            授权服务核心
│   ├── thirdparty        第三方登录（微信/支付宝/和信）
│   └── config            OAuth 配置
├── saml                  SAML 2.0 IdP
│   ├── builder           SAML 对象构建
│   ├── crypto             签名与加密
│   ├── idp                IdP 配置
│   └── metadata           元数据解析
├── user                  用户管理
├── organization          组织机构
├── audit                 审计日志
├── external              外部服务（SMS/Mail）
├── exhibition            展会扫码认证
└── invitation            邀请码
```

## 关键配置

### 数据库

```properties
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.url=jdbc:postgresql://localhost:5432/xeai
spring.datasource.auto.create=true
```

### Session

```properties
server.servlet.session.cookie.name=SSO-PDID
server.servlet.session.cookie.remember=SSO-SPID
server.servlet.session.timeout=1810
spring.cache.type=redis
spring.data.redis.host=localhost
spring.data.redis.database=2
```

### OAuth2 集成

```properties
# 微信
app.wx.oauth.url=https://api.weixin.qq.com
app.wx.open.url=https://open.weixin.qq.com

# 腾讯云短信
tencent.sms.template.captcha=2500380
tencent.sms.template.resetpwd=2500384
```

### 统一配置中心

```properties
app.config.type=cluster
app.config.server-url=http://localhost:8081/appconfig
```

## API 接口概览

### 用户认证

| 接口 | 路径 | 说明 |
|------|------|------|
| 用户登录 | `POST /login` | 密码/验证码登录 |
| 用户注销 | `POST /logout` | 注销并清除 Session |
| 当前用户 | `GET /user/logged` | 获取登录用户信息 |

### OAuth2 授权服务器

| 接口 | 路径 | 说明 |
|------|------|------|
| 授权码 | `GET /oauth/authorize` | OAuth2 授权码端点 |
| 令牌 | `POST /oauth/token` | 获取 Access Token |
| OIDC 发现 | `GET /.well-known/openid-configuration` | OIDC Discovery |
| JWK Set | `GET /oauth/jwks` | 公钥集 |

### SAML IdP

| 接口 | 路径 | 说明 |
|------|------|------|
| SSO 登录 | `POST /saml/sso` | SAML AuthnRequest 接收 |
| 元数据 | `GET /saml/metadata` | IdP 元数据 |

### 用户管理

| 接口 | 路径 | 说明 |
|------|------|------|
| 用户资料 | `GET/POST /user/profile` | 个人信息管理 |
| OTP 配置 | `GET/POST /user/totp` | Google Authenticator |
| 密码修改 | `POST /user/change_password` | 修改登录密码 |
| 短信验证 | `POST /user/sms_verify_code` | 发送短信验证码 |

## 最佳实践

### 1. 集群部署

- 使用 `spring.cache.type=redis` + Redisson 分布式 Session
- 配置 `COOKIE_DOMAIN` 为统一域名
- 设置 `spring.session.store-type=redis`

### 2. 安全加固

- 生产环境关闭 `spring.security.ssoheader.simulate`
- 启用 `app.xeai.user.privacy.data.protected=true` 隐私数据加密
- 配置弱密码本，强制密码复杂度
- 启用 OTP 二次认证

### 3. 第三方登录

- 微信：配置 `app.wx.oauth.*` 系列 URL
- 支付宝：通过 `AlipayConfigRegistry` 动态注册
- 和信：通过 `HexinConfigRegistry` 配置
- SAML SP：通过 `SamlServiceRegistry` 注册服务提供者
