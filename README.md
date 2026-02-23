# 新闻推送服务

每天早上自动获取科技新闻，使用 Claude AI 总结后推送到微信。

## 功能特点

- 📰 支持 17+ 全球主流新闻源
  - 科技媒体: Hacker News、TechCrunch、Wired、Fast Company、Product Hunt、GitHub Trending、Reddit
  - 主流媒体: 纽约时报、路透社、卫报、巴伦周刊、法新社
  - 中文媒体: 36氪、IT之家、cnBeta
  - 日文媒体: 朝日新闻
  - 印度媒体: 印度时报
- 🤖 使用 Claude AI 智能总结和分析新闻
- 📱 支持微信推送（Server酱 或 企业微信）
- ⏰ 定时任务，每天早上自动推送
- 🔧 配置灵活，易于扩展

## 快速开始

### 1. 安装依赖

```bash
cd news-pusher
npm install
```

### 2. 配置环境变量

复制配置文件并填写你的密钥：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Claude API Key (必填)
ANTHROPIC_API_KEY=your_api_key_here

# 微信推送配置 (二选一)
# 方案1: Server酱 (推荐)
SERVER_CHAN_KEY=your_server_chan_key

# 方案2: 企业微信机器人
# WECHAT_WEBHOOK=your_wechat_webhook_url

# 定时配置
PUSH_TIME=08:00
TIMEZONE=Asia/Shanghai

# 新闻源配置
NEWS_SOURCES=hackernews,techcrunch,36kr,ithome,nytimes,reuters,guardian,wired
MAX_NEWS_COUNT=10
```

### 3. 获取必要的密钥

#### Claude API Key
1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 创建 API Key
3. 复制到 `.env` 文件

#### Server酱 Key (推荐方式)
1. 访问 [Server酱官网](https://sct.ftqq.com/)
2. 使用微信扫码登录
3. 绑定微信后获取 SendKey
4. 复制到 `.env` 文件的 `SERVER_CHAN_KEY`

#### 企业微信 Webhook (备选方式)
1. 在企业微信群中添加机器人
2. 获取 Webhook 地址
3. 复制到 `.env` 文件的 `WECHAT_WEBHOOK`

### 4. 测试配置

```bash
npm run start test
```

这会测试新闻获取和微信推送功能。

### 5. 立即执行一次

```bash
npm run start once
```

### 6. 启动定时任务

```bash
npm start
```

服务会在后台运行，每天早上 8:00 自动推送新闻。

## 部署方式

### 方式1: 本地运行

使用 PM2 保持服务运行：

```bash
npm install -g pm2
pm2 start src/index.js --name news-pusher
pm2 save
pm2 startup
```

### 方式2: 服务器部署

将代码上传到服务器，使用 systemd 或 PM2 管理：

```bash
# 使用 PM2
pm2 start src/index.js --name news-pusher
pm2 save

# 查看日志
pm2 logs news-pusher
```

### 方式3: Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

运行：

```bash
docker build -t news-pusher .
docker run -d --env-file .env --name news-pusher news-pusher
```

## 自定义配置

### 修改推送时间

编辑 `.env` 文件中的 `PUSH_TIME`：

```env
PUSH_TIME=07:30  # 改为早上 7:30
```

### 选择新闻源

在 `.env` 中配置你想要的新闻源组合：

```env
# 可选源列表:
# 科技媒体: hackernews, techcrunch, wired, fastcompany, producthunt, github, reddit
# 主流媒体: nytimes, reuters, guardian, barrons, afp
# 中文媒体: 36kr, ithome, cnbeta
# 日文媒体: asahi
# 印度媒体: timesofindia

# 示例1: 只看英文科技媒体
NEWS_SOURCES=hackernews,techcrunch,wired,github

# 示例2: 中英文混合
NEWS_SOURCES=hackernews,36kr,ithome,nytimes,reuters

# 示例3: 全球视角
NEWS_SOURCES=hackernews,nytimes,guardian,afp,36kr,asahi,timesofindia
```

### 添加新的新闻源

编辑 [src/newsCollector.js](src/newsCollector.js)，添加新的获取方法：

```javascript
async fetchYourSource() {
  // 实现你的新闻源获取逻辑
}
```

### 自定义 AI 总结格式

编辑 [src/newsSummarizer.js](src/newsSummarizer.js) 中的 prompt。

## 常见问题

### 推送失败怎么办？

1. 检查 `.env` 配置是否正确
2. 运行 `npm run start test` 测试配置
3. 查看控制台错误信息

### 如何选择合适的新闻源？

根据你的需求选择：
- **快速浏览**: 选择 3-5 个核心源（如 `hackernews,36kr,nytimes`）
- **深度阅读**: 选择 8-10 个多样化源
- **中文为主**: `36kr,ithome,cnbeta,hackernews`
- **英文为主**: `hackernews,techcrunch,nytimes,wired,guardian`
- **全球视角**: 混合中英日文源

### 某些新闻源获取失败？

这是正常的，部分网站可能有访问限制。程序会自动跳过失败的源，继续获取其他源的新闻。

### 如何调整新闻数量？

修改 `.env` 中的 `MAX_NEWS_COUNT`：

```env
MAX_NEWS_COUNT=15  # 增加到 15 条
```

## 项目结构

```
news-pusher/
├── src/
│   ├── index.js           # 主程序
│   ├── newsCollector.js   # 新闻获取
│   ├── newsSummarizer.js  # AI 总结
│   └── wechatPusher.js    # 微信推送
├── .env.example           # 配置模板
├── package.json
└── README.md
```

## 技术栈

- Node.js 20+
- Claude API (Sonnet 4.6)
- node-cron (定时任务)
- axios (HTTP 请求)
- Server酱 / 企业微信 (消息推送)

## License

MIT
