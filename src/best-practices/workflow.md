# 工作流服务最佳实践

> 基于 `workflow` 模块，审批工作流管理服务。

## 服务概览

| 项 | 内容 |
|---|---|
| **GroupId** | `com.snz1.workflow` |
| **ArtifactId** | `workflow` |
| **版本** | `3.0.0` |
| **Parent** | `com.snz1:spring-boot3-app:3.0.0-SNAPSHOT` |
| **Java** | 21 |
| **启动类** | `com.snz1.workflowx.Application` |
| **上下文根** | `/gateway-audit/api` |
| **默认端口** | `6061` |

## 核心架构

### 新旧双包并行

项目存在两套并行包结构：

| 包 | 状态 | 说明 |
|---|---|---|
| `com.snz1.workflowx` | **当前活跃** | 重构版，启动类指向此包 |
| `com.snz1.workflow` | 保留未启动 | 旧版，结构镜像 |

### 申请单状态机

```
10 草稿
  ↓ submit
20 待审
  ↓ pass → 30 已完成
  ↓ reject → 25 已驳回
  ↓ abandon → 50 已作废
  ↓ cancel → 40 已取消
```

| 状态码 | 名称 | 说明 |
|--------|------|------|
| 10 | 草稿 | 起草中，未提交 |
| 20 | 待审 | 已提交，等待审核 |
| 25 | 已驳回 | 审核驳回，可修改重新提交 |
| 30 | 已完成 | 审核通过，流程结束 |
| 40 | 已取消 | 起草人撤回 |
| 50 | 已作废 | 废弃流程 |

### 提交模式

| 模式 | 说明 |
|------|------|
| `AUTO` | 全自动：建单 + 建流程 + 自动定节点 + 自动选人 + 自动提交 |
| `SEMI_AUTO` | 半自动：建单 + 建流程 + 定节点后停在草稿，用户手动选人提交 |

按区域配置解析：`work_submit_mode_{region}` → `work_submit_mode` → 默认 `SEMI_AUTO`

## 外部流程平台集成

通过 HTTP + JWT 调用外部流程平台（lbpm），API 路径定义在 `WorkflowxConfig`：

| 操作 | API 路径 |
|------|---------|
| 创建流程 | `/sys-lbpm/sysLbpmProcess/openSupport/create` |
| 提交流程 | `/sys-lbpm/sysLbpmProcess/openSupport/submit` |
| 执行流程 | `/sys-lbpm/sysLbpmProcess/openSupport/execute` |
| 加载流程信息 | `/sys-lbpm/sysLbpmProcess/openSupport/loadProcessBaseInfo` |
| 获取流程节点 | `/sys-lbpm/sysLbpmProcess/openSupport/processNoteList` |
| 删除流程 | `/sys-lbpm/sysLbpmProcess/openSupport/delete` |
| 查询用户ID | `/sys-org/v2/orgPerson/findOne` |

## 网关回调

| 方法 | 说明 |
|------|------|
| `submitWork` | 提交工作回调 |
| `finishWork` | 完成工作回调 |
| `rejectWork` | 驳回工作回调 |
| `cancelWork` | 取消工作回调 |

回调地址按区域配置：`callback_url_{region}` → 全局 `gate.url`

### 回调重试机制

- 每 5 分钟扫描 `callbackStatus=3` 的申请单
- 最多重试 3 次，成功标记 `1`，耗尽标记 `2`
- 根据 status 判断回调类型：`20→submit`, `40→cancel`, `30/reject→accept/reject`

## API 接口

| Controller | 路径前缀 | 主要接口 |
|-----------|---------|---------|
| `AccessApi` | `/process` | 提交审核、取消流程、废弃流程 |
| `ApplyNoteApi` | `/applyNoteApi` | 申请单 CRUD、创建并提交、我的申请单、候选人 |
| `ApplyNoteHandleApi` | `/applyNoteHandleApi` | 审批通过、驳回、废弃、撤回、选人提交 |
| `ApplyNoteDealRecordApi` | `/applyNoteDealRecordApi` | 审核记录管理 |
| `LbpmApi` | `/lbpmApi` | 表单/字段/视图/模板接口 |
| `ConfigVerifyUserApi` | `/configVerifyUserApi` | 审批人配置管理 |
| `ConstantConfigApi` | `/constantConfigApi` | 常量配置管理 |

### 权限控制

| 角色 | 说明 |
|------|------|
| `gateway_audit_manage` | 管理权限 |
| `gateway_audit` | 审核权限 |
| `isAuthenticated()` | 登录用户 |
| `permitAll()` | 开放接口（如 AccessApi） |

## 关键配置

```properties
# 流程平台
workflow.openapi.url=http://10.158.4.102:8080/openapi

# 网关
gate.url=http://work.snz1.cn:9080

# SSO
spring.security.ssoheader=true
spring.security.ssoheader.simulate=true

# JWT
app.jwt.token=xxx
app.jwt.private_key=xxx
app.jwt.live_time=1800

# 虚拟线程
spring.threads.virtual.enabled=true
```

## 最佳实践

### 1. 提交模式选择

- 简单审批链使用 `AUTO` 模式，减少人工干预
- 复杂审批或需要选人的场景使用 `SEMI_AUTO`
- 通过 `ConstantConfig` 按区域配置

### 2. 回调可靠性

- 回调失败自动进入重试队列
- 定时任务每 5 分钟扫描重试
- 生产环境确保 `gate.url` 可达

### 3. 权限配置

使用 YAML 文件配置权限：

- `conf/secc-predefinition.yaml` — 权限预定义
- `conf/service-authorize.yaml` — 接口权限
- `conf/table-definition.yaml` — 数据表权限
