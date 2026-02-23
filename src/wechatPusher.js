import axios from 'axios';

/**
 * 微信推送器 - 支持 Server酱 和企业微信两种方式
 */
export class WechatPusher {
  constructor(config) {
    this.serverChanKey = config.serverChanKey;
    this.wechatWebhook = config.wechatWebhook;
  }

  /**
   * 推送消息到微信
   */
  async push(title, content) {
    if (this.serverChanKey) {
      return await this.pushViaServerChan(title, content);
    } else if (this.wechatWebhook) {
      return await this.pushViaWechatBot(title, content);
    } else {
      throw new Error('未配置微信推送方式，请设置 SERVER_CHAN_KEY 或 WECHAT_WEBHOOK');
    }
  }

  /**
   * 方案1: 通过 Server酱 推送 (推荐)
   * 注册地址: https://sct.ftqq.com/
   */
  async pushViaServerChan(title, content) {
    try {
      const url = `https://sctapi.ftqq.com/${this.serverChanKey}.send`;
      const response = await axios.post(url, {
        title,
        desp: content
      });

      if (response.data.code === 0) {
        console.log('✅ Server酱推送成功');
        return true;
      } else {
        console.error('❌ Server酱推送失败:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Server酱推送异常:', error.message);
      return false;
    }
  }

  /**
   * 方案2: 通过企业微信机器人推送
   * 配置方法: 企业微信群 -> 添加机器人 -> 获取 Webhook 地址
   */
  async pushViaWechatBot(title, content) {
    try {
      const response = await axios.post(this.wechatWebhook, {
        msgtype: 'markdown',
        markdown: {
          content: `# ${title}\n\n${content}`
        }
      });

      if (response.data.errcode === 0) {
        console.log('✅ 企业微信推送成功');
        return true;
      } else {
        console.error('❌ 企业微信推送失败:', response.data.errmsg);
        return false;
      }
    } catch (error) {
      console.error('❌ 企业微信推送异常:', error.message);
      return false;
    }
  }

  /**
   * 测试推送功能
   */
  async testPush() {
    const testTitle = '📰 新闻推送测试';
    const testContent = `这是一条测试消息\n\n发送时间: ${new Date().toLocaleString('zh-CN')}`;
    return await this.push(testTitle, testContent);
  }
}
