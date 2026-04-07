# 📊 ClawXAI Dashboard 使用指南

**版本**: v1.1.0  
**最后更新**: 2026-04-08

---

## 🚀 快速开始

### 启动 Dashboard

```bash
# 方式 1: 通过 gateway
node apps/gateway/gateway.mjs --dashboard

# 方式 2: 直接启动
node apps/dashboard/dashboard.mjs
```

### 访问界面

打开浏览器访问：**http://localhost:3000**

---

## 📈 仪表板功能

### 实时统计卡片

| 指标 | 说明 | 目标 |
|------|------|------|
| **Total Requests** | 总请求数 | - |
| **Total Tokens** | 总 Token 使用量 | - |
| **Total Cost** | 总成本 (USD) | - |
| **Cache Hit Rate** | 缓存命中率 | >50% |
| **Avg Response Time** | 平均响应时间 | <10ms |
| **Memory Items** | 记忆条目数 | - |

---

### 复杂度分布图

显示请求复杂度分布：

- **SIMPLE** (绿色): <15 词
- **MEDIUM** (青色): 15-80 词
- **COMPLEX** (紫色): >80 词
- **REASONING** (红色): 推理/数学

**优化建议**: 如果 COMPLEX 占比过高，考虑优化提示词。

---

### 隐私级别分布图

显示隐私检测级别分布：

- **S1** (绿色): 无敏感数据
- **S2** (橙色): 敏感数据 (需脱敏)
- **S3** (红色): 高度敏感 (仅本地)

**安全建议**: S3 占比应接近 0%，否则检查是否误报。

---

### 模型使用分布

显示各 LLM 模型的使用情况：

- gpt-4o-mini
- gpt-4o
- claude-sonnet-4-5
- o4-mini

**成本优化**: 增加 SIMPLE 请求比例可降低 58% 成本。

---

### 记忆分布图

显示三层记忆系统分布：

- **L0** (青色): 原始对话记录
- **L1** (紫色): 记忆片段 (摘要 + 话题)
- **L2** (绿色): 项目记忆/用户画像

---

## 🎮 界面操作

### 刷新数据

- **手动刷新**: 点击 🔄 Refresh 按钮
- **自动刷新**: 默认每 5 秒自动刷新
- **关闭自动**: 点击 ⏱️ Auto: ON 按钮

### 重置统计

点击 🗑️ Reset Stats 按钮可清空所有统计数据。

⚠️ **警告**: 此操作不可逆！

---

## 🔌 API 集成

### 获取完整数据

```bash
curl http://localhost:3000/api/dashboard
```

**响应示例**:

```json
{
  "stats": {
    "totalRequests": 1250,
    "totalTokens": 45000,
    "totalCost": 2.35,
    "cacheHitRate": 0.42,
    "avgResponseTime": 8.5
  },
  "routing": {
    "complexity": {
      "SIMPLE": 800,
      "MEDIUM": 300,
      "COMPLEX": 100,
      "REASONING": 50
    },
    "models": {
      "gpt-4o-mini": 800,
      "gpt-4o": 300,
      "claude-sonnet-4-5": 100,
      "o4-mini": 50
    },
    "privacy": {
      "S1": 1200,
      "S2": 45,
      "S3": 5
    }
  },
  "memory": {
    "totalMemories": 0,
    "l0Count": 0,
    "l1Count": 0,
    "l2Count": 0,
    "storageSize": 0
  },
  "timeline": [...]
}
```

---

### 获取统计数据

```bash
curl http://localhost:3000/api/stats
```

---

### 获取路由分布

```bash
curl http://localhost:3000/api/routing
```

---

### 获取记忆统计

```bash
curl http://localhost:3000/api/memory
```

---

### 记录请求

```bash
curl -X POST http://localhost:3000/api/record \
  -H "Content-Type: application/json" \
  -d '{
    "complexity": "SIMPLE",
    "model": "gpt-4o-mini",
    "privacy": "S1",
    "tokens": 50,
    "cost": 0.0001,
    "responseTime": 120,
    "cacheHit": false
  }'
```

---

### 重置统计

```bash
curl -X POST http://localhost:3000/api/reset
```

---

## 🎨 自定义配置

### 更改端口

```bash
export CLAWXAI_DASHBOARD_PORT=3001
node apps/gateway/gateway.mjs --dashboard
```

### 修改刷新间隔

编辑 `apps/dashboard/dist/index.html`:

```javascript
function startAutoRefresh() {
  refreshInterval = setInterval(refreshData, 10000); // 10 秒
}
```

---

## 📊 数据解读

### 健康指标

✅ **良好状态**:
- Cache Hit Rate > 50%
- Avg Response Time < 10ms
- S3 Privacy < 1%
- SIMPLE 请求 > 60%

⚠️ **需要关注**:
- Cache Hit Rate < 30%
- Avg Response Time > 50ms
- S3 Privacy > 5%
- COMPLEX 请求 > 30%

❌ **需要优化**:
- Cache Hit Rate < 10%
- Avg Response Time > 100ms
- S3 Privacy > 10%
- 成本增长过快

---

### 成本分析

**计算公式**:

```
总成本 = Σ(各模型请求数 × 单次成本)

gpt-4o-mini:     $0.00015 / 1K tokens
gpt-4o:          $0.005    / 1K tokens
claude-sonnet:   $0.003    / 1K tokens
o4-mini:         $0.002    / 1K tokens
```

**优化策略**:
1. 增加缓存命中率
2. 提高 SIMPLE 请求比例
3. 优化提示词减少 token 使用
4. 合理设置模型路由规则

---

## 🔧 故障排除

### Dashboard 无法访问

**问题**: 浏览器显示 "无法连接"

**解决**:
```bash
# 检查服务是否运行
curl http://localhost:3000/api/stats

# 如果失败，重启服务
node apps/gateway/gateway.mjs --dashboard
```

### 数据不更新

**问题**: 统计数字一直为 0

**解决**:
1. 检查是否启用了记录功能
2. 确认 gateway 正确调用 `store.recordRequest()`
3. 刷新页面或点击 Refresh 按钮

### 端口冲突

**问题**: `Error: listen EADDRINUSE`

**解决**:
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或使用其他端口
export CLAWXAI_DASHBOARD_PORT=3001
```

---

## 🎯 最佳实践

### 1. 定期监控

每天查看 Dashboard，关注：
- 成本趋势
- 缓存命中率
- 隐私检测准确率

### 2. 设置告警

通过 API 集成监控系统：

```javascript
// 示例：成本超支告警
const stats = await fetch('http://localhost:3000/api/stats');
if (stats.totalCost > 10) {
  sendAlert('Daily cost exceeded $10!');
}
```

### 3. 优化路由策略

根据 Dashboard 数据调整：

```json
{
  "cost": {
    "models": {
      "SIMPLE": { "provider": "openai", "model": "gpt-4o-mini" }
    }
  }
}
```

### 4. 记忆系统调优

根据记忆分布调整：

```json
{
  "memory": {
    "retentionDays": 30,  // 减少保留时间
    "autoBuild": true
  }
}
```

---

## 📖 相关文档

- [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) - 配置指南
- [README.md](../README.md) - 项目介绍
- [CHANGELOG.md](../CHANGELOG.md) - 更新日志

---

## 💬 反馈

有改进建议？

- **GitHub Issues**: https://github.com/skytitan008/ClawXAI/issues
- **Email**: 188005495@qq.com

---

**Made with ❤️ by the ClawXAI Team**
