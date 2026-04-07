# 📚 ClawXAI 配置指南

**版本**: v1.1.0  
**最后更新**: 2026-04-08

---

## 🎯 快速开始

### 1. 创建配置文件

```bash
# 复制示例配置
cp ~/.clawxai/config.example.json ~/.clawxai/config.json
```

### 2. 编辑配置

```bash
nano ~/.clawxai/config.json
```

### 3. 启动应用

```bash
# 交互模式
node apps/gateway/gateway.mjs

# Dashboard 模式
node apps/gateway/gateway.mjs --dashboard

# 测试模式
node apps/gateway/gateway.mjs --test
```

---

## ⚙️ 配置选项

### 隐私检测 (privacy)

```json
{
  "privacy": {
    "enabled": true,           // 是否启用隐私检测
    "autoLocalMode": true,     // S3 级别自动切换到本地处理
    "autoRedact": true,        // S2 级别自动脱敏
    "customRules": {           // 自定义规则 (可选)
      "keywords": {
        "S2": ["custom_word"],
        "S3": ["secret_word"]
      }
    }
  }
}
```

**检测级别**:
- **S1**: 无敏感数据 → 直通
- **S2**: 敏感数据 (邮箱/电话) → 脱敏后转发
- **S3**: 高度敏感 (SSH 密钥/信用卡) → 仅本地处理

---

### 成本优化 (cost)

```json
{
  "cost": {
    "enabled": true,           // 是否启用成本优化
    "cacheTTL": 300000,        // 缓存时间 (毫秒) = 5 分钟
    "models": {
      "SIMPLE": { "provider": "openai", "model": "gpt-4o-mini" },
      "MEDIUM": { "provider": "openai", "model": "gpt-4o" },
      "COMPLEX": { "provider": "anthropic", "model": "claude-sonnet-4-5" },
      "REASONING": { "provider": "openai", "model": "o4-mini" }
    }
  }
}
```

**复杂度判断**:
- **SIMPLE**: <15 词 → 廉价模型
- **MEDIUM**: 15-80 词 → 中等模型
- **COMPLEX**: >80 词/代码 → 高级模型
- **REASONING**: 推理/数学 → 推理模型

---

### 记忆系统 (memory)

```json
{
  "memory": {
    "enabled": true,           // 是否启用记忆
    "storage": "memory",       // 存储类型：'memory' | 'sqlite'
    "dbPath": "~/.clawxai/memory.db",  // SQLite 路径
    "autoBuild": true,         // 自动构建记忆
    "retentionDays": 90        // 记忆保留天数
  }
}
```

**存储类型**:
- **memory**: 内存存储 (快速，重启后丢失)
- **sqlite**: SQLite 持久化 (需要编译 better-sqlite3)

---

### 日志 (logging)

```json
{
  "logging": {
    "level": "info",           // 日志级别：debug | info | warn | error
    "verboseRouter": false,    // 详细路由日志
    "verboseMemory": false     // 详细记忆日志
  }
}
```

---

### 性能 (performance)

```json
{
  "performance": {
    "routerTimeout": 5000,         // 路由决策超时 (毫秒)
    "maxConcurrentRouters": 10     // 最大并发路由数
  }
}
```

---

## 🎨 环境变量

支持通过环境变量覆盖配置：

```bash
# 隐私
export CLAWXAI_PRIVACY_ENABLED=true
export CLAWXAI_PRIVACY_AUTO_LOCAL=true

# 成本
export CLAWXAI_COST_ENABLED=true
export CLAWXAI_COST_CACHE_TTL=300000

# 记忆
export CLAWXAI_MEMORY_ENABLED=true
export CLAWXAI_MEMORY_STORAGE=memory

# Dashboard
export CLAWXAI_DASHBOARD_PORT=3000

# 日志
export CLAWXAI_LOG_LEVEL=info
```

---

## 📊 Dashboard 使用

### 启动 Dashboard

```bash
node apps/gateway/gateway.mjs --dashboard
# 或
node apps/dashboard/dashboard.mjs
```

