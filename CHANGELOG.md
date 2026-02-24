# 项目进展日志

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
