import { ApifyClient } from 'apify-client';

/**
 * YouTube 视频采集器 - 抓取 KOL 的演讲、访谈、讲座
 */
export class YouTubeCollector {
  constructor(apiToken) {
    this.client = new ApifyClient({ token: apiToken });
    this.actorId = 'h7sDV53CddomktSi5';
  }

  /**
   * KOL YouTube 频道列表
   */
  getKOLChannels() {
    return [
      // 科技/AI 领域
      { name: 'Elon Musk', channelUrl: 'https://www.youtube.com/@elonmusk' },
      { name: 'Sam Altman', channelUrl: 'https://www.youtube.com/@samaltman' },
      { name: 'Yann LeCun', channelUrl: 'https://www.youtube.com/@yannlecun' },
      { name: 'Andrej Karpathy', channelUrl: 'https://www.youtube.com/@AndrejKarpathy' },
      { name: 'George Hotz', channelUrl: 'https://www.youtube.com/@geohotz' },

      // 投资/商业领域
      { name: 'Marc Andreessen', channelUrl: 'https://www.youtube.com/@pmarca' },
      { name: 'Naval Ravikant', channelUrl: 'https://www.youtube.com/@naval' },
      { name: 'Balaji Srinivasan', channelUrl: 'https://www.youtube.com/@balajis' },
      { name: 'Chamath Palihapitiya', channelUrl: 'https://www.youtube.com/@chamath' },

      // 思想/评论家
      { name: 'Nassim Taleb', channelUrl: 'https://www.youtube.com/@nntaleb' },
      { name: 'Patrick Collison', channelUrl: 'https://www.youtube.com/@patrickc' },
    ];
  }

  /**
   * 检查视频标题是否包含关键词
   */
  hasKeywords(title) {
    const keywords = ['interview', 'keynote', 'talk', 'speech', 'lecture'];
    const lowerTitle = title.toLowerCase();
    return keywords.some(keyword => lowerTitle.includes(keyword));
  }

  /**
   * 检查视频是否在最近 N 天内发布
   */
  isRecent(dateStr, days = 1) {
    try {
      const pub = new Date(dateStr);
      const now = new Date();
      return (now - pub) <= days * 24 * 60 * 60 * 1000;
    } catch {
      return true; // 如果日期解析失败，保留视频
    }
  }

  /**
   * 抓取指定 KOL 的最新视频
   */
  async fetchKOLVideos(kolName) {
    try {
      console.log(`正在搜索 ${kolName} 的视频...`);

      // 搜索：KOL 名字 + 关键词
      const searchQuery = `${kolName} interview OR keynote OR talk OR speech OR lecture`;

      const input = {
        searchQueries: [searchQuery],
        maxResults: 10,
        maxResultsShorts: 0,
        maxResultStreams: 0
      };

      // 运行 actor
      const run = await this.client.actor(this.actorId).call(input);

      // 获取结果
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();

      // 过滤：只要最近 7 天的
      const filtered = items.filter(video => {
        return this.isRecent(video.date || video.uploadDate);
      });

      console.log(`✅ ${kolName}: 找到 ${filtered.length} 个相关视频`);

      return filtered.map(video => ({
        title: video.title,
        url: video.url,
        kolName: kolName,
        publishedAt: video.date || video.uploadDate,
        views: video.viewCount,
        duration: video.duration
      }));

    } catch (error) {
      console.error(`❌ ${kolName} 抓取失败:`, error.message);
      return [];
    }
  }

  /**
   * 批量抓取所有 KOL 的视频
   */
  async collectAllVideos() {
    const kols = [
      'Elon Musk', 'Sam Altman', 'Yann LeCun', 'Andrej Karpathy', 'George Hotz',
      'Marc Andreessen', 'Naval Ravikant', 'Balaji Srinivasan', 'Chamath Palihapitiya',
      'Nassim Taleb', 'Patrick Collison'
    ];
    const allVideos = [];

    console.log(`开始搜索 ${kols.length} 个 KOL 的视频...`);

    for (const kol of kols) {
      const videos = await this.fetchKOLVideos(kol);
      allVideos.push(...videos);

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 去重：根据视频 URL
    const uniqueVideos = [];
    const seenUrls = new Set();

    for (const video of allVideos) {
      if (!seenUrls.has(video.url)) {
        seenUrls.add(video.url);
        uniqueVideos.push(video);
      }
    }

    console.log(`\n📺 共找到 ${allVideos.length} 个视频，去重后 ${uniqueVideos.length} 个`);
    return uniqueVideos;
  }
}
