import { NewsCollector } from './src/newsCollector.js';

const collector = new NewsCollector();

console.log('=== 测试 TechCrunch ===');
const tc = await collector.fetchTechCrunch();
console.log(tc.length > 0 ? '✅ TechCrunch: ' + tc.length + ' 条新闻' : '❌ TechCrunch: 0 条新闻');
if (tc.length > 0) console.log(tc[0]);

console.log('\n=== 测试 Wired ===');
const wired = await collector.fetchWired();
console.log(wired.length > 0 ? '✅ Wired: ' + wired.length + ' 条新闻' : '❌ Wired: 0 条新闻');
if (wired.length > 0) console.log(wired[0]);

console.log('\n=== 对比测试：The Verge（已验证可用）===');
const verge = await collector.fetchTheVerge();
console.log(verge.length > 0 ? '✅ The Verge: ' + verge.length + ' 条新闻' : '❌ The Verge: 0 条新闻');
if (verge.length > 0) console.log(verge[0]);
