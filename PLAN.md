# snz1-java-docs 文档站执行计划

## 项目概况

| 项 | 内容 |
|---|---|
| **项目名** | snz1-java-docs |
| **技术栈** | VitePress 1.6.3 + Mermaid 插件 |
| **参考骨架** | `/home/yangjin/snz1_code/taiyiflow-docs` |
| **部署方式** | Docker 多阶段构建 → Nginx 静态托管 |
| **Base Path** | `/snz1/java/docs/` |
| **镜像名** | `snz1.cn/snz1/java-docs` |
| **端口** | 5003:80 |
| **Node 要求** | >= 20（实际使用 v22.22.3，环境中无 v20） |

## 分批执行计划

### B1: 工程骨架（7 个文件）✅ 已完成

| 序号 | 文件 | 状态 |
|------|------|------|
| 1 | `package.json` | ✅ |
| 2 | `src/.vitepress/config.mts` | ✅ |
| 3 | `Dockerfile` | ✅ |
| 4 | `Makefile` | ✅ |
| 5 | `BUILD.yaml` | ✅ |
| 6 | `nginx/default.conf` | ✅ |
| 7 | `src/index.md` | ✅ |
| 8 | `README.md` + `.gitignore` + `.dockerignore` | ✅ |
| 9 | `src/overview/index.md` (占位) | ✅ |

验证：`npm install` 成功（245 包），`npm run docs:build` 成功（16s）

### B2: 基础框架文档（8 个文件）✅ 已完成

| 序号 | 文件 | 内容 | 数据来源 |
|------|------|------|----------|
| 1 | `src/overview/index.md` | 框架总览：技术栈全景图、模块关系 | 21 项目 pom.xml 分析 |
| 2 | `src/framework/spring-boot3-app.md` | 父 POM 依赖管理、版本策略 | spring-boot3-app pom.xml |
| 3 | `src/framework/utility-core.md` | 核心接口、spring-boot-starter | utility/pom.xml + 源码 |
| 4 | `src/framework/utility-tools.md` | 工具类：PinyinUtils、GLock 等 | utility-tools pom.xml + 源码 |
| 5 | `src/framework/utility-config.md` | 集群配置 | utility-config pom.xml + confserv 源码 |
| 6 | `src/framework/utility-security.md` | JWT/SSO 认证、User 接口 | utility-security pom.xml + ssoserv 源码 |
| 7 | `src/framework/utility-data.md` | MyBatis+Druid+PageCriteria | utility-data pom.xml + dashserv 源码 |
| 8 | `src/framework/apihelper.md` | Retrofit 接口定义、JWT 构造 | apihelper pom.xml + sc-client-api 源码 |

### B3: 中间件与 SDK 文档（5 个文件）✅ 已完成

| 序号 | 文件 | 内容 | 数据来源 |
|------|------|------|----------|
| 1 | `src/middleware/opensearch-cli.md` | OpenSearch 自动配置 | opensearch-cli pom.xml + 源码 |
| 2 | `src/middleware/elasticsearch-cli.md` | ES Java Client 8.18.8 | elasticsearch-cli pom.xml + 源码 |
| 3 | `src/middleware/jdbcrest.md` | JDBC REST 服务 | jdbcrest pom.xml |
| 4 | `src/sdk/sc-client-api.md` | 精准引入策略 | sc-client-api pom.xml |
| 5 | `src/sdk/admin-api.md` | 管理接口契约 | admin-api pom.xml |

### B4: 业务服务最佳实践（6 个文件）✅ 已完成

| 序号 | 文件 | 参考项目 |
|------|------|----------|
| 1 | `src/best-practices/sso-auth.md` | ssoserv |
| 2 | `src/best-practices/config-center.md` | confserv |
| 3 | `src/best-practices/dashboard.md` | dashserv |
| 4 | `src/best-practices/workflow.md` | workflow |
| 5 | `src/best-practices/user-permission.md` | uscapi |
| 6 | `src/best-practices/data-sync.md` | xeai-datasync-serv |

### B5: 迁移指南与附录（4 个文件）✅ 已完成

| 序号 | 文件 | 内容 |
|------|------|------|
| 1 | `src/migration/overview.md` | V2→V3 迁移总览 |
| 2 | `src/migration/dependency-changes.md` | 依赖变更 |
| 3 | `src/migration/common-issues.md` | 常见问题 |
| 4 | `src/reference/changelog.md` | 变更日志 |

## 进度跟踪

| 批次 | 文件数 | 状态 | 完成时间 |
|------|--------|------|----------|
| B1 工程骨架 | 10 | ✅ 已完成 | 2026-09-14 |
| B2 基础框架 | 8 | ✅ 已完成 | 2026-09-14 |
| B3 中间件SDK | 5 | ✅ 已完成 | 2026-09-14 |
| B4 最佳实践 | 6 | ✅ 已完成 | 2026-09-15 |
| B5 迁移附录 | 4 | ✅ 已完成 | 2026-09-15 |
| **合计** | **33** | | |
