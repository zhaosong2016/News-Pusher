import axios from 'axios';

/**
 * KOL 内容抓取器 - 抓取科技思想领袖的博客和播客
 */
export class KOLCollector {
  constructor() {
    this.sources = [
      // 🧠 技术深度
      { name: 'Simon Willison', url: 'https://simonwillison.net/atom/everything/', category: '技术洞察' },
      { name: 'Nathan Lambert', url: 'https://www.interconnects.ai/feed', category: '技术洞察' },
      { name: 'fast.ai (Jeremy Howard)', url: 'https://www.fast.ai/index.xml', category: '技术洞察' },
      // 💰 投资与创业
      { name: 'Paul Graham', url: 'https://www.paulgraham.com/rss.html', category: '创业思维' },
      // 🌍 宏观趋势
      { name: 'Tyler Cowen (Marginal Revolution)', url: 'https://marginalrevolution.com/feed', category: '宏观趋势' },
      // 🏢 官方博客
      { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', category: '官方发声' },
      // 🎙 播客
      { name: 'Lex Fridman Podcast', url: 'https://lexfridman.com/feed/podcast/', category: '深度访谈' },
    ];
  }

  /**
   * 解析 RSS/Atom feed
   */
  async fetchFeed(source) {
    try {
      const { data } = await axios.get(source.url, {
        timeout: 10000,
        headers: { 'User-Agent': 'NewsPusher/1.0' }
      });

      const items = [];

      // 提取 <item> 或 <entry> 块
      const blocks = data.match(/<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/g) || [];

      for (const block of blocks.slice(0, 3)) {
        const title = this._extract(block, 'title');
        const link = this._extractLink(block);
        const pubDate = this._extract(block, 'published') ||
                        this._extract(block, 'pubDate') ||
                        this._extract(block, 'updated') || '';
        const summary = this._extractSummary(block);

        if (!title || !link) continue;

        // 只取 7 天内的内容
        if (pubDate && !this._isRecent(pubDate, 7)) continue;

        items.push({
          title: this._decodeEntities(title),
          url: link,
          source: source.name,
          category: source.category,
          summary: summary ? this._decodeEntities(summary).slice(0, 300) : '',
          pubDate,
        });
      }

      console.log(`✅ [KOL] ${source.name}: ${items.length} 条`);
      return items;
    } catch (error) {
      console.error(`❌ [KOL] ${source.name} 抓取失败: ${error.message}`);
      return [];
    }
  }

  _extract(text, tag) {
    const cdataMatch = text.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'));
    if (cdataMatch) return cdataMatch[1].trim();
    const match = text.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    return match ? match[1].trim() : '';
  }

  _extractLink(block) {
    // Atom: <link href="..."/>
    const atomMatch = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
    if (atomMatch) return atomMatch[1];
    // RSS: <link>...</link>
    const rssMatch = block.match(/<link>([^<]+)<\/link>/i);
    return rssMatch ? rssMatch[1].trim() : '';
  }

  _extractSummary(block) {
    return this._extract(block, 'summary') ||
           this._extract(block, 'description') ||
           this._extract(block, 'content');
  }

  _isRecent(dateStr, days) {
    try {
      const pub = new Date(dateStr);
      const now = new Date();
      return (now - pub) <= days * 24 * 60 * 60 * 1000;
    } catch {
      return true;
    }
  }

  _decodeEntities(str) {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  /**
   * 抓取所有 KOL 内容
   */
  async collectKOL() {
    const results = [];
    for (const source of this.sources) {
      const items = await this.fetchFeed(source);
      results.push(...items);
    }
    console.log(`📡 KOL 内容共抓取 ${results.length} 条`);
    return results;
  }
}
