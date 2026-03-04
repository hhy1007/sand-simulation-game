#!/bin/bash

# 🚀 落沙模拟游戏 - GitHub 部署脚本
# 使用: bash deploy.sh

set -e  # 遇到错误时退出

echo "🎮 落沙模拟游戏 - GitHub 部署脚本"
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印带颜色的消息
print_color() {
    echo -e "${2}${1}${NC}"
}

# 检查必要的工具
check_tools() {
    print_color "🔧 检查必要的工具..." "$BLUE"
    
    if ! command -v git &> /dev/null; then
        print_color "❌ Git 未安装，请先安装 Git" "$RED"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_color "⚠️  Node.js 未安装，某些功能可能无法使用" "$YELLOW"
    fi
    
    if ! command -v npm &> /dev/null; then
        print_color "⚠️  npm 未安装，某些功能可能无法使用" "$YELLOW"
    fi
    
    print_color "✅ 工具检查完成" "$GREEN"
}

# 检查 Git 仓库状态
check_git_status() {
    print_color "📊 检查 Git 状态..." "$BLUE"
    
    if [ ! -d ".git" ]; then
        print_color "ℹ️  初始化 Git 仓库..." "$YELLOW"
        git init
        
        # 设置 Git 用户信息（如果未设置）
        if [ -z "$(git config user.email)" ]; then
            print_color "ℹ️  设置 Git 用户信息..." "$YELLOW"
            read -p "请输入你的邮箱地址: " user_email
            read -p "请输入你的姓名: " user_name
            git config user.email "$user_email"
            git config user.name "$user_name"
        fi
    fi
    
    print_color "✅ Git 状态检查完成" "$GREEN"
}

# 提交代码
commit_changes() {
    print_color "💾 提交代码更改..." "$BLUE"
    
    # 检查是否有未提交的更改
    if [ -z "$(git status --porcelain)" ]; then
        print_color "📭 没有需要提交的更改" "$YELLOW"
        return 0
    fi
    
    # 添加所有文件
    git add .
    
    # 提交
    commit_message="更新落沙模拟游戏 $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$commit_message"
    
    print_color "✅ 代码提交完成: $commit_message" "$GREEN"
}

# 部署到 GitHub
deploy_to_github() {
    print_color "🐙 部署到 GitHub..." "$BLUE"
    
    # 检查是否有远程仓库
    if ! git remote | grep -q origin; then
        print_color "🌐 请先创建 GitHub 仓库并设置远程地址:" "$YELLOW"
        echo ""
        print_color "1. 访问 https://github.com" "$BLUE"
        print_color "2. 点击右上角 '+' → 'New repository'" "$BLUE"
        print_color "3. 仓库名: sand-simulation-game" "$BLUE"
        print_color "4. 描述: A physics-based sand simulation game" "$BLUE"
        print_color "5. 创建后复制仓库 URL" "$BLUE"
        echo ""
        read -p "请输入你的 GitHub 用户名: " github_username
        
        if [ -z "$github_username" ]; then
            print_color "❌ 需要 GitHub 用户名" "$RED"
            exit 1
        fi
        
        git remote add origin "https://github.com/$github_username/sand-simulation-game.git"
        print_color "✅ 已添加远程仓库: $github_username" "$GREEN"
    fi
    
    # 重命名主分支为 main
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        print_color "🌿 重命名分支为 main..." "$YELLOW"
        git branch -M main
    fi
    
    # 推送到 GitHub
    print_color "📤 推送到 GitHub..." "$BLUE"
    git push -u origin main
    
    print_color "✅ 代码已推送到 GitHub!" "$GREEN"
}

# 安装依赖
install_dependencies() {
    print_color "📦 安装依赖..." "$BLUE"
    
    if [ -f "package.json" ] && command -v npm &> /dev/null; then
        if [ ! -d "node_modules" ]; then
            npm install
            print_color "✅ 依赖安装完成" "$GREEN"
        else
            print_color "📦 依赖已安装" "$YELLOW"
        fi
    else
        print_color "⚠️  跳过依赖安装" "$YELLOW"
    fi
}

# 构建项目
build_project() {
    print_color "🔨 构建项目..." "$BLUE"
    
    if [ -f "package.json" ] && command -v npm &> /dev/null; then
        if grep -q '"build"' package.json; then
            npm run build
            print_color "✅ 项目构建完成" "$GREEN"
        else
            print_color "⚠️  没有构建脚本，跳过构建" "$YELLOW"
        fi
    else
        print_color "⚠️  跳过构建" "$YELLOW"
    fi
}

# 显示项目信息
show_project_info() {
    echo ""
    print_color "🎉 项目部署完成！" "$GREEN"
    echo ""
    print_color "📁 项目信息:" "$BLUE"
    echo "├── 项目名称: 落沙模拟游戏"
    echo "├── 技术栈: HTML5 Canvas, JavaScript, Vite"
    echo "├── 材质数量: 16种"
    echo "├── 反应类型: 9种"
    echo "└── 性能目标: 10,000+ 粒子, 60 FPS"
    echo ""
    print_color "🚀 下一步:" "$BLUE"
    echo "1. 访问 GitHub 仓库设置 Pages"
    echo "2. 运行游戏: npm run dev"
    echo "3. 访问 http://localhost:5173"
    echo ""
    print_color "📚 文档:" "$BLUE"
    echo "├── README.md - 项目说明"
    echo "├── DEPLOY_TO_GITHUB.md - 详细部署指南"
    echo "└── CONTRIBUTING.md - 贡献指南"
    echo ""
}

# 主函数
main() {
    echo ""
    print_color "🎮 开始部署落沙模拟游戏" "$BLUE"
    echo ""
    
    # 执行部署步骤
    check_tools
    echo ""
    
    check_git_status
    echo ""
    
    install_dependencies
    echo ""
    
    build_project
    echo ""
    
    commit_changes
    echo ""
    
    deploy_to_github
    echo ""
    
    show_project_info
}

# 运行主函数
main