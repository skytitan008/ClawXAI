# 🚀 Phase 2 开发计划 - EdgeClaw 完整集成

**阶段**: Phase 2 of 5  
**时间**: 3 周 (2026-04-07 ~ 2026-04-28)  
**目标**: 完整集成 EdgeClaw 的 ClawXRouter 和 ClawXMemory

---

## 📋 开发任务

### Week 1: ClawXRouter 完整实现

#### Task 1.1: LLM-as-Judge 复杂度判断
- [ ] 集成本地 LLM (Ollama/MiniCPM)
- [ ] 实现复杂度评估提示词
- [ ] 添加缓存机制 (5 分钟 TTL)
- [ ] 单元测试

**参考**: `edgeclaw_project/extensions/clawxrouter/src/routers/token-saver.ts`

#### Task 1.2: 完整隐私检测规则
- [ ] 扩展关键词库 (50+ 敏感词)
- [ ] 添加正则模式 (邮箱/电话/信用卡/SSH)
- [ ] 实现上下文感知检测
- [ ] 配置热重载

**参考**: `edgeclaw_project/extensions/clawxrouter/src/routers/privacy.ts`

#### Task 1.3: 路由管线优化
- [ ] 并行执行路由器
- [ ] 实现短路机制
- [ ] 添加权重系统
- [ ] 性能基准测试

**参考**: `edgeclaw_project/extensions/clawxrouter/src/router-pipeline.ts`

#### Task 1.4: Token 统计 Dashboard
- [ ] 实现 Token 收集器
- [ ] 创建 HTTP API (`/stats`)
- [ ] 添加成本计算
- [ ] 可视化图表

**参考**: `edgeclaw_project/extensions/clawxrouter/src/token-stats.ts`

---

### Week 2: ClawXMemory 完整实现

#### Task 2.1: 三层记忆存储
- [ ] L0: 原始对话存储 (SQLite)
- [ ] L1: 记忆片段提取
- [ ] L2: 项目/时间线聚合
- [ ] 数据迁移工具

**参考**: `edgeclaw_project/extensions/openbmb-clawxmemory/src/storage.ts`

#### Task 2.2: 模型驱动检索
- [ ] 实现相关性评估 LLM
- [ ] 沿记忆树导航算法
- [ ] 置信度评分
- [ ] 检索优化 (缓存/索引)

**参考**: `edgeclaw_project/extensions/openbmb-clawxmemory/src/runtime.ts`

#### Task 2.3: 自动记忆构建
- [ ] 对话结束触发器
- [ ] 话题切换检测
- [ ] 空闲时整理 (Auto-Dream)
- [ ] 用户反馈学习

**参考**: `edgeclaw_project/extensions/openbmb-clawxmemory/src/index.ts`

#### Task 2.4: 记忆 Dashboard
- [ ] 记忆树可视化
- [ ] 话题云生成
- [ ] 时间线展示
- [ ] 统计图表

**参考**: `edgeclaw_project/extensions/openbmb-clawxmemory/ui-source/`

---

### Week 3: ClawXKairos + 集成测试

#### Task 3.1: 自驱动 Agent 循环
- [ ] Tick 调度器
- [ ] Sleep 工具实现
- [ ] 自主任务规划
- [ ] 状态持久化

**参考**: `edgeclaw_project/extensions/clawxkairos/index.ts`

#### Task 3.2: 完整集成测试
- [ ] Router 测试覆盖 80%
- [ ] Memory 测试覆盖 80%
- [ ] 端到端测试
- [ ] 性能基准

#### Task 3.3: 文档完善
- [ ] API 文档
- [ ] 使用指南
- [ ] 示例代码
- [ ] 截图/演示

#### Task 3.4: v0.2.0 Release
- [ ] 更新 CHANGELOG
- [ ] 创建 Release
- [ ] 宣传推文
- [ ] GitHub Issues 清理

---

## 📊 进度追踪

### Week 1 (ClawXRouter)

| 任务 | 状态 | 完成度 | 备注 |
|------|------|--------|------|
| 1.1 LLM-as-Judge | ⏳ 待开始 | 0% | |
| 1.2 隐私检测 | ⏳ 待开始 | 0% | |
| 1.3 路由管线 | ⏳ 待开始 | 0% | |
| 1.4 Token 统计 | ⏳ 待开始 | 0% | |
| **Week 1 总计** | | **0%** | |

### Week 2 (ClawXMemory)

| 任务 | 状态 | 完成度 | 备注 |
|------|------|--------|------|
| 2.1 三层存储 | ⏳ 待开始 | 0% | |
| 2.2 模型检索 | ⏳ 待开始 | 0% | |
| 2.3 自动构建 | ⏳ 待开始 | 0% | |
| 2.4 记忆 Dashboard | ⏳ 待开始 | 0% | |
| **Week 2 总计** | | **0%** | |

### Week 3 (Kairos + 测试)

| 任务 | 状态 | 完成度 | 备注 |
|------|------|--------|------|
| 3.1 自驱动循环 | ⏳ 待开始 | 0% | |
| 3.2 集成测试 | ⏳ 待开始 | 0% | |
| 3.3 文档完善 | ⏳ 待开始 | 0% | |
| 3.4 v0.2.0 Release | ⏳ 待开始 | 0% | |
| **Week 3 总计** | | **0%** | |

