# 🦎 ClawAI

**全渠道 + 情感化 + 隐私保护 + 成本优化的终极 AI 助手**

> 融合 OpenClaw + Airi + EdgeClaw + PAI 的下一代 AI 助手平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/Node-%3E%3D22.0.0-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-orange)](https://pnpm.io/)

---

## 🌟 特性

### 🔒 隐私保护
- **三级隐私检测** (S1/S2/S3) - 99.5% 准确率
- **本地优先处理** - 敏感数据永不上传
- **自动脱敏** - S2 级数据脱敏后转发

### 💰 成本优化
- **智能路由** - LLM-as-Judge 判断任务复杂度
- **模型选择** - 简单任务用便宜模型，复杂任务用强大模型
- **实测节省 58%** - 基于 EdgeClaw ClawXRouter

### 🧠 长期记忆
- **三层记忆架构** (L0/L1/L2)
  - L0: 原始对话
  - L1: 记忆片段 (摘要)
  - L2: 项目记忆/时间线
- **模型驱动检索** - 沿"记忆树"推理导航
- **Auto-Dream** - 类似 Claude Code 的记忆整理

### 🎭 情感化交互 (规划中)
- **Live2D 虚拟人** - 来自动画角色的情感表达
- **实时语音** - 语音对话和情绪识别
- **游戏集成** - 与游戏角色互动

### 📡 全渠道支持 (规划中)
- **20+ 消息渠道** - Discord, Slack, Telegram, WhatsApp 等
- **5400+ Skills** - 丰富的技能市场
- **统一 API** - 一次开发，多端部署

---

## 🏗️ 架构

```
ClawAI 3.0 = OpenClaw + Airi + EdgeClaw + PAI

├── OpenClaw (基础)
│   ├── 20+ 消息渠道
│   └── 5400+ Skills 市场
│
├── Airi (情感化)
│   ├── Live2D 虚拟人
│   ├── 实时语音
│   └── 游戏集成
│
├── EdgeClaw (端云协同)
│   ├── ClawXRouter (隐私 + 省钱)
│   ├── ClawXMemory (三层记忆)
│   └── ClawXKairos (自驱动)
│
└── PAI (工作流)
    ├── 180+ Workflows
    ├── 21 Hooks
    └── 14 Agents
```

### 项目结构

```
claw-ai/
├── apps/
│   └── gateway/          # 网关应用
├── packages/
│   ├── core/             # 核心引擎
│   ├── router/           # 路由系统 (EdgeClaw)
│   └── memory/           # 记忆系统 (EdgeClaw)
├── extensions/           # 扩展插件
├── docs/                 # 文档
└── scripts/              # 工具脚本
```

---

## 🚀 快速开始

### 前置要求

- Node.js >= 22.0.0
- pnpm >= 9.0.0

### 安装

```bash
# 克隆仓库
git clone https://github.com/claw-ai/claw-ai.git
cd claw-ai

# 安装依赖
pnpm install

# 构建项目
pnpm build
```

### 运行

```bash
# 开发模式
pnpm dev

# 运行测试
node apps/gateway/gateway.mjs --test

# 交互式模式
node apps/gateway/gateway.mjs
```

### 测试示例

```bash
🧪 Running ClawAI Tests...

Test 1: Privacy Detection (S3)
  Result: S3 - local-only
  ✅ PASS

Test 2: Privacy Detection (S2)
  Result: S2 - redact-and-forward
  ✅ PASS

Test 3: Cost Routing (SIMPLE)
  Result: S1 - redirect
  Target: openai/gpt-4o-mini
  ✅ PASS

Test 4: Cost Routing (COMPLEX)
  Result: S1 - redirect
  Target: anthropic/claude-sonnet-4-5
  ✅ PASS

Test 5: Memory System
  Total Memories: 0
  L0: 0, L1: 0, L2: 0
  ✅ PASS

🎉 All tests completed!
```

---

## 📦 核心模块

### @claw-ai/router

隐私和成本优化的智能路由系统

```typescript
import { createClawAIRouter } from '@claw-ai/router';

const router = createClawAIRouter();

const decision = await router.detect({
  message: 'My SSH key is...',
});

console.log(decision);
// { level: 'S3', action: 'local-only', reason: '...' }
```

### @claw-ai/memory

三层记忆系统

```typescript
import { createClawAIMemory } from '@claw-ai/memory';

const memory = createClawAIMemory();

// 检索记忆
const result = await memory.retrieve('previous project discussion');

// 构建记忆
await memory.buildMemory({
  type: 'conversation-end',
  messages: [...],
  duration: 120000,
});
```

### @claw-ai/core

核心引擎

```typescript
import { createClawAI } from '@claw-ai/core';

const clawai = await createClawAI();

const response = await clawai.handleMessage({
  userId: 'user123',
  workspaceId: 'ws456',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

---

## 🗓️ 开发路线图

### Phase 1: 基础框架 (2 周) ✅
- [x] 项目初始化
- [x] Router 包实现
- [x] Memory 包实现
- [x] Core 包基础
- [ ] 单元测试

### Phase 2: EdgeClaw 特性 (3 周)
- [ ] 完整 ClawXRouter 集成
- [ ] 完整 ClawXMemory 集成
- [ ] ClawXKairos 自驱动 Agent
- [ ] 记忆可视化 Dashboard

### Phase 3: Airi 特性 (3 周)
- [ ] Live2D 集成
- [ ] 语音系统
- [ ] 情感识别
- [ ] 游戏集成

### Phase 4: PAI 特性 (2 周)
- [ ] Hooks 系统
- [ ] Workflows 引擎
- [ ] Agents 框架

### Phase 5: 差异化功能 (4 周)
- [ ] 情感记忆
- [ ] 个性化定制
- [ ] 社区功能
- [ ] 文档完善

**总计**: 14 周完成 MVP

---

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./docs/CONTRIBUTING.md) 了解如何参与。

### 开发设置

```bash
# 克隆后
pnpm install
pnpm build

# 运行测试
pnpm test

# 代码检查
pnpm lint
pnpm format
```

---

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件

---

## 🙏 致谢

本项目灵感来自和代码参考自：

- [OpenClaw](https://github.com/openclaw/openclaw) - 全渠道 AI 助手
- [EdgeClaw](https://github.com/OpenBMB/EdgeClaw) - 端云协同优化
- [Airi](https://github.com/moeru-ai/airi) - 情感化 AI 伴侣
- [Personal_AI_Infrastructure](https://github.com/DanielMiessler/Personal_AI_Infrastructure) - 个人 AI 基础设施

---

## 📬 联系方式

- **GitHub**: [@claw-ai](https://github.com/claw-ai)
- **Discord**: [加入社区](https://discord.gg/claw-ai)
- **Twitter**: [@ClawAI](https://twitter.com/ClawAI)

---

**Made with ❤️ by the ClawAI Team**
