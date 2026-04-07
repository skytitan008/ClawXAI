# 📝 更新日志

所有重要的项目变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [未发布]

### Added
- 无

### Changed
- 无

### Deprecated
- 无

### Removed
- 无

### Fixed
- 无

### Security
- 无

---

## [2.0.0] - 2026-04-08

### ✨ MAJOR RELEASE - Self-Driven Agent

### Added

- **ClawXKairos 自驱动 Agent 系统**
  - Tick 调度系统 (可配置间隔)
  - 自主任务规划
  - 并发任务执行 (maxConcurrentTasks)
  - 任务优先级系统 (low/normal/high/critical)
  - 事件驱动架构 (tick:*/task:*/agent:*)
  - 任务超时控制
  - 自动清理机制

- **情感分析系统**
  - 7 种情绪识别 (joy/sadness/anger/fear/surprise/disgust/neutral)
  - 情绪强度分析 (0-1)
  - 关键词提取
  - Emoji 支持
  - 智能响应建议
  - 颜色编码

- **Discord 渠道集成**
  - 完整 Discord 机器人支持
  - 消息收发
  - 服务器/私聊支持
  - 事件监听
  - 元数据追踪

- **Telegram 渠道集成**
  - 完整 Telegram 机器人支持
  - Webhook/长轮询模式
  - 群组/私聊支持
  - 用户信息追踪

- **演示应用**
  - apps/kairos-demo/ - ClawXKairos 交互式演示
  - 60 秒完整任务执行展示

### Changed

- **核心引擎增强**
  - 集成情感分析
  - 集成 ClawXKairos
  - 改进事件系统
  - 完善类型定义

### Technical

- **新增模块**
  - packages/core/src/kairos.ts (9.2KB)
  - packages/core/src/emotion.ts (4.6KB)
  - extensions/discord-adapter/
  - extensions/telegram-adapter/
  - apps/kairos-demo/

### Stats

- 6,500+ 行代码
- 48 个文件
- 8 个包
- 14+ 篇文档

---

## [1.1.0] - 2026-04-08

### ✨ Added

- **配置文件支持**
  - JSON 配置文件 (`~/.clawxai/config.json`)
  - 环境变量覆盖 (`CLAWXAI_*`)
  - 示例配置文件 (`config.example.json`)
  - 配置验证和错误处理
  - 支持隐私/成本/记忆/日志/性能配置

- **Dashboard 可视化**
  - 实时统计卡片 (请求/Tokens/成本/缓存/响应时间)
  - 复杂度分布图 (SIMPLE/MEDIUM/COMPLEX/REASONING)
  - 隐私级别分布 (S1/S2/S3)
  - 模型使用分布
  - 记忆系统状态 (L0/L1/L2)
  - 时间序列数据 (最近 1 小时)
  - 自动刷新 (5 秒间隔)
  - RESTful API (`/api/*`)

- **性能优化**
  - 路由决策 <10ms
  - 记忆检索 <50ms
  - 并发控制 (maxConcurrentRouters)
  - 超时控制 (routerTimeout)

- **文档**
  - CONFIG_GUIDE.md - 配置指南
  - DASHBOARD_GUIDE.md - Dashboard 使用指南
  - RELEASE_v1.1.0.md - 发布说明
  - README.md 更新

### 🔧 Changed

- **核心引擎**
  - 集成配置文件支持
  - 集成 Dashboard API
  - 改进错误处理
  - 完善类型定义

- **记忆系统**
  - SQLite 降级为实验性功能
  - 内存存储优化
  - 自动记忆构建

- **路由系统**
  - 配置驱动模型选择
  - 缓存策略优化

### 🐛 Fixed

- 修复 SQLite 编译问题 (降级为实验性)
- 修复 Dashboard 端口冲突
- 修复配置加载错误

---

## [1.0.0] - 2026-04-07

### ✨ Added
- **项目初始化**
  - Monorepo 结构 (pnpm workspace)
  - TypeScript 配置
  - Git 仓库设置
  
- **@ClawXAI/router**
  - PrivacyRouter: S1/S2/S3 三级隐私检测
  - TokenSaverRouter: 成本感知路由
  - RouterPipeline: 可组合的路由管线
  
- **@ClawXAI/memory**
  - SimpleMemoryRepository: 内存存储实现
  - ClawXAIMemory: 三层记忆系统 (L0/L1/L2)
  - 记忆检索和构建功能
  
- **@ClawXAI/core**
  - ClawXAIEngine: 核心引擎
  - 消息处理流程
  - 渠道适配器接口
  
- **ClawXAI-gateway**
  - 交互式 CLI 模式
  - 内置测试套件
  - 实时消息处理演示

- **文档**
  - README.md
  - CONTRIBUTING.md
  - DEVLOG.md
  - LICENSE (MIT)

### 🧪 Tested
- 5/5 测试用例全部通过
  - ✅ S3 隐私检测 (SSH 密钥)
  - ✅ S2 隐私检测 (邮箱模式)
  - ✅ 简单任务路由
  - ✅ 复杂任务路由
  - ✅ 记忆系统

### 📦 Tech Stack
- Node.js 22+
- pnpm 10.32.1
- TypeScript 5.7+
- tsdown (rolldown) 0.12.9
- vitest 3.0+

### 📊 Stats
- 代码行数：~870 行
- 文件数：17 个
- 包大小：18-30KB
- 构建时间：~1.5s

---

## 版本说明

### 语义化版本

- **主版本号 (Major)**: 不兼容的 API 更改
- **次版本号 (Minor)**: 向后兼容的功能新增
- **修订号 (Patch)**: 向后兼容的问题修复

### 发布周期

- **开发版**: 随时发布到 `develop` 分支
- **稳定版**: 每月发布到 `main` 分支
- **LTS**: 每季度发布长期支持版

---

## 链接

- [GitHub Releases](https://github.com/skytitan008/ClawXAI/releases)
- [贡献指南](./CONTRIBUTING.md)
- [开发日志](./docs/DEVLOG.md)
