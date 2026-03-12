# 项目进展日志

## 2026-03-12

### Bug 修复
- 🐛 **修复 YouTube 视频重复推送**：同一场访谈被多个频道转发导致重复
  - **根本原因**：使用关键词搜索全网，同一场访谈的不同转发/剪辑都会被抓取
  - **解决方案**：两层去重机制
    1. 第一层：按视频 ID 去重（处理同一视频不同 URL 参数）
    2. 第二层：按标题相似度去重（Jaccard 相似度 > 40%），同组视频保留播放量最高的
  - **效果**：Sam Altman 同一场访谈的 3 个转发视频 → 去重后保留 1 个
  - **文件**：`src/youtubeCollector.js`

- 🐛 **修复 KOL 博客重复推送**：每天推送包含过去 7 天的内容，导致重复
  - **根本原因**：时间过滤窗口设置为 7 天，同一篇博客在 7 天内会被重复抓取
  - **解决方案**：时间窗口从 7 天改为 24 小时
  - **文件**：`src/kolCollector.js`

### 新增功能
- ✨ **YouTube 视频 AI 解读**：新增 `summarizeYouTube()` 方法，用大白话解读视频内容
  - 解读风格：朋友聊天，不用专业术语
  - 包含：视频主题概括、逐条解读、观看建议
  - **文件**：`src/newsSummarizer.js`、`src/index.js`

### 优化改进
- 🔧 **YouTube 数据增强**：新增 `description` 字段（前 500 字符），提升 AI 摘要质量

## 2026-03-10

### 新增功能
- 📺 **YouTube KOL 视频追踪**：使用 Apify YouTube Scraper 追踪 11 个科技/商业 KOL 的演讲和访谈
  - 追踪对象：Elon Musk、Sam Altman、Yann LeCun、Andrej Karpathy、George Hotz、Marc Andreessen、Naval Ravikant、Balaji Srinivasan、Chamath Palihapitiya、Nassim Taleb、Patrick Collison
  - 关键词过滤：interview、keynote、talk、speech、lecture
  - 只抓取 24 小时内发布的视频
  - 自动去重（同一视频可能被多个频道转发）
  - 费用：约 $1.8/月（免费 $5 额度可用 2-3 个月）

### 技术探索
- ❌ **尝试 Apify Twitter Scraper**：需要付费套餐 $49/月，不支持免费计划，放弃
- ❌ **尝试 Google News RSS 追踪 KOL**：在国内被墙，服务器也无法访问，放弃
- ✅ **成功接入 Apify YouTube Scraper**：免费账户可用，搜索方式抓取，效果良好

### 部署
- 🚀 整合 YouTube 采集到主程序，每天早上 8:00 自动推送
- 📦 安装 `apify-client` 依赖包

## 2026-03-08

### 新增功能
- 📰 **新增 Y Combinator 信息源**：接入 YC 官方博客 RSS（https://www.ycombinator.com/blog/feed），涵盖 YC 公告、新批次入选、投资动向等内容

### Bug 修复
- 🐛 **排查重复推送问题**：确认代码和服务器均正常（单进程、单 KEY），根因是 Server酱 同一个 SendKey 绑定了多个通知渠道，处理方式：登录 sct.ftqq.com 关闭多余通道

### 部署
- 🚀 重新部署服务器，更新 `.env` 新闻源配置，新增 `ycombinator`

## 2026-02-25

### 🔧 Bug 修复
- **🐛 修复 KOL 思想领袖模块缺少原文链接**：
  - **根本原因**：`summarizeKOL()` 正常流程只返回 AI 解读文本，原始链接未附加到推送内容中（降级模式反而有链接）
  - **症状**：推送的思想领袖动态有解读但没有原文链接，用户无法跳转查看原文
  - **解决方案**：在 AI 解读后追加"原文链接"区块，格式为来源、标题、URL
  - **文件**：`src/newsSummarizer.js` `summarizeKOL()` 方法

### ⚠️ 已知事件
- **第三方 API 特价流量异常**：早上推送时触发降级模式，仅推送内容未推解读，后恢复正常。提醒关注 API 稳定性。

## 2026-02-24 (修复版)

### 🔧 关键 Bug 修复
- **🐛 修复 TechCrunch 和 Wired 无法采集的问题**：
  - **根本原因**：当前 RSS feed 使用普通 `<title>` 标签，而不是 CDATA 格式，原有正则表达式 `/<title><!\[CDATA\[(.*?)\]\]><\/title>/` 完全不匹配
  - **症状**：TechCrunch 和 Wired 虽然在 `.env` 配置中启用，但实际不返回任何新闻
  - **解决方案**：
    1. 改用普通 `<title>` 正则表达式进行匹配
    2. 采用 `<item>` 块级别的提取方法，精确配对每个新闻项的标题和链接
    3. 添加 HTML 实体解码（处理 `&#8217;` 等编码字符）
  - **测试结果**：✅ 成功采集（各获得 3 条新闻）
  - **验证**：`npm run start once` 从原来的 15 条新闻增至 19 条

### 新增功能
- ✨ **新增 The Information 新闻源代码**：添加了 The Information（专注科技商业报道的高端媒体）的采集模块

