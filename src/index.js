import 'dotenv/config';
import cron from 'node-cron';
import { NewsCollector } from './newsCollector.js';
import { NewsSummarizer } from './newsSummarizer.js';
import { WechatPusher } from './wechatPusher.js';

/**
 * 主程序 - 新闻推送服务
 */
class NewsPusherService {
  constructor() {
    this.newsCollector = new NewsCollector();
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
      console.log('📡 正在获取新闻...');
      const news = await this.newsCollector.collectNews(
        this.config.sources,
        this.config.maxCount
      );

      if (news.length === 0) {
        console.log('⚠️  未获取到新闻内容');
        return;
      }

      console.log(`✅ 获取到 ${news.length} 条新闻`);

      console.log('🤖 正在使用 AI 总结新闻...');
      const summary = await this.newsSummarizer.summarizeNews(news);

      console.log('📱 正在推送到微信...');
      const success = await this.wechatPusher.push('📰 今日科技要闻', summary);

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
