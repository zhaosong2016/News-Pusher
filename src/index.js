import 'dotenv/config';
import cron from 'node-cron';
import { NewsCollector } from './newsCollector.js';
import { NewsSummarizer } from './newsSummarizer.js';
import { WechatPusher } from './wechatPusher.js';
import { KOLCollector } from './kolCollector.js';
import { YouTubeCollector } from './youtubeCollector.js';

/**
 * 主程序 - 新闻推送服务
 */
class NewsPusherService {
  constructor() {
    this.newsCollector = new NewsCollector();
    this.kolCollector = new KOLCollector();
    this.youtubeCollector = new YouTubeCollector(process.env.APIFY_API_TOKEN);
    this.newsSummarizer = new NewsSummarizer(process.env.ANTHROPIC_API_KEY);
    this.wechatPusher = new WechatPusher({
      serverChanKey: process.env.SERVER_CHAN_KEY,
      wechatWebhook: process.env.WECHAT_WEBHOOK
    });

    this.config = {
      sources: (process.env.NEWS_SOURCES || 'hackernews,techcrunch,36kr').split(','),
      maxCount: parseInt(process.env.MAX_NEWS_COUNT || '10'),
      pushTime: process.env.PUSH_TIME || '08:00',
      timezone: process.env.TIMEZONE || 'Asia/Shanghai'
    };
  }

  /**
   * 执行新闻推送任务
   */
  async executePushTask() {
    console.log(`\n🚀 开始执行新闻推送任务 - ${new Date().toLocaleString('zh-CN')}`);

    try {
      // 并行抓取新闻、KOL 内容、YouTube 视频
      console.log('📡 正在获取新闻、KOL 内容和 YouTube 视频...');
      const [news, kolItems, youtubeVideos] = await Promise.all([
        this.newsCollector.collectNews(this.config.sources, this.config.maxCount),
        this.kolCollector.collectKOL(),
        this.youtubeCollector.collectAllVideos()
      ]);

      if (news.length === 0 && kolItems.length === 0 && youtubeVideos.length === 0) {
        console.log('⚠️  未获取到任何内容');
        return;
      }

      console.log(`✅ 获取到 ${news.length} 条新闻，${kolItems.length} 条 KOL 内容，${youtubeVideos.length} 个视频`);

      // 分别生成 KOL 解读、YouTube 视频解读、新闻总结
      console.log('🤖 正在使用 AI 处理内容...');
      const [kolSummary, youtubeSummary, newsSummary] = await Promise.all([
        kolItems.length > 0 ? this.newsSummarizer.summarizeKOL(kolItems) : Promise.resolve(''),
        youtubeVideos.length > 0 ? this.newsSummarizer.summarizeYouTube(youtubeVideos) : Promise.resolve(''),
        news.length > 0 ? this.newsSummarizer.summarizeNews(news) : Promise.resolve('')
      ]);

      // 组合内容：KOL 内容 -> YouTube 视频 -> 新闻
      const fullContent = [
        kolSummary,
        youtubeSummary,
        newsSummary
      ].filter(Boolean).join('\n━━━━━━━━━━━━━━━━━━\n');

      console.log('📱 正在推送到微信...');
      const success = await this.wechatPusher.push('📰 今日科技要闻', fullContent);

      if (success) {
        console.log('✅ 新闻推送完成！');
      } else {
        console.log('❌ 新闻推送失败');
      }
    } catch (error) {
      console.error('❌ 任务执行失败:', error.message);
    }
  }

  /**
   * 启动定时任务
   */
  startScheduler() {
    const [hour, minute] = this.config.pushTime.split(':');
    const cronExpression = `${minute} ${hour} * * *`;

    console.log(`\n⏰ 定时任务已启动`);
    console.log(`📅 推送时间: 每天 ${this.config.pushTime}`);
    console.log(`🌏 时区: ${this.config.timezone}`);
    console.log(`📰 新闻源: ${this.config.sources.join(', ')}`);
    console.log(`📊 最大新闻数: ${this.config.maxCount}`);
    console.log(`\n等待定时任务触发...\n`);

    cron.schedule(cronExpression, () => {
      this.executePushTask();
    }, {
      timezone: this.config.timezone
    });
  }

  /**
   * 立即执行一次推送（用于测试）
   */
  async runOnce() {
    await this.executePushTask();
  }

  /**
   * 测试配置
   */
  async testConfig() {
    console.log('\n🔧 测试配置...\n');

    console.log('1️⃣ 测试新闻获取...');
    const news = await this.newsCollector.collectNews(['hackernews'], 3);
    console.log(`   获取到 ${news.length} 条测试新闻\n`);

    console.log('2️⃣ 测试微信推送...');
    await this.wechatPusher.testPush();

    console.log('\n✅ 配置测试完成');
  }
}

// 启动服务
const service = new NewsPusherService();

const args = process.argv.slice(2);
const command = args[0];

if (command === 'test') {
  service.testConfig();
} else if (command === 'once') {
  service.runOnce();
} else {
  service.startScheduler();
}
