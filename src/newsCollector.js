import axios from 'axios';

/**
 * 新闻获取器 - 从多个科技新闻源获取最新内容
 */
export class NewsCollector {
  constructor() {
    this.sources = {
      hackernews: this.fetchHackerNews.bind(this),
      techcrunch: this.fetchTechCrunch.bind(this),
      '36kr': this.fetch36Kr.bind(this),
      ithome: this.fetchITHome.bind(this),
      cnbeta: this.fetchCnBeta.bind(this),
      theverge: this.fetchTheVerge.bind(this),
      arstechnica: this.fetchArsTechnica.bind(this),
      producthunt: this.fetchProductHunt.bind(this),
      reddit: this.fetchRedditTech.bind(this),
      barrons: this.fetchBarrons.bind(this),
      wired: this.fetchWired.bind(this),
      fastcompany: this.fetchFastCompany.bind(this),
      theinformation: this.fetchTheInformation.bind(this),
      nytimes: this.fetchNYTimes.bind(this),
      reuters: this.fetchReuters.bind(this),
      guardian: this.fetchGuardian.bind(this),
      asahi: this.fetchAsahi.bind(this),
      timesofindia: this.fetchTimesOfIndia.bind(this),
      // 科技/AI 领域人物
      jensenhuang: this.fetchJensenHuang.bind(this),
      elonmusk: this.fetchElonMusk.bind(this),
      markzuckerberg: this.fetchMarkZuckerberg.bind(this),
      samaltman: this.fetchSamAltman.bind(this),
      andrewng: this.fetchAndrewNg.bind(this),
      feifeili: this.fetchFeiFeiLi.bind(this),
      // 思想家/作家
      malcolmgladwell: this.fetchMalcolmGladwell.bind(this),
      yannlecun: this.fetchYannLeCun.bind(this),
      thomassowell: this.fetchThomasSowell.bind(this),
      tylercowen: this.fetchTylerCowen.bind(this),
      nassimtaleb: this.fetchNassimTaleb.bind(this),
      // 政治/商业人物
      donaldtrump: this.fetchDonaldTrump.bind(this),
      joebiden: this.fetchJoeBiden.bind(this),
      rishisunak: this.fetchRishiSunak.bind(this),
      masayoshison: this.fetchMasayoshiSon.bind(this),
      // 其他
      raydalio: this.fetchRayDalio.bind(this),
      kevinkelly: this.fetchKevinKelly.bind(this)
    };
  }

  /**
   * 获取 Hacker News 热门新闻
   */
  async fetchHackerNews() {
    try {
      const topStoriesUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json';
      const { data: storyIds } = await axios.get(topStoriesUrl);

      const stories = await Promise.all(
        storyIds.slice(0, 5).map(async (id) => {
          const { data } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          return {
            title: data.title,
            url: data.url || `https://news.ycombinator.com/item?id=${id}`,
            score: data.score,
            source: 'Hacker News'
          };
        })
      );

      return stories.filter(s => s.score > 100).slice(0, 3);
    } catch (error) {
      console.error('获取 Hacker News 失败:', error.message);
      return [];
    }
  }