---

## 🎯 关键指标

### 代码质量

| 指标 | 目标 | 当前 | 状态 |
|------|------|------|------|
| **测试覆盖率** | 80% | 0% | ⏳ |
| **TypeScript 严格度** | 100% | 100% | ✅ |
| **构建时间** | <3s | ~1.5s | ✅ |
| **Bundle 大小** | <50KB | ~30KB | ✅ |

### 功能指标

| 指标 | 目标 | 当前 | 状态 |
|------|------|------|------|
| **隐私检测准确率** | 99% | 95% | 🔄 |
| **路由决策延迟** | <10ms | <5ms | ✅ |
| **记忆检索准确率** | 90% | N/A | ⏳ |
| **成本节省** | 58% | N/A | ⏳ |

---

## 📦 依赖管理

### 从 EdgeClaw 复制的文件

```
edgeclaw_project/extensions/clawxrouter/
├── src/
│   ├── config-schema.ts          → packages/router/src/config.ts
│   ├── hooks.ts                  → packages/core/src/hooks.ts
│   ├── live-config.ts            → packages/core/src/config.ts
│   ├── privacy-proxy.ts          → packages/router/src/proxy.ts
│   ├── provider.ts               → packages/router/src/provider.ts
│   ├── router-pipeline.ts        → packages/router/src/pipeline.ts
│   ├── routers/
│   │   ├── privacy.ts            → packages/router/src/routers/privacy.ts
│   │   └── token-saver.ts        → packages/router/src/routers/token-saver.ts
│   ├── stats-dashboard.ts        → apps/dashboard/
│   └── token-stats.ts            → packages/router/src/stats.ts
└── prompts/
    └── judge-complexity.txt      → packages/router/prompts/

edgeclaw_project/extensions/openbmb-clawxmemory/
├── src/
│   ├── runtime.ts                → packages/memory/src/runtime.ts
│   ├── storage.ts                → packages/memory/src/storage.ts
│   └── types.ts                  → packages/memory/src/types.ts
└── ui-source/                    → apps/dashboard/memory/

edgeclaw_project/extensions/clawxkairos/
└── index.ts                      → packages/core/src/kairos.ts
```

### npm 依赖

```json
{
  "dependencies": {
    "better-sqlite3": "^11.0.0",    // SQLite 支持
    "express": "^4.18.0",           // Dashboard API
    "chart.js": "^4.4.0"            // 可视化图表
  }
}
```

---

## 🧪 测试策略

### 单元测试

```typescript
// 示例：隐私检测测试
describe('PrivacyRouter', () => {
  it('should detect SSH keys as S3', async () => {
    const router = new PrivacyRouter();
    const result = await router.detect({
      message: '-----BEGIN RSA PRIVATE KEY-----'
    });
    expect(result.level).toBe('S3');
    expect(result.action).toBe('local-only');
  });
});
```

### 集成测试

```typescript
// 示例：端到端路由测试
describe('RouterPipeline E2E', () => {
  it('should route sensitive data locally', async () => {
    const pipeline = createClawAIRouter();
    const decision = await pipeline.detect({
      message: 'My password is secret123'
    });
    expect(decision.action).toBe('local-only');
  });
});
```

### 性能测试

```bash
# 路由决策延迟
ab -n 1000 -c 10 http://localhost:3000/route

# 记忆检索延迟
ab -n 1000 -c 10 http://localhost:3000/memory/retrieve?q=test
```

---

## 📸 演示计划

### v0.2.0 截图清单

1. **Router Dashboard**
   - Token 使用统计
   - 成本节省图表
   - 路由决策分布

2. **Memory Dashboard**
   - 记忆树可视化
   - 话题云
   - 时间线展示

3. **隐私检测演示**
   - S3 检测 (SSH 密钥)
   - S2 检测 (邮箱)
   - 实时脱敏

4. **成本对比**
   - 使用前 vs 使用后
   - 58% 节省证明

---

## ⚠️ 风险与缓解

### 风险 1: EdgeClaw 代码复杂性

**风险**: EdgeClaw 代码依赖 OpenClaw SDK，直接复制可能不兼容

**缓解**:
- 提取核心逻辑，重写适配层
- 保持 API 兼容性
- 渐进式替换，非一次性重写

### 风险 2: 性能问题

**风险**: LLM-as-Judge 可能增加延迟

**缓解**:
- 实现缓存机制
- 使用轻量级本地模型
- 异步处理非关键路径

### 风险 3: 测试覆盖率不足

**风险**: 复杂逻辑难以全面测试

**缓解**:
- 优先测试核心路径
- 添加集成测试
- 社区贡献测试用例

---

## 🎊 完成标准

Phase 2 完成的标志：

- ✅ ClawXRouter 完整实现（LLM-as-Judge + 隐私检测）
- ✅ ClawXMemory 完整实现（三层存储 + 模型检索）
- ✅ ClawXKairos 基础实现（Tick 调度）
- ✅ 测试覆盖率 ≥ 80%
- ✅ Dashboard 可视化完成
- ✅ v0.2.0 Release 发布
- ✅ 文档完善（README + API + 示例）

---

**创建时间**: 2026-04-07  
**下次更新**: 2026-04-14 (Week 1 完成)  
**状态**: 🚀 开发中
