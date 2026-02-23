# 配置参数说明

本文档记录了项目中所有可配置参数及其对应的文件位置和取值规范。

## 环境变量配置 (.env)

### Claude API 配置
| 参数名 | 文件位置 | 说明 | 示例值 |
|--------|---------|------|--------|
| `ANTHROPIC_API_KEY` | `.env` | Claude API 密钥 | `sk-acw-xxxxx` |
| `ANTHROPIC_BASE_URL` | `.env` | API 端点（可选，用于第三方中转） | `https://api.aicodewith.com` |

### 微信推送配置
| 参数名 | 文件位置 | 说明 | 示例值 |
|--------|---------|------|--------|
| `SERVER_CHAN_KEY` | `.env` | Server酱推送密钥（单人推送） | `SCT315751TvA7PCXkKDwak4whTgklCJ8k6` |
| `SERVER_CHAN_KEYS` | `.env` | Server酱推送密钥（多人推送，逗号分隔，需修改代码） | `SCT123,SCT456,SCT789` |
| `WECHAT_WEBHOOK` | `.env` | 企业微信群机器人 Webhook（群组推送） | `https://qyapi.weixin.qq.com/...` |

**多人推送方案**：
1. **方案一（推荐）**：使用企业微信群机器人，所有群成员都能收到
2. **方案二**：每人获取自己的 Server酱 SendKey，配置到 `SERVER_CHAN_KEYS`（需修改代码支持）
3. **方案三**：部署多个服务实例，每个实例对应一个人的 SendKey

### 定时任务配置
| 参数名 | 文件位置 | 说明 | 取值范围 | 示例值 |
|--------|---------|------|---------|--------|
| `PUSH_TIME` | `.env` | 每日推送时间 | `HH:MM` 格式 | `08:00` |
| `TIMEZONE` | `.env` | 时区 | IANA 时区标识符 | `Asia/Shanghai` |

### 新闻源配置
| 参数名 | 文件位置 | 说明 | 取值范围 | 示例值 |
|--------|---------|------|---------|--------|
| `NEWS_SOURCES` | `.env` | 新闻源列表（逗号分隔） | 见下方"可用新闻源" | `hackernews,techcrunch,36kr` |
| `MAX_NEWS_COUNT` | `.env` | 最大新闻数量 | 正整数，建议 10-50 | `30` |

#### 可用新闻源列表
**英文科技媒体**（推荐，已验证可用）：
- `hackernews` - Hacker News
- `techcrunch` - TechCrunch
- `theverge` - The Verge ⭐ 新增
- `arstechnica` - Ars Technica ⭐ 新增
- `wired` - Wired
- `producthunt` - Product Hunt

**中文媒体**（推荐，已验证可用）：
- `36kr` - 36氪
- `ithome` - IT之家
- `cnbeta` - cnBeta

**其他媒体**（国内可能被墙，不推荐）：
- `reddit` - Reddit Tech
- `nytimes` - 纽约时报
- `reuters` - 路透社
- `guardian` - 卫报
- `barrons` - 巴伦周刊
- `fastcompany` - Fast Company
- `asahi` - 朝日新闻
- `timesofindia` - 印度时报

**已移除的源**（不适合或无法使用）：
- ~~`github`~~ - GitHub Trending（返回代码仓库而非新闻）
- ~~`afp`~~ - 法新社（抓取的是产品介绍页）

**Google News 人物追踪**（需要海外服务器）：
- `jensenhuang` - 黄仁勋
- `elonmusk` - 马斯克
- `markzuckerberg` - 扎克伯格
- `samaltman` - Sam Altman
- `andrewng` - 吴恩达
- `feifeili` - 李飞飞
- `malcolmgladwell` - Malcolm Gladwell
- `yannlecun` - Yann LeCun
- `thomassowell` - Thomas Sowell
- `tylercowen` - Tyler Cowen
- `nassimtaleb` - 塔勒布
- `donaldtrump` - Trump
- `joebiden` - Biden
- `rishisunak` - Rishi Sunak
- `masayoshison` - 孙正义
- `raydalio` - 达里奥
- `kevinkelly` - KK

## 代码内部参数

