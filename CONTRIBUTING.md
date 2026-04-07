# 🤝 贡献指南

感谢你对 ClawXAI 项目的兴趣！欢迎参与贡献！

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发设置](#开发设置)
- [提交规范](#提交规范)
- [代码风格](#代码风格)

---

## 行为准则

本项目采用 [贡献者公约](https://www.contributor-covenant.org/) 行为准则。请保持友好和尊重。

---

## 如何贡献

### 1. 报告 Bug

- 使用 GitHub Issues
- 提供详细的复现步骤
- 附上错误日志和截图

### 2. 提出新功能

- 先查看是否已有类似提议
- 详细描述使用场景
- 说明为什么需要这个功能

### 3. 提交代码

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 开发设置

### 前置要求

- Node.js >= 22.0.0
- pnpm >= 9.0.0
- Git

### 安装

```bash
# 克隆仓库
git clone git@github.com:skytitan008/ClawXAI.git
cd ClawXAI

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 运行测试
node apps/gateway/gateway.mjs --test
```

### 开发模式

```bash
# 监听模式构建
pnpm -r --filter '@ClawXAI/*' run dev

# 运行网关
node apps/gateway/gateway.mjs
```

---

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具配置

### 示例

```bash
feat(router): add S3 privacy detection for SSH keys
fix(memory): resolve L2 retrieval confidence calculation
docs(readme): update installation instructions
refactor(core): simplify message handling logic
```

### 表情符号（可选）

- 🎉 `:tada:` - 初始提交
- ✨ `:sparkles:` - 新功能
- 🐛 `:bug:` - Bug 修复
- 📝 `:memo:` - 文档
- 🚀 `:rocket:` - 性能优化
- 🧪 `:test_tube:` - 测试
- ♻️ `:recycle:` - 重构

---

## 代码风格

### TypeScript

- 使用严格模式
- 明确的类型注解
- 避免使用 `any`

### 命名规范

```typescript
// 类：PascalCase
export class PrivacyRouter {}

// 函数/变量：camelCase
export function createRouter() {}

// 常量：UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// 类型：PascalCase
interface RouterConfig {}
```

### 代码检查

```bash
# 运行 linter
pnpm lint

# 格式化代码
pnpm format

# 类型检查
pnpm typecheck
```

---

## 测试

```bash
# 运行所有测试
pnpm test

# 运行特定包的测试
pnpm --filter @ClawXAI/router test

# 覆盖率报告
pnpm test -- --coverage
```

---

## 发布流程

1. 更新版本号 (`package.json`)
2. 更新 CHANGELOG.md
3. 创建 Git 标签 (`git tag v0.1.0`)
4. 推送标签 (`git push origin v0.1.0`)
5. GitHub Actions 自动创建 Release

---

## 问题？

- 💬 在 GitHub Issues 提问
- 📧 发送邮件至：188005495@qq.com
- 📖 查看文档：[README.md](./README.md)

---

**感谢你的贡献！** 🎉

每一个 PR 都会让 ClawXAI 变得更好！
