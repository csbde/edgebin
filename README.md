# HTTP 测试页面

## 功能特性

支持原站 [httpbin.org](https://httpbin.org) 的绝大多数端点，包括：

- HTTP 方法
- 身份认证
- 请求检查
- 响应检查
- 动态数据
- 状态码
- 重定向
- Cookie
- 缓存
- Anything

所有端点都接受任意 HTTP 方法。此外，还包含原站 httpbin 没有的功能：

- [/ip](https://edgebin.liujiacai.net/ip) 返回请求方的 IP 地址，以及国家、地区、城市、ASN 等地理位置信息。

  ```json
  {
    "origin": "2408:8240:e10:947c:2806:6bb2:c222:343c",
    "continent": "AS",
    "latitude": "30.29365",
    "longitude": "120.16142",
    "country": "CN",
    "region": "Zhejiang",
    "regionCode": "ZJ",
    "city": "Hangzhou",
    "postalCode": "310000",
    "timezone": "Asia/Shanghai",
    "asn": 4837,
    "asOrganization": "China Unicom",
    "colo": "LAX"
  }
  ```

- `/ws` 通过 WebSocket 连接回显发送过来的任意消息。可以使用 [wscat](https://github.com/websockets/wscat) 进行测试：

  ```bash
  wscat -c wss://edgebin.liujiacai.net/ws
  ```

- [/qrcode](https://edgebin.liujiacai.net/qrcode?text=https://edgebin.liujiacai.net) 为任意文本或 URL 生成二维码（svg）。使用查询参数来自定义 [输出](https://github.com/soldair/node-qrcode#renderers-options)：
  - `text`：要编码的文本或 URL（必填）
  - `errorCorrectionLevel`：纠错等级，可选 `L`、`M`、`Q`、`H`。默认为 `H`。
  - `width`：二维码宽度（像素）。默认为 `350`。
  - `margin`：定义静区（quiet zone）的宽度。默认为 `4`。
  - `scale`：缩放因子。值为 1 表示每个模块（黑点）占 1px。默认为 `4`。

  ![](https://edgebin.liujiacai.net/qrcode?text=https://edgebin.liujiacai.net&width=200)

- `/md2html`、`/html2md` 在 HTML 和 Markdown 之间互相转换。可通过以下方式传入数据：
  - 使用 `POST` 请求并提交原始请求体
  - 使用 `url` 查询参数转换一个网页
  - 使用 `text` 查询参数转换一段较短的文本。

  ```bash
  curl "https://edgebin.liujiacai.net/md2html" --data "# Hello, World"
  curl "https://edgebin.liujiacai.net/html2md" --data "<h1>Hello, World</h1>"
  ```

- [/page-meta](https://edgebin.liujiacai.net/page-meta?url=https://edgebin.liujiacai.net)：抓取网页并提取其元数据（标题、描述、图片等）。使用 `url` 查询参数指定目标网页。

- [/date](https://edgebin.liujiacai.net/date)：返回当前日期和时间。
  支持以下查询参数控制输出：
  - `format`：输出格式，可选 `iso`、`locale`、`ts`、`timestamp`、`utc`。默认为 `iso`。
  - `locale`：[BCP47 语言标识](https://www.rfc-editor.org/rfc/bcp/bcp47.txt)字符串，例如 `en-US`、`zh-CN`。在 `format=locale` 时使用。
  - `timeZone`：[IANA 时区](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)，例如 `Asia/Shanghai`。

- `/mix` 返回请求体中发送的内容，同时支持特定的查询参数作为指令，用于构造自定义响应。
  - `s=code`，设置状态码，例如 `s=418`
  - `h=key:value`，添加响应头，例如 `h=Content-Type:text/plain`
  - `d=delay`，将响应延迟 `delay` 秒，例如 `d=3`

### 常用端点

- `/get`：返回 GET 请求的数据
- `/ip`：返回请求方的 IP 地址
- `/ipgeo`：返回请求方的 IP 地址及地理位置信息
- `/user-agent`：返回请求方的 User-Agent
- `/headers`：返回请求方的 HTTP 头部
- `/status/:code`：返回指定状态码的响应
- `/anything`：返回请求中发送的任何内容
- `/delay/:n`：延迟 `n` 秒后响应
- `/redirect/:n`：重定向 `n` 次
- `/basic-auth/:user/:passwd`：发起 HTTP Basic Auth 认证
- `/bearer`：发起 HTTP Bearer Auth 认证
- `/cache/:max-age`：返回带有 `Cache-Control: public, max-age=60` 的响应
- `/response-headers?key=value`：返回带有指定头部的响应
- `/bytes/:n`：返回 `n` 个随机字节
- `/xml`：返回一个示例 XML 文档
- `/html`：返回一个示例 HTML 文档
- `/json`：返回一个示例 JSON 文档
- `/csv/:name/:limit`：返回示例 CSV 数据集
  - `/csv` 默认使用 `customers`，`limit` 为 `100`
  - `name` 可以是 `customers`、`leads`、`organizations`、`people` 或 `products`
  - `limit` 可以是 `100` 或 `1000`
  - 示例 CSV 文件来源于 [datablist/sample-csv-files](https://github.com/datablist/sample-csv-files)。感谢该项目将它们公开分享。
- `/gzip`：返回经过 gzip 编码的响应
- `/brotli`：返回经过 brotli 编码的响应
- `/deflate`：返回经过 deflate 编码的响应
- `/anything/:anything`：返回请求中发送的任何内容
- `/cookies`：返回请求方的 Cookie
- `/cookies/set?name=value`：设置 Cookie 并重定向到 `/cookies`
- `/cookies/delete?name=value`：删除 Cookie 并重定向到 `/cookies`
- `/image/:type`：返回指定类型（png、jpeg、webp、svg）的样例图片
- `/image/:size`、`/image/:width/:height`：返回指定尺寸的 SVG 占位图，方便页面占位。可选查询参数：
  - `text`：占位图上显示的文字，默认为 `宽x高`
  - `background`：背景色，十六进制值，默认 `#cccccc`
  - `foreground`：文字颜色，十六进制值，默认 `#969696`

  ```bash
  curl "https://edgebin.liujiacai.net/image/640/480"
  curl "https://edgebin.liujiacai.net/image/200?background=FF0000&text=hello"
  ```

## 开发

```bash
# 克隆仓库并安装依赖
git clone https://github.com/jiacai2050/edgebin.git && cd edgebin
npm install

# 启动开发服务器，监听 http://localhost:8787
npm run dev

# 部署到 Cloudflare Workers
# 请先完成 Cloudflare Workers 环境配置
# https://developers.cloudflare.com/workers/get-started/guide/
npm run deploy
```

未来可能会支持其他边缘平台，例如 Vercel Edge Functions 和 Deno Deploy。
