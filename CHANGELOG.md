# 📝 更新日志

所有重要的项目变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [未发布]

### Added
- 初始项目结构
- Router 包（隐私检测 + 成本优化）
- Memory 包（三层记忆系统）
- Core 包（核心引擎）
- Gateway 应用（CLI + 测试）
- GitHub Actions CI/CD
- 贡献指南

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

## [0.1.0] - 2026-04-07

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