  /**
   * 获取 TechCrunch RSS (使用公开 API)
   */
  async fetchTechCrunch() {
    try {
      const rssUrl = 'https://techcrunch.com/feed/';
      const { data } = await axios.get(rssUrl);

      // 提取每个 <item> 块
      const itemRegex = /<item>(.*?)<\/item>/gs;
      const items = [...data.matchAll(itemRegex)].map(m => m[1]);

      const news = [];
      for (const item of items.slice(0, 3)) {
        const titleMatch = /<title>(.*?)<\/title>/.exec(item);
        const linkMatch = /<link>(.*?)<\/link>/.exec(item);
        
        if (titleMatch && linkMatch) {
          const title = titleMatch[1].trim();
          const url = linkMatch[1].trim();
          
          if (title && url && title !== 'TechCrunch' && url.includes('techcrunch.com')) {
            news.push({
              title: title.replace(/&#\d+;/g, c => String.fromCharCode(parseInt(c.match(/\d+/)[0]))), // decode HTML entities
              url,
              source: 'TechCrunch'
            });
          }
        }
      }

      return news;
    } catch (error) {
      console.error('获取 TechCrunch 失败:', error.message);
      return [];
    }
  }

  /**
   * 获取 36氪 热门文章
   */
  async fetch36Kr() {
    try {
      const { data } = await axios.get('https://www.36kr.com/feed', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const titleRegex = /<title>(.*?)<\/title>/g;
      const linkRegex = /<link><!\[CDATA\[(.*?)\]\]><\/link>/g;

      const titles = [...data.matchAll(titleRegex)].map(m => m[1]).slice(1, 4);
      const links = [...data.matchAll(linkRegex)].map(m => m[1]).slice(0, 3);

      return titles.map((title, i) => ({
        title,
        url: links[i],
        source: '36氪'
      }));
    } catch (error) {
      console.error('获取 36氪失败:', error.message);
      return [];
    }
  }

  /**
   * 获取 IT之家 最新资讯
   */
  async fetchITHome() {
    try {
      const { data } = await axios.get('https://www.ithome.com/rss/', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/g;
      const linkRegex = /<link>(.*?)<\/link>/g;

      const titles = [...data.matchAll(titleRegex)].map(m => m[1]).slice(1, 4);
      const links = [...data.matchAll(linkRegex)].map(m => m[1]).slice(1, 4);

      return titles.map((title, i) => ({
        title,
        url: links[i],
        source: 'IT之家'
      }));
    } catch (error) {
      console.error('获取 IT之家失败:', error.message);
      return [];
    }
  }

  /**
   * 获取 cnBeta 科技资讯
   */
  async fetchCnBeta() {
    try {
      const { data } = await axios.get('https://www.cnbeta.com.tw/backend.php', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/g;
      const linkRegex = /<link>(.*?)<\/link>/g;

      const titles = [...data.matchAll(titleRegex)].map(m => m[1]).slice(1, 4);
      const links = [...data.matchAll(linkRegex)].map(m => m[1]).slice(1, 4);

      return titles.map((title, i) => ({
        title,
        url: links[i],
        source: 'cnBeta'
      }));
    } catch (error) {
      console.error('获取 cnBeta 失败:', error.message);
      return [];
    }
  }

  /**
   * 获取 The Verge 科技新闻
   */
  async fetchTheVerge() {
    try {
      const { data } = await axios.get('https://www.theverge.com/rss/index.xml', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      const entries = [...data.matchAll(entryRegex)].slice(0, 3);

      return entries.map(entry => {
        const content = entry[1];
        const titleMatch = content.match(/<title type="html"><!\[CDATA\[(.*?)\]\]><\/title>/);
        const linkMatch = content.match(/<link rel="alternate" type="text\/html" href="([^"]+)"/);

        return {
          title: titleMatch ? titleMatch[1] : 'Unknown',
          url: linkMatch ? linkMatch[1] : 'https://www.theverge.com',
          source: 'The Verge'
        };
      });
    } catch (error) {
      console.error('获取 The Verge 失败:', error.message);
      return [];
    }
  }

  /**
   * 获取 Product Hunt 热门产品
   */
  async fetchProductHunt() {
    try {
      const { data } = await axios.get('https://www.producthunt.com/feed', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      // Product Hunt uses Atom format with <entry> blocks
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      const entries = [...data.matchAll(entryRegex)];

      const products = entries.slice(0, 3).map(entry => {
        const entryContent = entry[1];
        const titleMatch = entryContent.match(/<title>(.*?)<\/title>/);
        const linkMatch = entryContent.match(/<link rel="alternate"[^>]*href="([^"]+)"/);

        return {
          title: titleMatch ? titleMatch[1] : 'Unknown Product',
          url: linkMatch ? linkMatch[1] : 'https://www.producthunt.com',
          source: 'Product Hunt'
        };
      });

      return products;
    } catch (error) {
      console.error('获取 Product Hunt 失败:', error.message);
      return [];
    }
  }

  /**
   * 获取 Reddit 科技板块热门
   */
  async fetchRedditTech() {
    try {
      const { data } = await axios.get('https://www.reddit.com/r/technology/hot.json?limit=3', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      return data.data.children.map(post => ({
        title: post.data.title,
        url: post.data.url.startsWith('http') ? post.data.url : `https://reddit.com${post.data.permalink}`,
        source: 'Reddit Tech'
      }));
    } catch (error) {
      console.error('获取 Reddit 失败:', error.message);
      return [];
    }
  }

  /**
   * 获取巴伦周刊科技新闻
   */
  async fetchBarrons() {
    try {
      const { data } = await axios.get('https://www.barrons.com/rss/RSSMarketsMain.xml', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const titleRegex = /<title>(.*?)<\/title>/g;
      const linkRegex = /<link>(.*?)<\/link>/g;

      const titles = [...data.matchAll(titleRegex)].map(m => m[1]).slice(1, 4);
      const links = [...data.matchAll(linkRegex)].map(m => m[1]).slice(1, 4);

      return titles.map((title, i) => ({
        title,
        url: links[i],
        source: "Barron's"
      }));
    } catch (error) {
      console.error('获取巴伦周刊失败:', error.message);
      return [];
    }
  }

  /**
   * 获取连线杂志科技新闻
   */
  async fetchWired() {
    try {
      const { data } = await axios.get('https://www.wired.com/feed/rss', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      // 提取每个 <item> 块
      const itemRegex = /<item>(.*?)<\/item>/gs;
      const items = [...data.matchAll(itemRegex)].map(m => m[1]);

      const news = [];
      for (const item of items.slice(0, 3)) {
        const titleMatch = /<title>(.*?)<\/title>/.exec(item);
        const linkMatch = /<link>(.*?)<\/link>/.exec(item);
        
        if (titleMatch && linkMatch) {
          const title = titleMatch[1].trim();
          const url = linkMatch[1].trim();
          
          if (title && url && title !== 'WIRED' && url.includes('wired.com')) {
            news.push({
              title: title.replace(/&amp;/g, '&').replace(/&#\d+;/g, c => String.fromCharCode(parseInt(c.match(/\d+/)[0]))),
              url,
              source: 'Wired'
            });
          }
        }
      }

      return news;
    } catch (error) {
      console.error('获取 Wired 失败:', error.message);
      return [];
    }
  }

  /**
   * 获取快公司科技新闻
   */
  async fetchFastCompany() {
    try {
      const { data } = await axios.get('https://www.fastcompany.com/technology/rss', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/g;
      const linkRegex = /<link>(.*?)<\/link>/g;

      const titles = [...data.matchAll(titleRegex)].map(m => m[1]).slice(1, 4);
      const links = [...data.matchAll(linkRegex)].map(m => m[1]).slice(1, 4);

      return titles.map((title, i) => ({
        title,
        url: links[i],
        source: 'Fast Company'
      }));
    } catch (error) {
      console.error('获取 Fast Company 失败:', error.message);
      return [];
    }
  }

  /**
   * 获取 The Information 科技新闻 (需要特殊处理)
   */
  async fetchTheInformation() {
    try {
      // The Information 通常需要订阅，尝试通过 RSS feed
      const { data } = await axios.get('https://www.theinformation.com/feed.rss', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const titleRegex = /<title>(.*?)<\/title>/g;
      const linkRegex = /<link>(.*?)<\/link>/g;

      const titles = [...data.matchAll(titleRegex)].map(m => m[1]).slice(1, 4);
      const links = [...data.matchAll(linkRegex)].map(m => m[1]).slice(1, 4);

      return titles.map((title, i) => ({
        title,
        url: links[i],
        source: 'The Information'
      }));
    } catch (error) {
      console.error('获取 The Information 失败:', error.message);
      return [];
    }
  }

  /**
   * 获取纽约时报科技新闻
   */
  async fetchNYTimes() {
    try {
      const { data } = await axios.get('https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const titleRegex = /<title>(.*?)<\/title>/g;
      const linkRegex = /<link>(.*?)<\/link>/g;

      const titles = [...data.matchAll(titleRegex)].map(m => m[1]).slice(1, 4);
      const links = [...data.matchAll(linkRegex)].map(m => m[1]).slice(1, 4);

      return titles.map((title, i) => ({
        title,
        url: links[i],
        source: 'NY Times'
      }));
    } catch (error) {
      console.error('获取纽约时报失败:', error.message);
      return [];
    }
  }

  /**
   * 获取路透社科技新闻
   */
  async fetchReuters() {
    try {
      const { data } = await axios.get('https://www.reuters.com/technology', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const titleRegex = /<h3[^>]*data-testid="Heading"[^>]*>(.*?)<\/h3>/g;
      const matches = [...data.matchAll(titleRegex)].slice(0, 3);

      return matches.map(match => ({
        title: match[1].replace(/<[^>]*>/g, ''),
        url: 'https://www.reuters.com/technology',
        source: 'Reuters'
      }));
    } catch (error) {
      console.error('获取路透社失败:', error.message);
      return [];
    }
  }

  /**
   * 获取卫报科技新闻
   */
  async fetchGuardian() {
    try {
      const { data } = await axios.get('https://www.theguardian.com/technology/rss', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/g;
      const linkRegex = /<link>(.*?)<\/link>/g;

      const titles = [...data.matchAll(titleRegex)].map(m => m[1]).slice(1, 4);
      const links = [...data.matchAll(linkRegex)].map(m => m[1]).slice(1, 4);

      return titles.map((title, i) => ({
        title,
        url: links[i],
        source: 'The Guardian'
      }));
    } catch (error) {
      console.error('获取卫报失败:', error.message);
      return [];
    }
  }

  /**
   * 获取朝日新闻科技新闻
   */
  async fetchAsahi() {
    try {
      const { data } = await axios.get('https://www.asahi.com/rss/asahi/digital.rdf', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const titleRegex = /<title>(.*?)<\/title>/g;
      const linkRegex = /<link>(.*?)<\/link>/g;

      const titles = [...data.matchAll(titleRegex)].map(m => m[1]).slice(1, 4);
      const links = [...data.matchAll(linkRegex)].map(m => m[1]).slice(1, 4);

      return titles.map((title, i) => ({
        title,
        url: links[i],
        source: '朝日新闻'
      }));
    } catch (error) {
      console.error('获取朝日新闻失败:', error.message);
      return [];
    }
  }

  /**
   * 获取 Ars Technica 科技新闻
   */
  async fetchArsTechnica() {
    try {
      const { data } = await axios.get('https://feeds.arstechnica.com/arstechnica/index', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const items = [...data.matchAll(itemRegex)].slice(0, 3);

      return items.map(item => {
        const content = item[1];
        const titleMatch = content.match(/<title>(.*?)<\/title>/);
        const linkMatch = content.match(/<link>(.*?)<\/link>/);

        return {
          title: titleMatch ? titleMatch[1] : 'Unknown',
          url: linkMatch ? linkMatch[1] : 'https://arstechnica.com',
          source: 'Ars Technica'
        };
      });
    } catch (error) {
      console.error('获取 Ars Technica 失败:', error.message);
      return [];
    }
  }

  /**
   * 获取印度时报科技新闻
   */
  async fetchTimesOfIndia() {
    try {
      const { data } = await axios.get('https://timesofindia.indiatimes.com/rssfeeds/66949542.cms', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/g;
      const linkRegex = /<link>(.*?)<\/link>/g;

      const titles = [...data.matchAll(titleRegex)].map(m => m[1]).slice(1, 4);
      const links = [...data.matchAll(linkRegex)].map(m => m[1]).slice(1, 4);

      return titles.map((title, i) => ({
        title,
        url: links[i],
        source: 'Times of India'
      }));
    } catch (error) {
      console.error('获取印度时报失败:', error.message);
      return [];
    }
  }

  /**
   * 通用 Google News 人物搜索方法
   */
  async fetchGoogleNewsPerson(name, displayName) {
    try {
      const query = encodeURIComponent(`${name} when:1d`);
      const { data } = await axios.get(`https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const titleRegex = /<title>(.*?)<\/title>/g;
      const linkRegex = /<link>(.*?)<\/link>/g;

      const titles = [...data.matchAll(titleRegex)].map(m => m[1]).slice(1, 4);
      const links = [...data.matchAll(linkRegex)].map(m => m[1]).slice(1, 4);

      return titles.map((title, i) => ({
        title,
        url: links[i],
        source: `${displayName} News`
      }));
    } catch (error) {
      console.error(`获取 ${displayName} 新闻失败:`, error.message);
      return [];
    }
  }

  // 科技/AI 领域人物
  async fetchJensenHuang() { return this.fetchGoogleNewsPerson('Jensen Huang', '黄仁勋'); }
  async fetchElonMusk() { return this.fetchGoogleNewsPerson('Elon Musk', '马斯克'); }
  async fetchMarkZuckerberg() { return this.fetchGoogleNewsPerson('Mark Zuckerberg', '扎克伯格'); }
  async fetchSamAltman() { return this.fetchGoogleNewsPerson('Sam Altman', 'Sam Altman'); }
  async fetchAndrewNg() { return this.fetchGoogleNewsPerson('Andrew Ng', '吴恩达'); }
  async fetchFeiFeiLi() { return this.fetchGoogleNewsPerson('Fei-Fei Li', '李飞飞'); }

  // 思想家/作家
  async fetchMalcolmGladwell() { return this.fetchGoogleNewsPerson('Malcolm Gladwell', 'Malcolm Gladwell'); }
  async fetchYannLeCun() { return this.fetchGoogleNewsPerson('Yann LeCun', 'Yann LeCun'); }
  async fetchThomasSowell() { return this.fetchGoogleNewsPerson('Thomas Sowell', 'Thomas Sowell'); }
  async fetchTylerCowen() { return this.fetchGoogleNewsPerson('Tyler Cowen', 'Tyler Cowen'); }
  async fetchNassimTaleb() { return this.fetchGoogleNewsPerson('Nassim Taleb', '塔勒布'); }

  // 政治/商业人物
  async fetchDonaldTrump() { return this.fetchGoogleNewsPerson('Donald Trump', 'Trump'); }
  async fetchJoeBiden() { return this.fetchGoogleNewsPerson('Joe Biden', 'Biden'); }
  async fetchRishiSunak() { return this.fetchGoogleNewsPerson('Rishi Sunak', 'Rishi Sunak'); }
  async fetchMasayoshiSon() { return this.fetchGoogleNewsPerson('Masayoshi Son', '孙正义'); }

  // 其他
  async fetchRayDalio() { return this.fetchGoogleNewsPerson('Ray Dalio', '达里奥'); }
  async fetchKevinKelly() { return this.fetchGoogleNewsPerson('Kevin Kelly KK', 'KK'); }

  /**
   * 从配置的源获取所有新闻
   */
  async collectNews(sources = ['hackernews', 'techcrunch', '36kr'], maxCount = 10) {
    const allNews = [];

    for (const source of sources) {
      if (this.sources[source]) {
        const news = await this.sources[source]();
        allNews.push(...news);
      }
    }

    // 去重（根据标题）
    const uniqueNews = [];
    const seenTitles = new Set();

    for (const news of allNews) {
      if (!seenTitles.has(news.title)) {
        seenTitles.add(news.title);
        uniqueNews.push(news);
      }
    }

    return uniqueNews.slice(0, maxCount);
  }
}
