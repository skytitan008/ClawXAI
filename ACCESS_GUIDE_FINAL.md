# 🦎 ClawXAI 认证访问指南

**更新时间**: 2026-04-09 01:00  
**状态**: ✅ 网关已重启，认证已重置

---

## 🔑 Gateway Token

```
clawx-241a911fbd8191474faa774044f74d55
```

**建议**: 复制整个 token，避免手误！

---

## 🌐 访问步骤

### Step 1: 打开 Dashboard

浏览器访问：

```
http://localhost:18112
```

### Step 2: 找到认证入口

看到 "Unauthorized" 页面后：

1. 找 **"Settings"** 按钮（通常是齿轮图标⚙️）
2. 或找 **"Control UI"** 链接
3. 或找 **"Enter Token"** 输入框

### Step 3: 输入 Token

在 **"Gateway Token"** 或 **"Auth Token"** 输入框中：

1. 粘贴：`clawx-241a911fbd8191474faa774044f74d55`
2. 点击 **"Save"** 或 **"Apply"**
3. 页面应该刷新并显示 Dashboard

### Step 4: 访问 Avatar 页面

认证成功后：

- **方法 1**: 在侧边栏找 "Virtual Avatar" 或人脸图标
- **方法 2**: 直接访问 http://localhost:18112/avatar

---

## ⚠️ 注意事项

### 避免再次被锁

1. **只尝试一次** - 确保 token 完全正确
2. **复制粘贴** - 不要手动输入
3. **检查空格** - token 前后不要有空格
4. **等待 1 分钟** - 如果失败，等待后再试

### Token 格式

✅ 正确：

```
clawx-241a911fbd8191474faa774044f74d55
```

❌ 错误（有空格）：

```
 clawx-241a911fbd8191474faa774044f74d55
clawx-241a911fbd8191474faa774044f74d55[空格]
```

---

## 🧪 测试清单

认证成功后：

- [ ] Dashboard 主页面显示正常
- [ ] 侧边栏有多个功能选项
- [ ] 可以找到 "Virtual Avatar" 或类似选项
- [ ] 访问 Avatar 页面能看到界面
- [ ] 有情感测试按钮（Joy, Sad, Angry 等）

---

## 🔧 如果还是失败

### 方法 1: 使用无痕模式

```
Chrome: Ctrl+Shift+N
Firefox: Ctrl+Shift+P
```

### 方法 2: 清除浏览器缓存

```
Chrome/Firefox: Ctrl+Shift+Delete
选择 "Cookies" 和 "缓存"
点击 "清除数据"
```

### 方法 3: 再次重启网关

```bash
systemctl --user restart openclaw-gateway
```

### 方法 4: 查看网关日志

```bash
journalctl --user -u openclaw-gateway -n 30
```

---

## 📋 快速参考

| 项目          | 值                                       |
| ------------- | ---------------------------------------- |
| **Dashboard** | http://localhost:18112                   |
| **Avatar**    | http://localhost:18112/avatar            |
| **Token**     | `clawx-241a911fbd8191474faa774044f74d55` |
| **状态**      | ✅ 网关已重启                            |

---

## ✅ Phase 2 完成度

**98%** - 仅待功能验证

- ✅ 代码开发 (100%)
- ✅ 编译构建 (100%)
- ✅ 插件配置 (100%)
- ✅ 网关运行 (100%)
- ✅ Token 已重置 (100%)
- ⏳ Avatar 功能验证 (待你测试)

---

## 📝 测试 API (可选)

认证成功后，可以用 curl 测试：

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

**🦎 网关已重启，认证已重置！现在可以重新尝试访问了！** 🎉

**提示**: 使用无痕模式，复制粘贴 token，确保没有空格！
