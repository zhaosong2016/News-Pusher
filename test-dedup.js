import { YouTubeCollector } from './src/youtubeCollector.js';

const collector = new YouTubeCollector('fake-token');

// 模拟你今天早上收到的数据
const testVideos = [
  {
    title: 'FULL INTERVIEW: OpenAI CEO Sam Altman Speaks on AI Scaling and Infrastructure Need',
    url: 'https://www.youtube.com/watch?v=sTnl8O_BuuE',
    kolName: 'Sam Altman',
    views: 50000
  },
  {
    title: '"Flood The World With Intelligence" – Sam Altman On AI',
    url: 'https://www.youtube.com/watch?v=FS1fU5bwVt0',
    kolName: 'Sam Altman',
    views: 30000
  },
  {
    title: 'FULL DISCUSSION: OpenAI CEO Sam Altman on AI Scaling, AGI Future & Global Infrastructure Race',
    url: 'https://www.youtube.com/watch?v=o6BSHe4Nulw',
    kolName: 'Sam Altman',
    views: 80000
  },
  {
    title: '"LLMs Are A Dead End": An Exclusive Interview With The Genius Father of AI | Yann LeCun',
    url: 'https://www.youtube.com/watch?v=XnnnAx5lrx8',
    kolName: 'Yann LeCun',
    views: 100000
  }
];

console.log('原始视频：', testVideos.length);
testVideos.forEach((v, i) => {
  console.log(`${i + 1}. [${v.kolName}] ${v.title} (${v.views} views)`);
});

console.log('\n计算相似度：');
console.log('视频1 vs 视频2:', collector.calculateTitleSimilarity(testVideos[0].title, testVideos[1].title));
console.log('视频1 vs 视频3:', collector.calculateTitleSimilarity(testVideos[0].title, testVideos[2].title));
console.log('视频2 vs 视频3:', collector.calculateTitleSimilarity(testVideos[1].title, testVideos[2].title));

console.log('\n去重后：');
const deduped = collector.deduplicateByTitleSimilarity(testVideos);
console.log('去重后视频：', deduped.length);
deduped.forEach((v, i) => {
  console.log(`${i + 1}. [${v.kolName}] ${v.title} (${v.views} views)`);
});
