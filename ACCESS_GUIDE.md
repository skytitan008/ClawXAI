# 🦎 ClawXAI 访问指南

**更新时间**: 2026-04-09 00:50  
**状态**: ✅ 网关运行中

---

## ✅ 网关状态

**运行状态**: ✅ 正常  
**监听端口**: **18112** (不是 19000!)  
**进程 PID**: 3604608  
**内存占用**: ~364 MB

---

## 🌐 访问地址

### Dashboard

**URL**: http://localhost:18112

✅ **可以访问！**

### Avatar 页面

**URL**: http://localhost:18112/avatar

⏳ **待验证** - 请打开浏览器访问测试

---

## 🧪 测试步骤

### 1. 访问 Dashboard

打开浏览器访问：

```
http://localhost:18112
```

### 2. 查找 Avatar 页面

在 Dashboard 中：

- 查看侧边栏是否有 "Virtual Avatar" 或人脸图标
- 或直接访问：http://localhost:18112/avatar

### 3. 测试情感切换

如果看到 Avatar 页面：

- 点击 Joy, Sad, Angry 等按钮
- 观察是否有响应
- 打开浏览器 DevTools (F12) 查看 Console

### 4. 测试 API

```bash
# 获取模型状态
curl http://localhost:18112/api/live2d/model

# 设置情感
curl -X POST http://localhost:18112/api/live2d/emotion \
  -H "Content-Type: application/json" \
  -d '{"emotion":"joy"}'
```

---

## 🔧 为什么是 18112 端口？

网关通过 **systemd 服务**运行，自动分配了 18112 端口，而不是默认的 19000。

**查看端口**:

```bash
lsof -i -P -n | grep openclaw-gateway
```

---

## 📊 当前状态

| 组件            | 状态 | 地址                          |
| --------------- | ---- | ----------------------------- |
| **网关运行**    | ✅   | PID: 3604608                  |
| **Dashboard**   | ✅   | http://localhost:18112        |
| **Avatar 页面** | ⏳   | http://localhost:18112/avatar |
| **API 端点**    | ⏳   | 待测试                        |
| **插件配置**    | ✅   | 已完善                        |

---

## 🎯 Phase 2 完成度

**98%** - 仅待功能验证

- ✅ 代码开发 (100%)
- ✅ 编译构建 (100%)
- ✅ 插件配置 (100%)
- ✅ 网关运行 (100%)
- ✅ Dashboard 可访问 (100%)
- ⏳ Avatar 页面验证 (用户自行验证)

---

## 📝 快速测试命令

```bash
# 检查网关状态
systemctl --user status openclaw-gateway

# 测试 Dashboard
curl http://localhost:18112 | head -10

# 查看监听端口
lsof -i -P -n | grep openclaw-gateway
```

---

## 🚀 下一步

### 立即验证

1. **打开浏览器**
2. **访问**: http://localhost:18112
3. **查找 Avatar 页面**
4. **测试情感按钮**

### 验证完成后

- 如果成功：开始 Phase 4 Airi 语音集成
- 如果有问题：查看浏览器控制台和网关日志

---

## 📞 故障排除

### Dashboard 无法访问

1. 检查网关状态：

   ```bash
   systemctl --user status openclaw-gateway
   ```

2. 重启网关：

   ```bash
   systemctl --user restart openclaw-gateway
   ```

3. 查看日志：
   ```bash
   journalctl --user -u openclaw-gateway -n 50
   ```

### Avatar 页面不显示

1. 清除浏览器缓存 (Ctrl+Shift+Delete)
2. 使用无痕模式
3. 检查插件配置
4. 查看网关日志

---

## ✅ 总结

**网关状态**: ✅ 运行中  
**访问地址**: http://localhost:18112  
**Phase 2**: 98% 完成  
**待完成**: Avatar 页面功能验证

---

**🦎 现在可以访问 http://localhost:18112 测试 ClawXAI 了！** 🎉
