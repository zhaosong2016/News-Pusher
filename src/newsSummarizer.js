import Anthropic from '@anthropic-ai/sdk';

/**
 * AI 新闻总结器 - 使用 Claude 对新闻进行智能总结
 */
export class NewsSummarizer {
  constructor(apiKey) {
    // 支持自定义 API 端点（用于第三方中转）
    const baseURL = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
    this.client = new Anthropic({
      apiKey,
      baseURL
    });
  }

  /**
   * 使用 Claude 总结新闻列表
   */
  async summarizeNews(newsList) {
    if (!newsList || newsList.length === 0) {
      return '今日暂无科技新闻更新。';
    }

    const newsText = newsList.map((news, index) =>
      `${index + 1}. ${news.title}\n   来源: ${news.source}\n   链接: ${news.url}`
    ).join('\n\n');

    const prompt = `你是一个专业的科技新闻编辑。请对以下科技新闻进行总结和分析：

${newsText}

请按以下格式输出：

📰 今日科技要闻 (${new Date().toLocaleDateString('zh-CN')})

【核心观点】
用2-3句话概括今天最重要的科技趋势或事件。

【热点新闻】
选择3-5条最重要的新闻，每条用一句话总结要点，并说明为什么重要。

【值得关注】
列出其他值得关注的新闻标题（保持简洁）。

要求：
- 语言简洁专业，适合早晨快速阅读
- 突出技术趋势和行业影响
- 保持客观中立的态度`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-6',  // 使用第三方 API 支持的模型
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      // AI 总结 + 完整新闻列表(带翻译)
      const aiSummary = message.content[0].text;
      const newsListText = await this.generateNewsListWithTranslation(newsList);

      return `${aiSummary}\n\n━━━━━━━━━━━━━━━━━━\n\n📋 完整新闻列表\n\n${newsListText}`;
    } catch (error) {
      console.error('AI 总结失败:', error.status, error.message);
      if (error.error) {
        console.error('详细错误:', JSON.stringify(error.error));
      }
      console.log('使用降级方案：直接列出新闻标题');
      return this.generateFallbackSummary(newsList);
    }
  }

  /**
   * 对 KOL 内容进行 AI 解读
   */
  async summarizeKOL(kolList) {
    if (!kolList || kolList.length === 0) return '';

    const kolText = kolList.map((item, index) =>
      `${index + 1}. [${item.category}] ${item.source}\n   标题: ${item.title}\n   摘要: ${item.summary || '(无摘要)'}\n   链接: ${item.url}`
    ).join('\n\n');

    const prompt = `你是一个善于把复杂事情讲清楚的朋友。以下是过去7天一些科技领域重要人物写的文章或播客内容：

${kolText}

请用普通人能看懂的方式解读，按以下格式输出：

🧠 思想领袖动态 (${new Date().toLocaleDateString('zh-CN')})

【这周他们在聊什么】
用1-2句大白话说清楚这些人最近关注的核心话题是什么。

【逐条说人话】
对每条内容：
- 先用一句话说"他在说什么"（假设读者完全不懂技术）
- 再用一句话说"这跟我有什么关系"或"为什么值得知道"

要求：
- 不用专业术语，如果必须用，立刻解释
- 语气像朋友聊天，不像报告
- 不需要显得很厉害，只需要让人看懂`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });
      return message.content[0].text;
    } catch (error) {
      console.error('KOL 解读失败:', error.message);
      // 降级：直接列出
      return `🧠 思想领袖动态\n\n` + kolList.map(item =>
        `• [${item.category}] ${item.source}\n  ${item.title}\n  ${item.url}`
      ).join('\n\n');
    }
  }


  generateFallbackSummary(newsList) {
    const date = new Date().toLocaleDateString('zh-CN');
    let summary = `📰 今日科技要闻 (${date})\n\n`;

    newsList.forEach((news, index) => {
      summary += `${index + 1}. ${news.title}\n`;
      summary += `   来源: ${news.source}\n`;
      summary += `   ${news.url}\n\n`;
    });

    return summary;
  }

  /**
   * 生成完整新闻列表
   */
  generateNewsList(newsList) {
    let list = '';
    newsList.forEach((news, index) => {
      list += `${index + 1}. ${news.title}\n`;
      list += `   来源: ${news.source}\n`;
      list += `   ${news.url}\n\n`;
    });
    return list;
  }

  /**
   * 生成带翻译的新闻列表
   */
  async generateNewsListWithTranslation(newsList) {
    const newsText = newsList.map((news, index) =>
      `${index + 1}. ${news.title}\n   来源: ${news.source}\n   链接: ${news.url}`
    ).join('\n\n');

    const prompt = `请将以下新闻列表中的英文标题翻译成中文，格式要求：
- 如果标题是英文，输出格式为：序号. 英文标题 (中文翻译)
- 如果标题已经是中文，保持原样
- 保留"来源"和"链接"行不变
- 必须翻译所有英文标题，不要遗漏任何一条

新闻列表：
${newsText}

请直接输出翻译后的列表，不要添加任何额外说明。`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return message.content[0].text;
    } catch (error) {
      console.error('翻译失败，使用原始列表:', error.message);
      return this.generateNewsList(newsList);
    }
  }
}