### 技术验证
- ✅ **TechCrunch 抓取验证**：已支持，使用 RSS 源 https://techcrunch.com/feed/ - 已修复 ✓
- ✅ **Wired 抓取验证**：已支持，使用 RSS 源 https://www.wired.com/feed/rss - 已修复 ✓
- ⚠️ **The Information 限制**：
  - RSS feed URL (`https://www.theinformation.com/feed.rss`) 返回 HTTP 400
  - 该媒体采用付费订阅模式，不提供公开 RSS feed
  - 代码已添加但暂无法正常工作，需要订阅认证密钥
  - 推荐作为后续可选集成项目

### 测试结果
- 📊 已测试的新闻源：19 条新闻成功采集
- 🎯 实际推送新闻源：Hacker News、TechCrunch、Wired、The Verge、Ars Technica、36氪、Product Hunt 等

## 2026-02-24

### 新增功能
- ✨ **新增 The Information 新闻源代码**：添加了 The Information（专注科技商业报道的高端媒体）的采集模块

### 技术验证
- ✅ **TechCrunch 抓取验证**：已支持，使用 RSS 源 https://techcrunch.com/feed/ - 测试通过 ✓
- ✅ **Wired 抓取验证**：已支持，使用 RSS 源 https://www.wired.com/feed/rss - 测试通过 ✓
- ⚠️ **The Information 限制**：
  - RSS feed URL (`https://www.theinformation.com/feed.rss`) 返回 HTTP 400
  - 该媒体采用付费订阅模式，不提供公开 RSS feed
  - 代码已添加但暂无法正常工作，需要订阅认证密钥
  - 推荐作为后续可选集成项目

### 测试结果
- 📊 已测试的新闻源：15+ 条新闻成功采集
- 🎯 实际推送新闻源：Hacker News、TechCrunch、The Verge、Ars Technica、36氪、Product Hunt 等

## 2026-02-23

### 新增功能
- ✨ **英文标题中文翻译**：新闻列表中的英文标题现在会自动显示中文翻译，格式为 "English Title (中文翻译)"
- 📰 **新增新闻源**：添加 The Verge 和 Ars Technica 两个优质科技媒体源
- 🚀 **服务器部署完成**：成功部署到腾讯云服务器，使用 PM2 管理进程，设置开机自启
- 📦 **开源发布**：推送到 GitHub (https://github.com/zhaosong2016/News-Pusher)，添加 MIT 开源协议

### Bug 修复
- 🐛 **修复 36氪链接显示 undefined**：正则表达式转义错误，将 `<!\\[CDATA\\[` 改为 `<![CDATA[`
- 🐛 **修复 Product Hunt 标题缺失**：改用 Atom 格式解析，通过 `<entry>` 块提取标题和链接配对
- 🐛 **修复 The Verge 解析失败**：适配 Atom 格式，使用 `<title type="html">` 提取
- 🐛 **修复 Ars Technica 标题显示 Unknown**：移除 CDATA 标签匹配，直接提取 `<title>` 内容

### 优化改进
- 🔧 **新闻源可靠性测试**：测试了 17+ 个全球新闻源，筛选出可靠访问的源
- 📝 **更新配置文件**：优化 `.env` 配置，移除不合适的新闻源（GitHub Trending、AFP）
- 🗑️ **移除 GitHub Trending**：该源返回的是代码仓库而非新闻，已从推荐配置中移除
- 🗑️ **移除 AFP（法新社）**：抓取的是产品介绍页面而非新闻内容，已移除
- 🌐 **最终推荐新闻源**：
  - 英文科技媒体：Hacker News、TechCrunch、The Verge、Ars Technica、Wired、Product Hunt
  - 中文媒体：36氪、IT之家
  - 配置：`NEWS_SOURCES=hackernews,techcrunch,theverge,arstechnica,36kr,ithome,wired,producthunt`

### 技术细节
- 改进了 AI 翻译 prompt，增加"必须翻译所有英文标题"的要求
- Product Hunt 使用 Atom 格式解析，通过 `<entry>` 块提取标题和链接配对
- 36氪 RSS 第一个标题是 "36氪" 本身，需要跳过
- The Verge 使用 Atom 格式，标题格式为 `<title type="html"><![CDATA[...]]>`
- Ars Technica 使用标准 RSS 格式，标题不含 CDATA 标签

### 部署信息
- 服务器：腾讯云 49.233.127.228
- 进程管理：PM2
- 推送时间：每天早上 08:00（北京时间）
- 推送方式：Server酱 → 微信

### 已知问题
- ❌ **被屏蔽的源**：Reddit、Barron's、NY Times、Reuters、Guardian、Asahi、Times of India 在国内网络环境下无法访问
- ⚠️ **Google News 人物追踪**：因 GFW 屏蔽，国内无法使用（服务器在海外可尝试）
- ⚠️ **cnBeta**：未在当前推荐配置中启用

### 下一步计划
- [x] 部署到腾讯云服务器
- [x] 验证服务器环境下的新闻源可用性
- [x] 推送到 GitHub 开源
- [ ] 测试明天早上 8:00 的自动推送
- [ ] 收集用户反馈，优化新闻总结质量
- [ ] 考虑添加更多可靠的中文科技媒体源
