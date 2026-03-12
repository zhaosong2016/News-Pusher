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

      // 过滤：只要最近 24 小时内的
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
        duration: video.duration,
        description: (video.description || '').slice(0, 500)
      }));

    } catch (error) {
      console.error(`❌ ${kolName} 抓取失败:`, error.message);
      return [];
    }
  }

  /**
   * 标题相似度去重（同一场访谈的不同转发）
   */
  deduplicateByTitleSimilarity(videos) {
    if (videos.length === 0) return [];

    // 按 KOL 分组
    const byKOL = {};
    for (const video of videos) {
      if (!byKOL[video.kolName]) byKOL[video.kolName] = [];
      byKOL[video.kolName].push(video);
    }

    const result = [];

    for (const [kolName, kolVideos] of Object.entries(byKOL)) {
      const kept = [];
      const removed = new Set();

      for (let i = 0; i < kolVideos.length; i++) {
        if (removed.has(i)) continue;

        const video1 = kolVideos[i];
        const similar = [video1];

        // 找出所有与 video1 相似的视频
        for (let j = i + 1; j < kolVideos.length; j++) {
          if (removed.has(j)) continue;

          const video2 = kolVideos[j];
          const similarity = this.calculateTitleSimilarity(video1.title, video2.title);

          if (similarity > 0.4) {  // 40% 相似度阈值
            similar.push(video2);
            removed.add(j);
          }
        }

        // 从相似的视频中选播放量最高的
        const best = similar.reduce((a, b) => (a.views || 0) > (b.views || 0) ? a : b);
        kept.push(best);
      }

      result.push(...kept);
    }

    return result;
  }

  /**
   * 计算两个标题的相似度（Jaccard 相似度）
   */
  calculateTitleSimilarity(title1, title2) {
    // 去除噪音词
    const noise = ['full', 'interview', 'keynote', 'talk', 'speech', 'lecture', 'discussion',
                   'exclusive', 'complete', 'entire', 'watch', 'live', 'official'];

    const normalize = (str) => {
      return str.toLowerCase()
        .replace(/[^\w\s]/g, ' ')  // 去标点
        .split(/\s+/)
        .filter(w => w.length > 2 && !noise.includes(w));
    };

    const words1 = new Set(normalize(title1));
    const words2 = new Set(normalize(title2));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
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

    // 去重：根据视频 ID（避免同一视频因 URL 参数不同被重复计入）
    const uniqueVideos = [];
    const seenIds = new Set();

    const getVideoId = (url) => {
      try {
        return new URL(url).searchParams.get('v') || url;
      } catch {
        return url;
      }
    };

    for (const video of allVideos) {
      const videoId = getVideoId(video.url);
      if (!seenIds.has(videoId)) {
        seenIds.add(videoId);
        uniqueVideos.push(video);
      }
    }

    console.log(`\n📺 第一轮去重：${allVideos.length} 个视频 → ${uniqueVideos.length} 个`);

    // 第二轮去重：按标题相似度（同一场访谈的不同转发）
    const dedupedByTitle = this.deduplicateByTitleSimilarity(uniqueVideos);

    console.log(`📺 第二轮去重：${uniqueVideos.length} 个视频 → ${dedupedByTitle.length} 个`);
    return dedupedByTitle;
  }
}
