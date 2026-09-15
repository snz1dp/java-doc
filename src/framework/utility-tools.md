# utility-tools 工具包

可选工具包：提供 JSON/RSA/日历/二维码/拼音/CRC 等常用工具类，按需引入，避免冗余依赖。

## 基本信息

| 属性 | 值 |
|------|-----|
| **GroupId** | `com.snz1` |
| **ArtifactId** | `utility-tools` |
| **Version** | `3.0.0-SNAPSHOT` |
| **Parent** | `com.snz1:utility:3.0.0-SNAPSHOT` |
| **描述** | 可选工具包：JSON/RSA/日历/二维码/拼音/CRC等工具类，按需引入 |
| **包前缀** | `com.snz1.utils` |

## 引入方式

::: code-group

```xml
<dependency>
    <groupId>com.snz1</groupId>
    <artifactId>utility-tools</artifactId>
    <version>3.0.0-SNAPSHOT</version>
</dependency>
```

:::

## 工具类一览

utility-tools 共包含 **10 个 Java 工具类**，覆盖常用工具场景：

| 类名 | 职责 | 底层依赖 |
|------|------|----------|
| `CRCUtils` | CRC 校验工具 | — |
| `CalendarUtils` | 日历工具 | — |
| `DiffMatchPatch` | 文本差异比较 | — |
| `JsonDateTypeAdapter` | JSON 日期类型适配器 | Gson |
| `JsonUtils` | JSON 工具（Gson 封装） | Gson |
| `LocaleUtils` | 区域设置工具 | — |
| `PinyinUtils` | 拼音工具 | pinyin4j |
| `QRCodeUtils` | 二维码工具 | ZXing |
| `RSAUtils` | RSA 加解密工具 | BouncyCastle |
| `TimeZoneUtils` | 时区工具 | — |

## 依赖列表

### 编译依赖

| 依赖 | 版本 | Scope | 说明 |
|------|------|-------|------|
| `com.snz1:utility-core` | `3.0.0-SNAPSHOT` | compile | 核心工具基础包 |
| `org.bouncycastle:bcprov-jdk18on` | `1.84` | compile | RSA 加解密底层提供者 |
| `commons-io:commons-io` | `2.22.0` | compile | IO 工具支持 |
| `com.belerweb:pinyin4j` | `2.5.1` | compile | 拼音转换 |
| `com.google.zxing:core` | `3.5.3` | compile | 二维码核心 |
| `com.google.zxing:javase` | `3.5.3` | compile | 二维码 Java SE 扩展 |

### BOM 管理依赖

以下依赖版本由父级 BOM 统一管理，无需在此模块声明版本号：

| 依赖 | 说明 |
|------|------|
| `com.google.code.gson:gson` | JSON 序列化/反序列化 |
| `org.apache.commons:commons-lang3` | 通用语言工具 |

## 工具类详解

### JsonUtils

基于 Gson 封装的 JSON 工具类，提供对象与 JSON 字符串之间的序列化与反序列化能力。

```java
import com.snz1.utils.JsonUtils;

// 对象转 JSON 字符串
User user = new User("张三", 25);
String json = JsonUtils.toJson(user);
// {"name":"张三","age":25}

// JSON 字符串转对象
User parsed = JsonUtils.fromJson(json, User.class);

// JSON 字符串转集合
List<User> users = JsonUtils.fromJson(jsonArray, JsonUtils.listType(User.class));
```

### RSAUtils

基于 BouncyCastle 提供的 RSA 加解密工具，支持公钥加密、私钥解密、签名与验签。

```java
import com.snz1.utils.RSAUtils;

// 生成密钥对
RSAUtils.KeyPair keyPair = RSAUtils.generateKeyPair();

// 公钥加密
String encrypted = RSAUtils.encrypt("Hello RSA", keyPair.getPublicKey());

// 私钥解密
String decrypted = RSAUtils.decrypt(encrypted, keyPair.getPrivateKey());
```

### QRCodeUtils

基于 ZXing 实现的二维码生成与解析工具。

```java
import com.snz1.utils.QRCodeUtils;

// 生成二维码图片（返回字节流）
byte[] qrImage = QRCodeUtils.generate("https://example.com", 300, 300);

// 解析二维码图片
String content = QRCodeUtils.decode(qrImage);
```

### PinyinUtils

基于 pinyin4j 实现的拼音转换工具，支持汉字转拼音、首字母提取。

```java
import com.snz1.utils.PinyinUtils;

// 汉字转全拼
String pinyin = PinyinUtils.toPinyin("你好世界");
// nihaoshijie

// 提取首字母
String initials = PinyinUtils.toInitials("你好世界");
// nhsj
```

### CalendarUtils

日历工具类，提供日期计算、格式化等常用操作。

```java
import com.snz1.utils.CalendarUtils;

// 获取当前日期的指定格式字符串
String dateStr = CalendarUtils.format("yyyy-MM-dd HH:mm:ss");

// 日期加减
Date nextWeek = CalendarUtils.addDays(new Date(), 7);
```

### CRCUtils

CRC 校验工具，支持多种 CRC 算法。

```java
import com.snz1.utils.CRCUtils;

// 计算 CRC32 校验值
long crc = CRCUtils.crc32("Hello CRC".getBytes());
```

### DiffMatchPatch

文本差异比较工具，支持对两段文本进行差异对比。

```java
import com.snz1.utils.DiffMatchPatch;

DiffMatchPatch dmp = new DiffMatchPatch();
String text1 = "Hello World";
String text2 = "Hello Java World";

// 计算差异
List<DiffMatchPatch.Diff> diffs = dmp.diffMain(text1, text2, false);
```

### LocaleUtils / TimeZoneUtils

区域设置与时区工具类，用于国际化场景下的 Locale 与 TimeZone 管理。

```java
import com.snz1.utils.LocaleUtils;
import com.snz1.utils.TimeZoneUtils;

// 获取中国区域设置
Locale cn = LocaleUtils.CHINA;

// 获取东八区时区
TimeZone cst = TimeZoneUtils.CHINA;
```

## 版本说明

当前版本 `3.0.0-SNAPSHOT` 为开发快照版本，正式发布版本将以 `3.0.0` 形式发布。所有工具类均基于 `utility-core` 基础包构建，引入 `utility-tools` 会自动传递依赖 `utility-core`。
