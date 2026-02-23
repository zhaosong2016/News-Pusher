#!/bin/bash

# 新闻推送服务部署脚本
# 使用方法: ./deploy.sh

SERVER_IP="49.233.127.228"
SERVER_USER="root"
REMOTE_DIR="/root/news-pusher"

echo "📦 开始部署新闻推送服务到服务器..."

# 1. 检查本地 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo "❌ 错误: 未找到 .env 文件"
    echo "请先创建 .env 文件并配置好密钥"
    echo "运行: cp .env.example .env"
    exit 1
fi

# 2. 打包项目文件
echo "📁 打包项目文件..."
tar -czf news-pusher.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='deploy.sh' \
    .

# 3. 上传到服务器
echo "⬆️  上传到服务器..."
scp news-pusher.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

# 4. 在服务器上部署
echo "🚀 在服务器上部署..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    # 创建目录
    mkdir -p /root/news-pusher
    cd /root/news-pusher

    # 解压文件
    tar -xzf /tmp/news-pusher.tar.gz
    rm /tmp/news-pusher.tar.gz

    # 检查 Node.js 是否安装
    if ! command -v node &> /dev/null; then
        echo "📦 安装 Node.js..."
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    fi

    # 安装依赖
    echo "📦 安装依赖..."
    npm install

    # 检查 PM2 是否安装
    if ! command -v pm2 &> /dev/null; then
        echo "📦 安装 PM2..."
        npm install -g pm2
    fi

    # 停止旧服务（如果存在）
    pm2 delete news-pusher 2>/dev/null || true

    # 启动服务
    echo "🚀 启动服务..."
    pm2 start src/index.js --name news-pusher
    pm2 save

    # 设置开机自启
    pm2 startup systemd -u root --hp /root

    echo "✅ 部署完成！"
    echo ""
    echo "查看日志: pm2 logs news-pusher"
    echo "查看状态: pm2 status"
    echo "重启服务: pm2 restart news-pusher"
ENDSSH

# 5. 清理本地临时文件
rm news-pusher.tar.gz

echo ""
echo "✅ 部署成功！"
echo ""
echo "服务已在服务器上运行，每天早上 8:00 会自动推送新闻。"
echo ""
echo "常用命令:"
echo "  查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs news-pusher'"
echo "  查看状态: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 status'"
echo "  重启服务: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 restart news-pusher'"