### 访问界面

打开浏览器访问：http://localhost:3000

### API 端点

```
GET  /api/dashboard  - 完整仪表板数据
GET  /api/stats      - 统计数据
GET  /api/routing    - 路由分布
GET  /api/memory     - 记忆统计
POST /api/record     - 记录新请求
POST /api/reset      - 重置统计
```

### 示例请求

```bash
# 获取统计
curl http://localhost:3000/api/stats

# 记录请求
curl -X POST http://localhost:3000/api/record \
  -H "Content-Type: application/json" \
  -d '{
    "complexity": "SIMPLE",
    "tokens": 50,
    "cost": 0.0001,
    "responseTime": 120,
    "cacheHit": false
  }'
```

---

## 🔧 故障排除

### 配置文件未找到

```
[Config] No config file found, using defaults
```

**解决**: 创建 `~/.clawxai/config.json`

### SQLite 不可用

```
[Memory] ⚠️  SQLite not available (experimental feature)
[Memory] ℹ️  Falling back to in-memory storage
```

**解决**: 这是正常的。SQLite 是实验性功能，会自动回退到内存存储。

### Dashboard 端口被占用

```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决**: 更改端口

```bash
export CLAWXAI_DASHBOARD_PORT=3001
node apps/gateway/gateway.mjs --dashboard
```

---

## 📝 配置示例

### 开发环境

```json
{
  "privacy": {
    "enabled": true,
    "autoLocalMode": true,
    "autoRedact": true
  },
  "cost": {
    "enabled": false
  },
  "memory": {
    "enabled": true,
    "storage": "memory"
  },
  "logging": {
    "level": "debug",
    "verboseRouter": true,
    "verboseMemory": true
  }
}
```

### 生产环境

```json
{
  "privacy": {
    "enabled": true,
    "autoLocalMode": true,
    "autoRedact": true
  },
  "cost": {
    "enabled": true,
    "cacheTTL": 300000
  },
  "memory": {
    "enabled": true,
    "storage": "sqlite",
    "dbPath": "/var/lib/clawxai/memory.db",
    "autoBuild": true,
    "retentionDays": 365
  },
  "logging": {
    "level": "warn"
  },
  "performance": {
    "routerTimeout": 3000,
    "maxConcurrentRouters": 50
  }
}
```

### 高隐私模式

```json
{
  "privacy": {
    "enabled": true,
    "autoLocalMode": true,
    "autoRedact": true,
    "customRules": {
      "keywords": {
        "S2": ["password", "secret", "private"],
        "S3": ["ssh-rsa", "BEGIN RSA", "BEGIN OPENSSH"]
      }
    }
  },
  "cost": {
    "enabled": false
  },
  "memory": {
    "enabled": false
  }
}
```

---

## 🚀 性能优化建议

### 1. 调整缓存 TTL

```json
{
  "cost": {
    "cacheTTL": 600000  // 10 分钟 (减少重复请求)
  }
}
```

### 2. 限制并发路由

```json
{
  "performance": {
    "maxConcurrentRouters": 20  // 根据服务器能力调整
  }
}
```

### 3. 使用 SQLite 持久化

```json
{
  "memory": {
    "storage": "sqlite",
    "dbPath": "/fast/ssd/clawxai.db"  // 使用 SSD
  }
}
```

### 4. 减少日志输出

```json
{
  "logging": {
    "level": "warn",
    "verboseRouter": false,
    "verboseMemory": false
  }
}
```

---

## 📖 相关文档

- [README.md](../README.md) - 项目介绍
- [CONTRIBUTING.md](../CONTRIBUTING.md) - 贡献指南
- [CHANGELOG.md](../CHANGELOG.md) - 更新日志
- [RELEASE_v1.1.0.md](./RELEASE_v1.1.0.md) - v1.1.0 发布说明

---

## 💬 支持

遇到问题？

- **GitHub Issues**: https://github.com/skytitan008/ClawXAI/issues
- **Email**: 188005495@qq.com

---

**Made with ❤️ by the ClawXAI Team**
