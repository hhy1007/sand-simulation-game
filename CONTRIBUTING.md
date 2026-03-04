# 🤝 贡献指南

欢迎为落沙模拟游戏项目做出贡献！本指南将帮助你开始贡献代码。

## 🎯 贡献方式

### 1. 报告 Bug
- 使用 [GitHub Issues](https://github.com/YOUR-USERNAME/sand-simulation-game/issues)
- 描述清晰的问题重现步骤
- 包括浏览器/操作系统信息
- 提供截图或屏幕录像（如果可能）

### 2. 请求新功能
- 在 Issues 中描述你想要的功能
- 解释为什么这个功能有用
- 提供实现建议（可选）

### 3. 提交代码
- 遵循下面的开发流程
- 确保代码符合项目标准
- 添加必要的测试和文档

## 🚀 开发流程

### 1. Fork 项目
1. 点击 GitHub 页面右上角的 "Fork" 按钮
2. 克隆你的 fork 到本地：
   ```bash
   git clone https://github.com/YOUR-USERNAME/sand-simulation-game.git
   cd sand-simulation-game
   ```

### 2. 设置开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试（如果有）
npm test
```

### 3. 创建功能分支
```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/issue-description
```

分支命名规范：
- `feature/` - 新功能
- `fix/` - Bug修复
- `docs/` - 文档更新
- `style/` - 样式/格式化
- `refactor/` - 代码重构
- `perf/` - 性能优化

### 4. 进行更改
- 编写代码
- 添加测试（如果适用）
- 更新文档
- 确保代码质量

### 5. 提交更改
```bash
# 添加更改
git add .

# 提交（遵循约定式提交）
git commit -m "feat: 添加新材质系统"
git commit -m "fix: 修复碰撞检测问题"
git commit -m "docs: 更新API文档"
```

### 6. 推送到 GitHub
```bash
git push origin feature/your-feature-name
```

### 7. 创建 Pull Request
1. 访问你的 GitHub fork
2. 点击 "Compare & pull request"
3. 填写 PR 描述
4. 等待代码审查

## 📝 代码规范

### JavaScript 规范
- 使用 ES6+ 语法
- 使用 `const` 和 `let`，避免 `var`
- 使用箭头函数
- 使用模板字符串
- 遵循模块化设计

### 文件结构
```
src/
├── physics/          # 物理引擎相关
├── rendering/        # 渲染相关
├── materials/        # 材质相关
├── game/            # 游戏逻辑
└── utils/           # 工具函数
```

### 命名约定
- 类名：`PascalCase` (`PhysicsEngine`)
- 变量/函数名：`camelCase` (`particleCount`)
- 常量：`UPPER_SNAKE_CASE` (`MAX_PARTICLES`)
- 文件：`kebab-case` (`physics-engine.js`)

### 注释规范
```javascript
/**
 * 粒子类
 * @class
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {Material} material - 材质对象
 */
class Particle {
  /**
   * 更新粒子状态
   * @param {number} deltaTime - 时间增量
   * @returns {boolean} 是否存活
   */
  update(deltaTime) {
    // 单行注释
  }
}
```

## 🧪 测试

### 添加测试
1. 在相应模块创建测试文件
2. 测试核心功能
3. 测试边界条件
4. 测试错误处理

### 运行测试
```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --grep "PhysicsEngine"
```

## 📚 文档

### 更新文档
- 更新 README.md 中的功能说明
- 更新 API 文档
- 添加代码注释
- 更新变更日志

### 文档格式
- 使用 Markdown 格式
- 包含示例代码
- 添加图片/图表（如果适用）
- 保持文档与代码同步

## 🔍 代码审查

### 审查标准
- 代码是否符合规范
- 是否有适当的测试
- 是否更新了文档
- 是否有性能问题
- 是否考虑了边缘情况

### 审查流程
1. 至少需要一位核心成员的批准
2. 所有测试必须通过
3. 没有重大冲突
4. 符合项目目标

## 🐛 故障排除

### 常见问题

**依赖安装失败**
```bash
# 清除缓存
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**构建失败**
```bash
# 检查错误信息
npm run build -- --debug

# 尝试重新构建
npm run clean && npm run build
```

**测试失败**
```bash
# 运行特定测试查看详细输出
npm test -- --verbose
```

## 🌟 贡献者奖励

所有贡献者将被列在 [CONTRIBUTORS.md](CONTRIBUTORS.md) 文件中。

### 贡献者等级
- 🥉 **初级贡献者**：修复小Bug，文档更新
- 🥈 **中级贡献者**：添加新功能，重要修复
- 🥇 **核心贡献者**：重大功能，架构改进

## 📞 寻求帮助

- 💬 [GitHub Discussions](https://github.com/YOUR-USERNAME/sand-simulation-game/discussions)
- 🐛 [GitHub Issues](https://github.com/YOUR-USERNAME/sand-simulation-game/issues)
- 📧 发送邮件到项目维护者

## 🎯 项目重点

### 高优先级
- 性能优化
- Bug修复
- 安全修复
- 兼容性问题

### 中优先级
- 新功能
- 用户体验改进
- 文档完善

### 低优先级
- 代码重构
- 样式改进
- 测试覆盖率

## 📋 行为准则

请遵守我们的 [行为准则](CODE_OF_CONDUCT.md)，确保社区友好和包容。

---

感谢你的贡献！你的每一行代码都让这个项目变得更好。🎉

## 📄 许可证

贡献即表示你同意按照 MIT 许可证授权你的贡献。