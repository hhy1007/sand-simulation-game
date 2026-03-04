# 🎮 落沙模拟游戏 - Sand Simulation Game

![Physics Simulation](https://img.shields.io/badge/Physics-Simulation-blue)
![Canvas Rendering](https://img.shields.io/badge/Rendering-Canvas-green)
![Material System](https://img.shields.io/badge/Materials-16-yellow)
![Claude Code Teams](https://img.shields.io/badge/Built%20by-Claude%20Code%20Agent%20Teams-purple)
![License MIT](https://img.shields.io/badge/License-MIT-lightgrey)

一个基于物理引擎和HTML/CSS的、带材质系统的落沙模拟游戏，使用 **Claude Code Agent Teams 协作模式** 开发。

## 🎥 在线演示

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://YOUR-USERNAME.github.io/sand-simulation-game)

**本地启动**: 运行 `npm run dev` 后访问 `http://localhost:5173`

## 🏗️ 项目架构 - Claude Code Agent Teams

本项目采用 **模块化协作开发** 模式，由4个专家团队共同构建：

| 专家团队 | 职责 | 主要贡献 |
|---------|------|----------|
| 🧠 **物理引擎专家** | 粒子物理、碰撞检测、重力模拟 | `src/physics/PhysicsEngine.js` |
| 🎨 **前端开发专家** | Canvas渲染、特效系统、UI设计 | `src/rendering/CanvasRenderer.js` |
| 🎮 **游戏设计师** | 材质系统、化学反应、游戏平衡 | `src/materials/materials.js` |
| 🏗️ **系统架构师** | 模块集成、游戏逻辑、用户交互 | `src/game/Game.js` |

## ✨ 核心特性

### 🧪 **材质系统 (16种材质)**
- **基础材质**: 沙子、水、石头、火、油、金属、植物、木头
- **特殊材质**: 蒸汽、烟雾、熔岩、冰、酸、盐、火药、电
- **化学反应**: 9种反应类型（燃烧、溶解、爆炸等）

### ⚛️ **物理引擎**
- 🎯 粒子物理系统（位置、速度、加速度）
- 🎯 空间分割碰撞检测优化
- 🎯 温度系统和热传导
- 🎯 燃烧传播机制
- 🎯 重力/风力模拟

### 🎨 **渲染效果**
- ✨ Canvas 2D 高性能渲染
- ✨ Bloom 光晕特效
- ✨ 粒子阴影和发光效果
- ✨ 火焰和热浪可视化
- ✨ 离屏渲染优化

### 🛠️ **交互工具**
- 🖌️ 画笔工具（绘制粒子）
- 🧽 橡皮擦（擦除粒子）
- 💥 爆炸工具（创建爆炸力场）
- 🧲 引力工具（创建引力场）
- 🔵 形状工具（圆形、矩形）

### 💾 **高级功能**
- 💾 游戏状态保存/加载
- ⚙️ 实时参数调节
- ⌨️ 键盘快捷键支持
- 📊 性能监控系统
- 🔌 事件驱动架构

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
# 访问 http://localhost:5173
```

### 构建生产版本
```bash
npm run build
npm run preview
```

## 🎮 操作指南

### 鼠标操作
- **🖱️ 左键点击/拖动**: 放置当前材质
- **🖱️ 右键点击/拖动**: 擦除粒子
- **🖱️ 鼠标滚轮**: 调整画笔大小

### 键盘快捷键

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| **空格键** | 暂停/继续游戏 | 切换模拟状态 |
| **C键** | 清空所有粒子 | 重置画布 |
| **R键** | 重置游戏 | 完全重新开始 |
| **1-8键** | 切换材质 | 1=沙, 2=水, 3=石, 4=火, 5=油, 6=金属, 7=植物, 8=木头 |
| **B键** | 画笔工具 | 绘制粒子 |
| **E键** | 橡皮擦工具 | 擦除粒子 |
| **X键** | 爆炸工具 | 创建爆炸力场 |
| **G键** | 引力工具 | 创建引力场 |
| **[ 键** | 减小画笔大小 | 画笔更小 |
| **] 键** | 增大画笔大小 | 画笔更大 |

## 📁 项目结构

```
sand-simulation-game/
├── public/                 # 前端静态文件
│   ├── index.html         # 游戏主页面
│   ├── style.css          # 样式文件
│   └── main.js            # 主应用程序
├── src/                   # 源代码
│   ├── physics/           # 物理引擎模块
│   │   └── PhysicsEngine.js
│   ├── rendering/         # 渲染引擎模块
│   │   └── CanvasRenderer.js
│   ├── materials/         # 材质系统模块
│   │   └── materials.js
│   ├── game/              # 游戏逻辑模块
│   │   └── Game.js
│   └── utils/             # 工具函数模块
│       └── helpers.js
├── agents_config.json     # Agent Teams 配置
├── package.json           # 项目配置
├── vite.config.js         # 构建配置
├── README.md              # 项目文档
└── DEPLOY_TO_GITHUB.md    # GitHub部署指南
```

## 🧪 材质化学反应

### 🔥 反应类型
1. **COMBUSTION** (燃烧) - 火点燃可燃物
2. **EXTINGUISH** (熄灭) - 水灭火
3. **TRANSFORM** (转化) - 材质相互转化
4. **DISSOLVE** (溶解) - 酸溶解金属/石头
5. **EXPLOSION** (爆炸) - 火引爆火药
6. **ELECTRICITY** (导电) - 金属导电
7. **FREEZE** (冻结) - 冰形成
8. **MELT** (融化) - 火融化冰
9. **NEUTRALIZE** (中和) - 酸被稀释

### 🧪 示例反应
- 🔥 **火 + 木头** → 燃烧
- 💧 **水 + 火** → 熄灭
- 🌋 **熔岩 + 水** → 爆炸 + 石头
- ⚗️ **酸 + 金属** → 溶解
- 💥 **火 + 火药** → 大爆炸

## ⚡ 性能优化

### 🚀 关键技术
- ✅ **空间分割** - 3x3网格碰撞检测优化
- ✅ **离屏渲染** - 减少Canvas闪烁
- ✅ **批量绘制** - 优化粒子渲染性能
- ✅ **帧率控制** - 自适应更新频率
- ✅ **内存管理** - 粒子生命周期控制

### 📊 性能指标
- 支持 **10,000+** 粒子实时模拟
- 目标 **60 FPS** 流畅运行
- 实时物理计算和渲染
- 内存使用优化

## 🔧 开发指南

### ➕ 添加新材质
1. 在 `src/materials/materials.js` 中添加材质定义
2. 配置物理属性（密度、摩擦力等）
3. 定义化学反应规则
4. 在UI中添加材质选择

### 🛠️ 添加新工具
1. 在 `src/game/Game.js` 中注册新工具
2. 实现工具交互逻辑
3. 添加工具预览效果
4. 配置键盘快捷键

### 🔮 扩展功能
- 🔍 更多材质类型（玻璃、泥土、布等）
- ⚡ 电路系统（导线、开关、电池）
- 🌱 生物系统（植物生长、动物行为）
- 🌦️ 天气系统（雨、雪、风）
- 🎮 关卡编辑器和挑战模式

## 🐙 部署到 GitHub

### 📦 创建仓库
```bash
# 1. 初始化Git仓库
git init
git add .
git commit -m "初始提交: 落沙模拟游戏"

# 2. 连接到GitHub（替换 YOUR-USERNAME）
git remote add origin https://github.com/YOUR-USERNAME/sand-simulation-game.git
git branch -M main
git push -u origin main
```

### 🌐 启用 GitHub Pages
1. 访问仓库 Settings → Pages
2. 选择 Source: Deploy from a branch
3. 选择 Branch: main, Folder: /
4. 点击 Save

详细指南请查看 [DEPLOY_TO_GITHUB.md](DEPLOY_TO_GITHUB.md)

## 📊 Agent Teams 协作详情

### 🤖 协作模式
本项目模拟了 **Claude Code Agent Teams** 的协作开发流程：

1. **📋 需求分析** - 理解项目目标和约束
2. **🏗️ 模块划分** - 4个专家领域分工
3. **⚡ 并行开发** - 各专家独立实现模块
4. **🔗 集成测试** - 系统架构师整合所有模块
5. **🚀 性能优化** - 团队协作调优
6. **📚 文档完善** - 完整的使用和开发文档

### 🏆 专家贡献
- **🧠 物理引擎专家**: 实现了完整的物理模拟基础
- **🎨 前端开发专家**: 创建了高性能可视化系统
- **🎮 游戏设计师**: 设计了平衡有趣的游戏机制
- **🏗️ 系统架构师**: 确保所有模块无缝协作

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何开始。

1. 🍴 Fork 项目
2. 🌿 创建功能分支
3. 💾 提交更改
4. 🔀 创建 Pull Request

## 📞 支持

- 🐛 报告问题: [GitHub Issues](https://github.com/YOUR-USERNAME/sand-simulation-game/issues)
- 💡 功能请求: 在 Issues 中提出
- 💬 讨论: [GitHub Discussions](https://github.com/YOUR-USERNAME/sand-simulation-game/discussions)

## 🎉 鸣谢

本项目由 **Claude Code Agent Teams** 协作开发，展示了多专家协作在复杂项目开发中的优势。

---

**🎮 祝你玩得开心！**

[![Star on GitHub](https://img.shields.io/github/stars/YOUR-USERNAME/sand-simulation-game?style=social)](https://github.com/YOUR-USERNAME/sand-simulation-game)
[![Fork on GitHub](https://img.shields.io/github/forks/YOUR-USERNAME/sand-simulation-game?style=social)](https://github.com/YOUR-USERNAME/sand-simulation-game/fork)
[![Watch on GitHub](https://img.shields.io/github/watchers/YOUR-USERNAME/sand-simulation-game?style=social)](https://github.com/YOUR-USERNAME/sand-simulation-game)

> 🚀 **提示**: 记得将 `YOUR-USERNAME` 替换为你的实际 GitHub 用户名！