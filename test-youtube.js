import 'dotenv/config';
import { YouTubeCollector } from './src/youtubeCollector.js';
import { NewsSummarizer } from './src/newsSummarizer.js';

async function test() {
  console.log('🧪 测试 YouTube 功能\n');

  // 只测试 2 个 KOL
  const youtubeCollector = new YouTubeCollector(process.env.APIFY_API_TOKEN);

  console.log('1️⃣ 测试视频抓取（只搜 Sam Altman 和 Yann LeCun）...\n');

  const videos = [];
  for (const kol of ['Sam Altman', 'Yann LeCun']) {
    const result = await youtubeCollector.fetchKOLVideos(kol);
    videos.push(...result);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ 共抓取 ${videos.length} 个视频`);

  if (videos.length > 0) {
    console.log('\n视频列表：');
    videos.forEach((v, i) => {
      console.log(`${i + 1}. ${v.kolName}: ${v.title}`);
      console.log(`   URL: ${v.url}`);
      console.log(`   描述: ${v.description ? v.description.slice(0, 100) + '...' : '无'}\n`);
    });

    console.log('\n2️⃣ 测试 AI 摘要...\n');
    const summarizer = new NewsSummarizer(process.env.ANTHROPIC_API_KEY);
    const summary = await summarizer.summarizeYouTube(videos);

    console.log('━━━━━━━━━━━━━━━━━━');
    console.log(summary);
    console.log('━━━━━━━━━━━━━━━━━━');
  } else {
    console.log('\n⚠️  没有找到 24 小时内的视频');
  }
}

test().catch(console.error);
