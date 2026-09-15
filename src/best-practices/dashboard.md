# Dashboard 服务最佳实践

> 基于 `dashserv`（artifactId: `dashboard`）模块，API 网关管理面板。

## 服务概览

| 项 | 内容 |
|---|---|
| **GroupId** | `com.snz1.gateway` |
| **ArtifactId** | `dashboard` |
| **版本** | `3.0.0-SNAPSHOT` |
| **Parent** | `com.snz1:spring-boot3-app:3.0.0-SNAPSHOT` |
| **启动类** | `com.snz1.gateway.dash.Application` |
| **上下文根** | `/gateway/dashboard/api` |
| **默认端口** | `9088` |

## 核心架构

### 双数据源

| 数据源 | 用途 | 实现 |
|--------|------|------|
| **PostgreSQL** | 网关配置数据（路由、服务、上游、证书等） | MyBatis + Druid |
| **OpenSearch/Elasticsearch** | 访问日志、分析统计 | `ElasticSearchAccessLogProviderImpl` |

日志服务器类型由 `gateway.logserver.type` 配置控制，支持 `opensearch` 和 `elasticsearch`。

### 分析服务

| 接口 | 说明 | 返回类型 |
|------|------|---------|
| `POST analysis/elapsed_avg_polyline` | 路由平均耗时折线图 | `EChartData` |
| `POST analysis/elapsed_avg_routes` | 各路由平均耗时 | `EChartData` |
| `POST analysis/traffic_sum_routes` | 路由流量统计 | `EChartData` |
| `POST analysis/traffic_sum_polyline` | 流量折线图 | `EChartData` |
| `POST analysis/route_response_codes` | 路由应答码分布 | `EChartData` |
| `POST analysis/request_count_routes` | 路由请求计数 | `EChartData` |
| `POST analysis/request_count_polylines` | 请求计数折线图 | `EChartData` |
| `POST accesslogs/query` | 分页查询访问日志 | `Return<Page>` |

分析接口统一返回 `EChartData`，兼容 ECharts 前端图表渲染。

### 访问日志查询维度

支持 30+ 过滤维度：协议、域名、端口、URI、路由ID、服务ID、消费者ID、用户ID、状态码、客户端IP、请求方法、请求/应答大小范围、耗时范围、请求头/应答头过滤表达式等。

### 度量聚合

- `metricsAccessLogs()` — min/max/avg/weighted_avg/stats/missing/count/sum/extended_stats
- `histogramAccessLogs()` — 时间直方图（second~year CalendarInterval）

## 管理接口

### admin 后台接口（`/admin` 前缀，无权限注解，通过 SSO header 认证）

| Controller | 管理对象 |
|-----------|---------|
| `RouteController` | 路由管理 |
| `ServiceController` | 服务管理 |
| `UpstreamController` | 上游管理 |
| `ConsumerController` | 消费者管理 |
| `SNIController` | SNI 域名管理 |
| `CertificateController` | 证书管理 |
| `AppController` | 应用管理 |
| `TagController` | 标签管理 |
| `RoleController` | 角色管理 |
| `ApprovalController` | 审批管理 |
| `ChangeLogController` | 变更日志 |
| `EventNotifyController` | 事件通知 |
| `StartStopTimerController` | 定时启停 |
| `SetupController` | 初始化设置 |

### user 用户接口（带 `@PreAuthorize` 权限控制）

- 与 admin 接口镜像，但使用 `@PreAuthorize` 做角色控制
- 角色命名：`gateway_dashboard_v2`、`gateway_dashboard_v2_accesslogs`

## 关键配置

```properties
# 数据库
spring.datasource.url=jdbc:postgresql://192.168.3.8:5432/ingress

# OpenSearch
opensearch.hosts=192.168.3.8:9200
opensearch.prefix=snz1-gateway-accesslog-

# 统一配置
app.config.server-url=http://192.168.3.8:8081/appconfig

# 单点登录
app.xeai.url=http://192.168.3.8:8585/xeai

# 网关管理
app.gateway.admin-url=http://192.168.3.8:91

# 虚拟线程
spring.threads.virtual.enabled=true
```

## 插件系统

`data/schemas.yaml` 预定义 14 个 Kong 插件：

| 插件 | 说明 |
|------|------|
| `ssoauth` | SSO 认证 |
| `jwtauth` | JWT 认证 |
| `authacl` | 访问控制 |
| `cors` | 跨域 |
| `rate-limiting` | 限流 |
| ... | ... |

## 最佳实践

### 1. 数据源切换

- dev 环境默认使用 OpenSearch
- 生产环境可通过环境变量切换为 Elasticsearch
- ES/OpenSearch 均支持 JWT 认证

### 2. 权限模型

- admin 接口通过 SSO header 认证，无 `@PreAuthorize`
- user 接口使用 `@PreAuthorize` 做角色控制
- 数据权限：`hasRole('..._allfunction')` 控制全量数据访问
