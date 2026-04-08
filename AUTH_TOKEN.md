# 🔐 ClawXAI 认证 Token

**更新时间**: 2026-04-09 00:55

---

## 🔑 Gateway Token

```
clawx-241a911fbd8191474faa774044f74d55
```

---

## 🌐 访问步骤

### 1. 打开 Dashboard

访问：**http://localhost:18112**

### 2. 输入 Token

你会看到 "Unauthorized" 页面，需要：

1. 点击 "Settings" 或 "Control UI"
2. 找到 "Gateway Token" 输入框
3. 粘贴上面的 token
4. 保存

### 3. 访问 Avatar 页面

认证成功后：

- 在侧边栏找 "Virtual Avatar" 或人脸图标
- 或直接访问：http://localhost:18112/avatar

---

## 📋 完整 URL

| 页面          | URL                             |
| ------------- | ------------------------------- |
| **Dashboard** | http://localhost:18112          |
| **Avatar**    | http://localhost:18112/avatar   |
| **Settings**  | http://localhost:18112/settings |

---

## 🔧 Token 来源

Token 来自 systemd 服务配置：

```bash
Environment=OPENCLAW_GATEWAY_TOKEN=clawx-241a911fbd8191474faa774044f74d55
```

---

## 🧪 测试 API

认证成功后，可以测试 API：

```bash
# 获取模型状态
curl -H "Authorization: Bearer clawx-241a911fbd8191474faa774044f74d55" \
  http://localhost:18112/api/live2d/model

# 设置情感
curl -X POST \
  -H "Authorization: Bearer clawx-241a911fbd8191474faa774044f74d55" \
  -H "Content-Type: application/json" \
  -d '{"emotion":"joy"}' \
  http://localhost:18112/api/live2d/emotion
```

---

## ✅ 认证后测试清单

- [ ] Dashboard 正常显示
- [ ] 侧边栏有各种功能选项
- [ ] 可以访问 Avatar 页面
- [ ] 情感按钮可以点击
- [ ] API 可以调用

---

## 🎯 Phase 2 完成度

**98%** - 仅待功能验证

- ✅ 代码开发 (100%)
- ✅ 编译构建 (100%)
- ✅ 插件配置 (100%)
- ✅ 网关运行 (100%)
- ✅ Dashboard 可访问 (100%)
- ✅ Token 已获取 (100%)
- ⏳ Avatar 功能验证 (待你测试)

---

## 📝 快速参考

**Token**: `clawx-241a911fbd8191474faa774044f74d55`

**Dashboard**: http://localhost:18112

**Avatar**: http://localhost:18112/avatar

---

**🦎 现在使用 token 认证后访问 Dashboard 测试吧！** 🎉
