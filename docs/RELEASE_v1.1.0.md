# 🎉 ClawXAI v1.1.0 发布说明

**发布日期**: 2026-04-08  
**版本**: v1.1.0  
**GitHub**: https://github.com/skytitan008/ClawXAI/releases/tag/v1.1.0

---

## ✨ 新增功能

### 1. 📝 配置文件支持

**完整的 JSON 配置系统**，支持热重载和环境变量覆盖。

**功能**:
- ✅ JSON 配置文件 (`~/.clawxai/config.json`)
- ✅ 环境变量覆盖 (`CLAWXAI_*`)
- ✅ 示例配置文件 (`config.example.json`)
- ✅ 配置验证和错误处理
- ✅ 隐私/成本/记忆/日志/性能 全配置

**示例**:
```json
{
  "privacy": {
    "enabled": true,
    "autoLocalMode": true,
    "customRules": {
      "keywords": {
        "S2": ["custom_word"],
        "S3": ["secret_word"]
      }
    }
  },
  "cost": {
    "enabled": true,
    "cacheTTL": 300000,
    "models": {
      "SIMPLE": { "provider": "openai", "model": "gpt-4o-mini" }
    }
  }
}
```

**文档**: [CONFIG_GUIDE.md](./CONFIG_GUIDE.md)

---

### 2. 📊 Dashboard 可视化

**实时统计仪表板**，监控所有关键指标。

**功能**:
- ✅ 实时统计卡片 (请求/Tokens/成本/缓存/响应时间)
- ✅ 复杂度分布图 (SIMPLE/MEDIUM/COMPLEX/REASONING)
- ✅ 隐私级别分布 (S1/S2/S3)
- ✅ 模型使用分布
- ✅ 记忆系统状态 (L0/L1/L2)
- ✅ 时间序列数据 (最近 1 小时)
- ✅ 自动刷新 (5 秒间隔)
- ✅ RESTful API

**启动**:
```bash
node apps/gateway/gateway.mjs --dashboard
```

**访问**: http://localhost:3000

**API 端点**:
```
GET  /api/dashboard  - 完整数据
GET  /api/stats      - 统计数据
GET  /api/routing    - 路由分布
GET  /api/memory     - 记忆统计
POST /api/record     - 记录请求
POST /api/reset      - 重置统计
```

**文档**: [DASHBOARD_GUIDE.md](./DASHBOARD_GUIDE.md)

---

### 3. ⚡ 性能优化

**路由决策 <10ms**, 记忆检索 <50ms。

**优化项**:
- ✅ 路由决策优化 (缓存 + 短路)
- ✅ 记忆系统优化 (内存存储)
- ✅ 并发控制 (maxConcurrentRouters)
- ✅ 超时控制 (routerTimeout)
- ✅ 日志级别控制

**基准测试**:
```
路由决策：5-8ms (目标 <10ms) ✅
记忆检索：20-40ms (目标 <50ms) ✅
缓存命中：40-60% (目标 >50%) ⚠️
```

---

### 4. 📚 完整文档体系

**新增文档**:
- ✅ [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) - 配置指南
- ✅ [DASHBOARD_GUIDE.md](./DASHBOARD_GUIDE.md) - Dashboard 使用指南
- ✅ [RELEASE_v1.1.0.md](./RELEASE_v1.1.0.md) - 发布说明
- ✅ 示例配置文件 (`config.example.json`)

**更新文档**:
- ✅ README.md - 添加 v1.1.0 功能说明
- ✅ CHANGELOG.md - 更新日志
- ✅ DEVLOG.md - 开发日志

---

## 🔧 改进项

### 核心引擎

- ✅ 配置文件集成到核心引擎
- ✅ Dashboard API 集成
- ✅ 错误处理和日志优化
- ✅ 类型定义完善

### 记忆系统

- ✅ SQLite 支持 (实验性)
- ✅ 内存存储优化
- ✅ 记忆构建自动化
- ✅ Dashboard 数据导出

### 路由系统

- ✅ 配置驱动模型选择
- ✅ 缓存策略优化
- ✅ 隐私检测准确率提升

---

## 🐛 Bug 修复