### AI 总结配置 (src/newsSummarizer.js)
| 参数名 | 代码位置 | 说明 | 当前值 |
|--------|---------|------|--------|
| `model` | `newsSummarizer.js:47, 111` | Claude 模型版本 | `claude-sonnet-4-6` |
| `max_tokens` | `newsSummarizer.js:48, 112` | 最大生成 token 数 | `2000` |

### 新闻获取配置 (src/newsCollector.js)
| 参数名 | 代码位置 | 说明 | 当前值 |
|--------|---------|------|--------|
| Hacker News 最小分数 | `newsCollector.js:70` | 过滤低分新闻 | `100` |
| 每个源获取数量 | 各 fetch 方法 | 每个新闻源获取的新闻数 | `3` |
| Hacker News 初始获取数 | `newsCollector.js:59` | 用于筛选的初始数量 | `5` |

### 部署配置 (deploy.sh)
| 参数名 | 代码位置 | 说明 | 当前值 |
|--------|---------|------|--------|
| `SERVER_IP` | `deploy.sh:6` | 服务器 IP 地址 | `49.233.127.228` |
| `SERVER_USER` | `deploy.sh:7` | SSH 用户名 | `root` |
| `REMOTE_DIR` | `deploy.sh:8` | 服务器部署目录 | `/root/news-pusher` |

## 修改建议

### 调整推送时间
```bash
# 编辑 .env
PUSH_TIME=07:30  # 改为早上 7:30
```

### 增加新闻数量
```bash
# 编辑 .env
MAX_NEWS_COUNT=50  # 增加到 50 条
```

### 更换新闻源组合
```bash
# 编辑 .env

# 示例1: 推荐配置（已验证可用）
NEWS_SOURCES=hackernews,techcrunch,theverge,arstechnica,36kr,ithome,wired,producthunt

# 示例2: 只看英文科技媒体
NEWS_SOURCES=hackernews,techcrunch,theverge,arstechnica,wired

# 示例3: 中英文混合（精简版）
NEWS_SOURCES=hackernews,techcrunch,36kr,ithome

# 示例4: 全球视角（需要海外服务器）
NEWS_SOURCES=hackernews,nytimes,guardian,36kr,asahi
```

### 多人推送配置

#### 方案一：企业微信群机器人（推荐）
```bash
# 1. 创建企业微信群，拉入所有需要接收推送的人
# 2. 群设置 → 群机器人 → 添加机器人
# 3. 获取 Webhook 地址，配置到 .env
WECHAT_WEBHOOK=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxx
```

#### 方案二：多个 Server酱 SendKey
```bash
# 1. 每个人访问 https://sct.ftqq.com/ 获取自己的 SendKey
# 2. 配置到 .env（需修改 src/wechatPusher.js 支持多 key）
SERVER_CHAN_KEYS=SCT你的key,SCT朋友1的key,SCT朋友2的key
```

#### 方案三：部署多个服务实例
```bash
# 在服务器上复制项目目录
cp -r /root/news-pusher /root/news-pusher-friend1

# 修改新实例的 .env 中的 SERVER_CHAN_KEY
# 用 PM2 启动新实例
pm2 start src/index.js --name news-pusher-friend1
```

### 调整 AI 模型参数
如需修改 AI 总结的详细程度，编辑 `src/newsSummarizer.js`:
```javascript
// 增加生成长度
max_tokens: 3000  // 原值 2000

// 更换模型（如果需要更快速度）
model: 'claude-haiku-4'  // 原值 'claude-sonnet-4-6'
```

### 调整新闻质量过滤
编辑 `src/newsCollector.js` 中的 Hacker News 过滤条件:
```javascript
// 提高质量门槛
return stories.filter(s => s.score > 200).slice(0, 3);  // 原值 100
```

## 注意事项

1. **API 密钥安全**：`.env` 文件包含敏感信息，不要提交到 Git
2. **新闻源可用性**：部分国际新闻源在国内可能无法访问
3. **API 配额**：Claude API 有调用限制，注意控制 `MAX_NEWS_COUNT`
4. **服务器配置**：修改 `deploy.sh` 中的服务器信息后才能部署
