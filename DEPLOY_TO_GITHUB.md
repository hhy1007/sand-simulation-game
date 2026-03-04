# 🚀 部署到 GitHub 指南

## 📋 准备工作

### 1. 确保你已经安装了以下工具：
```bash
git --version          # Git 版本控制
node --version        # Node.js (可选，用于运行开发服务器)
```

### 2. 配置 Git 用户信息（如果尚未配置）：
```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

## 📁 项目结构预览

```
sand-simulation-game/
├── README.md                    # 项目说明文档
├── package.json                 # Node.js 项目配置
├── vite.config.js              # Vite 构建配置
├── agents_config.json          # Claude Code Agent Teams 配置
├── public/                     # 前端静态文件
│   ├── index.html             # 主页面
│   ├── style.css              # 样式文件
│   └── main.js                # 主应用程序
└── src/                       # 源代码
    ├── physics/               # 物理引擎
    ├── rendering/             # 渲染引擎
    ├── materials/             # 材质系统
    ├── game/                  # 游戏逻辑
    └── utils/                 # 工具函数
```

## 🐙 创建 GitHub 仓库

### 方法1：使用 GitHub 网页界面
1. 访问 https://github.com
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   - **Repository name**: `sand-simulation-game`
   - **Description**: `A physics-based sand simulation game built with Claude Code Agent Teams collaboration`
   - **Public** (选择公开)
   - **不要**勾选 "Add a README file" (项目已有)
   - **不要**勾选 "Add .gitignore" (项目已有)
4. 点击 "Create repository"

### 方法2：使用 GitHub CLI (如果有)
```bash
gh repo create sand-simulation-game \
  --description "A physics-based sand simulation game built with Claude Code Agent Teams collaboration" \
  --public \
  --source=. \
  --remote=origin \
  --push
```

## 🔗 连接到 GitHub 仓库

在项目目录中运行以下命令：

```bash
# 1. 添加远程仓库
git remote add origin https://github.com/YOUR-USERNAME/sand-simulation-game.git

# 2. 重命名主分支为 main（可选，GitHub 默认）
git branch -M main

# 3. 推送代码到 GitHub
git push -u origin main

# 如果遇到错误，可能需要强制推送
git push -u origin main --force
```

**将 `YOUR-USERNAME` 替换为你的 GitHub 用户名。**

## 🌐 设置 GitHub Pages (可选，用于在线演示)

### 步骤1：启用 GitHub Pages
1. 访问你的仓库页面：`https://github.com/YOUR-USERNAME/sand-simulation-game`
2. 点击 "Settings" → "Pages"
3. 在 "Build and deployment" 部分：
   - **Source**: 选择 "Deploy from a branch"
   - **Branch**: 选择 `main` 和 `/` (根目录)
4. 点击 "Save"

### 步骤2：添加 GitHub Pages 工作流
创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build project
      run: npm run build
    
    - name: Deploy to GitHub Pages
      uses: JamesIves/github-pages-deploy-action@v4
      with:
        folder: dist
```

## 📦 安装依赖和运行

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建生产版本
```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 🎮 游戏功能说明

### 核心特性
- 🧠 **物理引擎**：粒子物理、碰撞检测、温度系统
- 🎨 **渲染系统**：Canvas 2D 渲染、特效系统
- 🧪 **材质系统**：16种材质、9种化学反应
- 🛠️ **工具系统**：画笔、橡皮擦、爆炸、引力场
- 💾 **保存/加载**：游戏状态持久化

### 操作指南
- **鼠标左键**：放置材质
- **鼠标右键**：擦除粒子
- **鼠标滚轮**：调整画笔大小
- **空格键**：暂停/继续
- **1-8键**：切换材质
- **B/E/X/G键**：切换工具

## 🚀 快速部署脚本

你也可以使用以下脚本快速部署：

```bash
#!/bin/bash
# deploy.sh

echo "🚀 开始部署落沙模拟游戏到 GitHub..."

# 检查 git 状态
if [ ! -d ".git" ]; then
    echo "初始化 Git 仓库..."
    git init
    git config user.email "claude-code-team@example.com"
    git config user.name "Claude Code Agent Teams"
fi

# 添加所有文件
echo "添加文件到 Git..."
git add .

# 提交更改
echo "提交更改..."
git commit -m "Deploy sand simulation game with Claude Code Agent Teams collaboration"

# 设置远程仓库（需要手动替换 YOUR-USERNAME）
echo "请先创建 GitHub 仓库，然后运行以下命令："
echo "git remote add origin https://github.com/YOUR-USERNAME/sand-simulation-game.git"
echo "git branch -M main"
echo "git push -u origin main"

echo "✅ 项目已准备好部署到 GitHub！"
```

## 📄 项目文件说明

### 核心文件
1. `README.md` - 项目详细说明和功能列表
2. `agents_config.json` - Claude Code Agent Teams 配置
3. `public/index.html` - 游戏主界面
4. `src/game/Game.js` - 游戏主逻辑
5. `src/physics/PhysicsEngine.js` - 物理引擎
6. `src/rendering/CanvasRenderer.js` - 渲染引擎
7. `src/materials/materials.js` - 材质系统

### 配置文件
1. `package.json` - Node.js 项目配置
2. `vite.config.js` - 构建工具配置
3. `.gitignore` - Git 忽略文件

## 🔧 故障排除

### 常见问题

**1. Git push 被拒绝**
```bash
# 如果远程仓库已有内容，需要先拉取
git pull origin main --allow-unrelated-histories
git push -u origin main
```

**2. GitHub Pages 不显示**
- 检查仓库设置中的 Pages 配置
- 确保 `index.html` 在根目录
- 等待几分钟让 Pages 构建完成

**3. 本地运行问题**
```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm install
```

## 📞 支持和贡献

### 报告问题
在 GitHub Issues 中报告问题：
- 功能请求
- Bug 报告
- 性能问题

### 贡献代码
1. Fork 仓库
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 🎉 完成！

你的落沙模拟游戏现在已经部署到 GitHub！可以通过以下方式访问：

- **GitHub 仓库**: `https://github.com/YOUR-USERNAME/sand-simulation-game`
- **GitHub Pages**: `https://YOUR-USERNAME.github.io/sand-simulation-game` (如果启用)

享受你的物理模拟游戏吧！ 🎮