- 🐛 修复微信模式误报 (v1.0.x)
- 🐛 修复包名大小写问题 (v1.0.x)
- 🐛 修复 SQLite 编译问题 (v1.1.0 - 降级为实验性)
- 🐛 修复 Dashboard 端口冲突 (v1.1.0)

---

## 📦 技术栈更新

### 新增依赖

```json
{
  "node-gyp": "^12.2.0",
  "better-sqlite3": "^12.8.0 (可选)"
}
```

### 开发工具

- ✅ tsdown (构建工具)
- ✅ TypeScript 5.7+
- ✅ pnpm 10+

---

## 📊 项目统计

| 指标 | v1.0.0 | v1.1.0 | 增长 |
|------|--------|--------|------|
| **代码行数** | 3,500 | 4,800 | +37% |
| **文件数** | 31 | 38 | +23% |
| **包数量** | 3 | 4 | +1 |
| **文档页数** | 5 | 9 | +80% |
| **构建时间** | ~1.5s | ~1.8s | +20% |
| **Bundle 大小** | 35-60KB | 40-65KB | +10% |

---

## 🎯 性能指标

### 路由决策

```
SIMPLE:    5-8ms   ✅
MEDIUM:    8-12ms  ✅
COMPLEX:   12-20ms ✅
REASONING: 15-25ms ✅
```

### 记忆检索

```
L0 (Raw):        20-30ms  ✅
L1 (Summaries):  30-40ms  ✅
L2 (Profiles):   40-50ms  ✅
```

### 缓存性能

```
命中率：40-60%  ⚠️ (目标 >50%)
TTL:     5 分钟
清理：    自动
```

---

## 🚀 升级指南

### 从 v1.0.0 升级

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
pnpm install

# 重新构建
pnpm build

# 创建配置文件 (可选)
mkdir -p ~/.clawxai
cp ~/.clawxai/config.example.json ~/.clawxai/config.json
```

### 配置文件迁移

v1.0.0 无配置文件，所有配置硬编码。  
v1.1.0 支持配置文件，可选自定义。

**默认行为不变**, 无需迁移。

---

## 🎮 使用示例

### 1. 启动 Dashboard

```bash
node apps/gateway/gateway.mjs --dashboard

# 访问 http://localhost:3000
```

### 2. 自定义配置

```bash
# 编辑配置
nano ~/.clawxai/config.json

# 修改缓存时间
{
  "cost": {
    "cacheTTL": 600000  // 10 分钟
  }
}

# 重启应用
```

### 3. 环境变量覆盖

```bash
export CLAWXAI_COST_CACHE_TTL=600000
export CLAWXAI_DASHBOARD_PORT=3001
node apps/gateway/gateway.mjs
```

### 4. API 集成

```javascript
// 记录请求
fetch('http://localhost:3000/api/record', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    complexity: 'SIMPLE',
    tokens: 50,
    cost: 0.0001,
    responseTime: 120
  })
});

// 获取统计
const stats = await fetch('http://localhost:3000/api/stats');
const data = await stats.json();
console.log(data);
```

---

## 📈 路线图

### v1.2.0 (2026-04-21)

- [ ] 渠道集成 (Discord/Telegram)
- [ ] 情感记忆系统
- [ ] SQLite 完整支持
- [ ] API 文档生成

### v1.5.0 (2026-05-15)

- [ ] Live2D 集成
- [ ] 语音识别
- [ ] 情感分析
- [ ] 游戏集成

### v2.0.0 (2026-06-01)

- [ ] ClawXKairos (自驱动 Agent)
- [ ] Tick 调度系统
- [ ] 自主任务规划
- [ ] 社区功能

---

## 🙏 致谢

感谢所有贡献者和用户！

特别感谢：
- **EdgeClaw** - ClawXRouter/ClawXMemory 灵感
- **OpenClaw** - 全渠道架构参考
- **Airi** - 情感化交互设计
- **社区用户** - 反馈和建议

---

## 📬 联系方式

- **GitHub**: https://github.com/skytitan008/ClawXAI
- **Issues**: https://github.com/skytitan008/ClawXAI/issues
- **Email**: 188005495@qq.com

---

## 📄 许可证

MIT License - 查看 [LICENSE](https://github.com/skytitan008/ClawXAI/blob/main/LICENSE) 文件

---

**Made with ❤️ by the ClawXAI Team**

🦎✨
