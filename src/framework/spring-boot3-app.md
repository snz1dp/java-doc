# spring-boot3-app 父 POM

## 基本信息

| 属性 | 值 |
|---|---|
| groupId | `com.snz1` |
| artifactId | `spring-boot3-app` |
| version | `3.0.0-SNAPSHOT` |
| packaging | `pom` |
| parent | `org.springframework.boot:spring-boot-starter-parent:3.5.16` |

::: tip 目录名说明
虽然 Maven 仓库中的目录名为 `spring-boot2-app`，但 artifactId 实际为 `spring-boot3-app`，请以 artifactId 为准。
:::

## 版本管理

`spring-boot3-app` 通过 `<properties>` 统一管理核心依赖的版本号，业务服务继承此父 POM 后无需重复声明版本。

| 属性 | 版本 |
|---|---|
| `java.version` | 21 |
| `lombok.version` | 1.18.36 |
| `ehcache.version` | 3.10.8 |
| `druid.version` | 1.2.28 |
| `redisson.version` | 3.52.0 |
| `mybatis-spring-boot.version` | 3.0.5 |
| `springdoc-openapi.version` | 2.8.17 |
| `poi-ooxml.version` | 5.3.0 |
| `mybatis-generator.version` | 1.4.2 |
| `sc-client-api.version` | 3.0.0-SNAPSHOT |
| `utility.version` | 3.0.0-SNAPSHOT |

## 依赖管理

父 POM 在 `<dependencyManagement>` 中声明了以下关键依赖及其版本，业务服务引用时无需指定版本号。

### 内部依赖（com.snz1）

| 依赖 | 版本 |
|---|---|
| `utility-all` | 3.0.0-SNAPSHOT |
| `utility-core` | 3.0.0-SNAPSHOT |
| `utility-tools` | 3.0.0-SNAPSHOT |
| `utility-config` | 3.0.0-SNAPSHOT |
| `utility-security` | 3.0.0-SNAPSHOT |
| `utility-redis` | 3.0.0-SNAPSHOT |
| `utility-websocket` | 3.0.0-SNAPSHOT |
| `utility-data` | 3.0.0-SNAPSHOT |
| `utility-mvc` | 3.0.0-SNAPSHOT |

### 第三方依赖

| 依赖 | 版本 |
|---|---|
| `com.alibaba:druid-spring-boot-3-starter` | 1.2.28 |
| `org.redisson:redisson-spring-boot-starter` | 3.52.0 |
| `org.mybatis.spring.boot:mybatis-spring-boot-starter` | 3.0.5 |
| `org.springframework.boot:spring-boot-starter-oauth2-resource-server` | 3.5.16 |
| `org.springdoc:springdoc-openapi-starter-webmvc-ui` | 2.8.17 |
| `org.apache.poi:poi-ooxml` | 5.3.0 |
| `org.mybatis.generator:mybatis-generator-core` | 1.4.2 |
| `cglib:cglib-nodep` | 3.3.0 |
| `commons-io:commons-io` | 2.17.0 |
| `commons-codec:commons-codec` | 1.17.1 |
| `commons-beanutils:commons-beanutils` | 1.9.4 |
| `org.ehcache:ehcache` | 3.10.8 |

## 使用方式

在业务服务的 `pom.xml` 中设置 `spring-boot3-app` 为父 POM：

```xml
<parent>
    <groupId>com.snz1</groupId>
    <artifactId>spring-boot3-app</artifactId>
    <version>3.0.0-SNAPSHOT</version>
</parent>
```

继承后，业务服务可直接引用依赖管理中的组件，无需声明版本号。例如：

```xml
<dependencies>
    <!-- 数据库连接池 -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-3-starter</artifactId>
        <!-- 无需指定 version，由父 POM 统一管理 -->
    </dependency>

    <!-- Redis 客户端 -->
    <dependency>
        <groupId>org.redisson</groupId>
        <artifactId>redisson-spring-boot-starter</artifactId>
    </dependency>

    <!-- MyBatis -->
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
    </dependency>

    <!-- 内部工具库 -->
    <dependency>
        <groupId>com.snz1</groupId>
        <artifactId>utility-all</artifactId>
    </dependency>

    <!-- API 文档 -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    </dependency>
</dependencies>
```

## 注意事项

::: warning commons-io 版本冲突风险
`commons-io` 在 `spring-boot3-app` 父 POM 中声明的版本为 **2.17.0**，但在 `utility` 聚合 POM 中声明的版本为 **2.22.0**。当业务服务同时引入 `utility` 相关依赖时，可能出现版本冲突。

**建议处理方式：**

1. 在业务服务的 `pom.xml` 的 `<dependencyManagement>` 中显式声明 `commons-io` 版本，以覆盖父 POM 的传递依赖。
2. 使用 `mvn dependency:tree` 检查实际解析的版本，确认是否符合预期。

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>commons-io</groupId>
            <artifactId>commons-io</artifactId>
            <version>2.22.0</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```
:::

::: tip Maven 仓库来源
该 POM 从私有 Maven 仓库 [https://snz1.cn/nexus/](https://snz1.cn/nexus/) 解析，不在本地工作区中。如需查看或修改源码，请联系仓库管理员。
:::

::: warning Java 版本要求
此父 POM 基于 Spring Boot 3.5.x，要求最低 Java 21。请确保本地开发和 CI/CD 环境使用 JDK 21+。
:::
