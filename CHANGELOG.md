# 项目进展日志

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
