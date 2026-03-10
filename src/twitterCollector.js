import { ApifyClient } from 'apify-client';

/**
 * Twitter/X 推文采集器 - 使用 Apify
 */
export class TwitterCollector {
  constructor(apiToken) {
    this.client = new ApifyClient({ token: apiToken });
    this.actorId = '61RPP7dywgiy0JPD0';
  }

  /**
   * 科技/商业意见领袖列表
   */
  getKOLList() {
    return [
      // 科技/AI 领域
      { username: 'elonmusk', name: 'Elon Musk' },
      { username: 'sama', name: 'Sam Altman' },
      { username: 'ylecun', name: 'Yann LeCun' },
      { username: 'karpathy', name: 'Andrej Karpathy' },
      { username: 'realGeorgeHotz', name: 'George Hotz' },
      { username: 'demishassabis', name: 'Demis Hassabis' },

      // 投资/商业领域
      { username: 'pmarca', name: 'Marc Andreessen' },
      { username: 'paulg', name: 'Paul Graham' },
      { username: 'naval', name: 'Naval Ravikant' },
      { username: 'balajis', name: 'Balaji Srinivasan' },
      { username: 'chamath', name: 'Chamath Palihapitiya' },

      // 思想/评论家
      { username: 'nntaleb', name: 'Nassim Taleb' },
      { username: 'tylercowen', name: 'Tyler Cowen' },
      { username: 'patrickc', name: 'Patrick Collison' }
    ];
  }

  /**
   * 抓取指定用户的最新推文
   */
  async fetchUserTweets(username, maxTweets = 5) {
    try {
      console.log(`正在抓取 @${username}...`);

      const input = {
        twitterHandles: [username],
        maxItems: maxTweets,
        sort: 'Latest'
      };

      // 运行 actor 并等待完成
      const run = await this.client.actor(this.actorId).call(input);

      // 获取结果
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();

      return items.map(tweet => ({
        text: tweet.full_text || tweet.text,
        url: tweet.url,
        createdAt: tweet.created_at,
        username: username
      }));

    } catch (error) {
      console.error(`抓取 @${username} 失败:`, error.message);
      return [];
    }
  }

  /**
   * 等待 Apify 任务完成
   */
  async waitForRun(runId, maxWaitTime = 60000) {
    // SDK 的 call() 方法已经自动等待完成，不需要手动轮询
    return true;
  }

  /**
   * 批量抓取所有 KOL 的推文
   */
  async collectAllKOLTweets(tweetsPerUser = 3) {
    const kols = this.getKOLList();
    const allTweets = [];

    console.log(`开始抓取 ${kols.length} 位 KOL 的推文...`);

    for (const kol of kols) {
      console.log(`正在抓取 @${kol.username} (${kol.name})...`);
      const tweets = await this.fetchUserTweets(kol.username, tweetsPerUser);

      tweets.forEach(tweet => {
        allTweets.push({
          ...tweet,
          kolName: kol.name
        });
      });

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ 共抓取到 ${allTweets.length} 条推文`);
    return allTweets;
  }
}
