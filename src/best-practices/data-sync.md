# 数据同步服务最佳实践

> 基于 `xeai-datasync-serv` 模块，组织人员数据同步服务。

## 服务概览

| 项 | 内容 |
|---|---|
| **GroupId** | `com.snz1.xeai` |
| **ArtifactId** | `xeai-datasync-serv` |
| **版本** | `3.0.0-SNAPSHOT` |
| **Parent** | `com.snz1:spring-boot3-app:3.0.0-SNAPSHOT` |
| **Java** | 21 |
| **启动类** | `com.snz1.xeai.datasync.Application` |
| **上下文根** | `/xeai-datasync` |
| **默认端口** | `8847` |

## 核心架构

### 适配器模式

```
配置驱动: datasync.sources / datasync.deltas / datasync.targets / datasync.channels
         ↓
ChannelAutoConfiguration (@PostConstruct)
  → 按 type 匹配 adapter 实现
  → init(channelName, config)
  → 注册到 ChannelContextHolder
  → 动态注册 Kafka 监听器
```

### 三种适配器

| 适配器接口 | 实现 | type 值 | 说明 |
|-----------|------|---------|------|
| `FullSourceAdapter` | `HnzyFullSourceAdapter` | `hnzy-full` | Retrofit 调用用户中心 API，分页拉取 |
| `DeltaSourceAdapter` | `HnzyDeltaSourceAdapter` | `hnzy-delta` | Hutool XML 解析 ROMA Kafka 消息 |
| `TargetAdapter` | `XeaiTargetAdapter` | `xeai` | 通过 XEAI SDK Proxy 写入目标系统 |

### 标准中间模型

源端模型 → **标准中间模型** → 目标模型

| 标准模型 | 说明 |
|---------|------|
| `StandardOrganization` | 组织机构 |
| `StandardEmployee` | 员工 |
| `StandardPosition` | 职位 |
| `StandardEmployeePosition` | 人员定职 |

### 关键映射规则

- 组织 ID 统一使用 `bizCode`（非 HR 内部 orgUnitId）
- 员工状态：`QY`→enabled, `JY`→disabled, `1`→enabled, `0`→disabled
- logType 兼容 `_yhzt` 后缀变体

## 同步策略

| 策略 | 触发方式 | 实现类 | 说明 |
|------|---------|--------|------|
| **全量同步** | API 手动触发 | `FullSyncServiceImpl` | 异步线程池，流式分页拉取→每页立即写入 |
| **增量同步** | Kafka 消费 | `DeltaMessageConsumer` → `DeltaSyncHandler` | 消费 ROMA Kafka XML 消息 |
| **单条补偿** | API 手动触发 | `SingleRecordSyncServiceImpl` | 从源端查单条→写入 XEAI |
| **失败重试** | 定时每10分钟 | `ScheduleSyncFailRetry` | 扫描 sync_fail_log 表，重试 < 5 次 |

### 全量同步编排

```
组织 → 职位 → 员工 → 人员定职
```

- 每页 100 条，拉取一页立即写入（防 OOM）
- 组织按 level 排序确保父先于子
- 员工/职位/定职写入使用 5 并发线程池
- 通道级运行锁防重复触发

### 增量同步路由

| bizType | logType | 动作 |
|---------|---------|------|
| `sm_om`（组织） | insert | createDepartment |
| | update/restart | updateDepartment |
| | delete/stop | 软删除（disabled） |
| `sm_em`（员工） | insert | createEmployee（已存在则更新） |
| | update | updateEmployee |
| | delete/stop | 软删除 |
| | restart | 启用 |
| `sm_pm`（职位） | insert/update | create/updatePosition |
| | delete/stop | 软删除 |
| `sm_dm`（定职） | insert | attachEmployeePosition |
| | update | 先 detach 全部旧关联再 attach |
| | delete/stop | detachEmployeePosition |

## API 接口

### 健康检查（`/v1/health`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/health` | 健康检查 |
| GET | `/v1/health/version` | 版本信息 |

### 同步管理（`/v1/sync`）

| 方法 | 路径 | 参数 | 说明 |
|------|------|------|------|
| GET | `/v1/sync/full` | `channel`(必填) | 触发全量同步（异步） |
| GET | `/v1/sync/record` | `channel`, `type`, `bizId`, `action` | 单条补偿同步 |

## 关键配置

### 数据同步通道配置

```properties
# 数据源
datasync.sources[0].name=hnzy
datasync.sources[0].type=hnzy-full
datasync.sources[0].url=https://api.example.com
datasync.sources[0].appkey=xxx
datasync.sources[0].appsecret=xxx

# 增量源
datasync.deltas[0].name=hnzy
datasync.deltas[0].type=hnzy-delta
datasync.deltas[0].mq-type=kafka
datasync.deltas[0].topic=mp-uc-test-send-cloud-topic
datasync.deltas[0].groupId=xeai_datasync_group_dev

# 目标
datasync.targets[0].name=xeai
datasync.targets[0].type=xeai
datasync.targets[0].url=localhost

# 通道
datasync.channels[0].name=hnzy
datasync.channels[0].enabled=false
datasync.channels[0].source=hnzy
datasync.channels[0].delta=hnzy
datasync.channels[0].target=xeai
```

### Kafka 配置

- 每通道独立 Kafka 消费者容器
- `MANUAL_IMMEDIATE` ack 模式
- 9 个 Kafka bootstrap servers（集群）

### 调度

```properties
app.schedule.enabled=true
app.schedule.pool-size=2
# 失败重试 cron: 0 0/10 * * * ? （每10分钟）
```

## 最佳实践

### 1. 新数据源接入

1. 实现 `FullSourceAdapter` 接口（全量拉取）
2. 实现 `DeltaSourceAdapter` 接口（增量解析）
3. 在 `application.properties` 中配置新的 source 和 delta
4. 创建新通道绑定 source/delta/target

### 2. 生产环境部署

- SSO 模拟关闭：`spring.security.ssoheader.simulate=false`
- 数据同步配置通过 K8s 环境变量注入
- 数据源通过 `${PG_HOST}` / `${PG_PORT}` 等环境变量注入
- Kafka 日志级别降为 WARN

### 3. 监控与运维

- 通过 `/v1/health` 检查服务状态
- 通过 `/v1/sync/full?channel=xxx` 手动触发全量同步
- 通过 `/v1/sync/record` 进行单条数据补偿
- `sync_fail_log` 表记录失败同步，自动重试最多 5 次
