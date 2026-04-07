# 📸 ClawXAI 截图与演示规范

**目的**: 为每个重要版本和重大功能更新提供视觉展示，增强项目吸引力

---

##  需要截图的场景

### 1. 版本发布 (Release)

| 版本 | 截图内容 | 用途 |
|------|----------|------|
| **v0.1.0** | 交互式 CLI 运行界面 | GitHub Release |
| **v0.2.0** | Router 路由决策可视化 | README + Release |
| **v0.3.0** | Memory Dashboard | README + 推文 |
| **v1.0.0** | 完整功能演示 | 官网 + 宣传 |

### 2. 重大功能

- ✨ 新功能首次运行
- 🎨 UI/UX 改进前后对比
- 📊 性能对比图表
- 🧪 测试结果展示

### 3. 使用场景

- 💬 对话示例 (隐私检测)
- 🧠 记忆检索演示
-  情感交互展示
- 📱 多渠道集成

---

## 📐 截图规格

### GitHub Release

```
分辨率：1920x1080 (16:9)
格式：PNG
大小：< 5MB
背景：终端深色主题
字体：JetBrains Mono / Fira Code
```

### README 徽章区下方

```
分辨率：1200x630 (1.91:1)
格式：PNG 或 GIF (动图)
大小：< 2MB
用途：项目预览图
```

### 社交媒体

```
Twitter/X: 1200x675 (16:9)
LinkedIn: 1200x627
Instagram: 1080x1080 (1:1)
```

---

## 🎨 视觉风格

### 终端主题

推荐使用 **Catppuccin Mocha** 或 **Dracula**

```bash
# 配色方案
背景：#1e1e2e (深紫)
前景：#cdd6f4 (浅灰)
强调：#f38ba8 (粉红) / #a6e3a1 (绿色)
```

### 终端字体

```
字体：JetBrains Mono Nerd Font
大小：14-16px
行高：1.5
连字：启用
```

### 终端大小

```bash
# 推荐尺寸
列：120
行：35
```

---

## 🛠️ 截图工具

### 命令行工具

```bash
# 安装
pnpm add -g terminal-to-html

# 使用
terminal-to-html --input script.sh --output demo.html
```

### 在线工具

- **Carbon** (https://carbon.now.sh/) - 代码截图
- **Ray.so** (https://ray.so/) - 美化代码
- **Termshot** - 终端截图

### 录屏工具

```bash
# Linux
sudo apt install asciinema

# 录制
asciinema rec demo.cast

# 播放
asciinema play demo.cast

# 转换为 GIF
asciicast2gif demo.cast demo.gif
```

---

## 📋 截图清单

### v0.1.0 (当前版本)

- [ ] 项目启动画面
- [ ] 测试运行结果 (5/5 PASS)
- [ ] 交互式对话示例
- [ ] 隐私检测演示 (S3 级别)
- [ ] GitHub 仓库页面

### v0.2.0 (Phase 2 完成)

- [ ] Router 决策流程图
- [ ] 成本节省对比图表
- [ ] Memory 检索演示
- [ ] Dashboard 界面
- [ ] 性能基准测试

### v1.0.0 (MVP)

- [ ] 完整功能演示视频 (2-3 分钟)
- [ ] 多渠道路由展示
- [ ] Live2D 集成效果
- [ ] 用户案例展示
- [ ] 性能对比图

---

## 🎬 演示脚本示例

### 隐私检测演示

```bash
#!/bin/bash
# demo-privacy.sh

echo "🦎 ClawXAI v0.1.0 - Privacy Detection Demo"
echo ""
echo "Test 1: Normal message"
node apps/gateway/gateway.mjs <<< "Hello!"

echo ""
echo "Test 2: Sensitive email"
node apps/gateway/gateway.mjs <<< "My email is test@example.com"

echo ""
echo "Test 3: SSH Key (S3 Level)"
node apps/gateway/gateway.mjs <<< "My SSH key: -----BEGIN RSA PRIVATE KEY-----"
```

### 记忆系统演示

```bash
#!/bin/bash
# demo-memory.sh

echo "🧠 ClawXAI Memory System Demo"
echo ""
echo "Step 1: Have a conversation"
node apps/gateway/gateway.mjs <<< "I'm working on a project called ClawXAI"
node apps/gateway/gateway.mjs <<< "It combines OpenClaw, Airi, and EdgeClaw"

echo ""
echo "Step 2: Retrieve memory"
node apps/gateway/gateway.mjs <<< "What did I talk about before?"
```

---

## 📊 数据可视化

### 性能对比图

使用工具：
- **Chart.js** - JavaScript 图表库
- **Mermaid** - Markdown 图表
- **ASCII 图表** - 终端内显示

示例 (Mermaid):

```mermaid
graph LR
    A[用户消息] --> B{Router}
    B -->|S1| C[Cloud LLM]
    B -->|S2| D[Redact → Cloud]
    B -->|S3| E[Local Only]
```

### 成本节省图表

```
原始成本：$100/月
使用 ClawXAI 后：$42/月
节省：58% 💰
```

---

## 📁 文件组织

```
ClawXAI/
├── docs/
│   ├── screenshots/          # 截图文件
│   │   ├── v0.1.0/
│   │   │   ├── cli-demo.png
│   │   │   ├── test-results.png
│   │   │   └── privacy-demo.png
│   │   └── v0.2.0/
│   ├── demos/                # 演示脚本
│   │   ├── demo-privacy.sh
│   │   ├── demo-memory.sh
│   │   └── demo-router.sh
│   └── media/                # 视频/GIF
│       └── demo-v0.1.0.gif
└── README.md                 # 引用截图
```

---

## 🚀 自动化截图

### GitHub Actions 自动截图

```yaml
# .github/workflows/screenshots.yml

name: Generate Screenshots

on:
  release:
    types: [published]

jobs:
  screenshot:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup and run
      run: |
        pnpm install
        pnpm build
        node apps/gateway/gateway.mjs --test
    
    - name: Upload screenshot
      uses: actions/upload-artifact@v4
      with:
        name: demo-screenshot
        path: screenshots/
```

---

## 💡 最佳实践

### ✅ 推荐

- 使用一致的终端主题
- 包含时间戳或版本号
- 添加简短说明文字
- 保持截图简洁 (聚焦重点)
- 使用高对比度配色

### ❌ 避免

- 模糊/低分辨率截图
- 包含敏感信息
- 过长的滚动截图
- 杂乱的文件列表
- 过时的 UI

---

## 📈 效果追踪

### GitHub 指标

- 📊 README 浏览量
- ⭐ Star 增长率
- 🍴 Fork 数量
- 👁️ Watchers 数量

### 社交媒体指标

- ❤️ 点赞数
- 🔄 转发数
- 💬 评论数
- 🔗 点击率

---

## 🎯 v0.1.0 截图计划

### 必做 (3 张)

1. **项目启动画面**
   - 显示 ClawXAI Logo/名称
   - 版本信息
   - 启动时间

2. **测试结果**
   - 5/5 测试通过
   - 绿色 ✅ 标记
   - 测试耗时

3. **隐私检测演示**
   - S3 级别检测 (SSH Key)
   - 路由决策显示
   - 本地处理提示

### 选做 (2 张)

4. **GitHub 仓库页面**
   - 完整的文件结构
   - 徽章展示
   - Commit 历史

5. **交互式对话**
   - 用户输入
   - AI 回复
   - 路由日志

---

**创建时间**: 2026-04-07  
**版本**: v0.1.0  
**下次更新**: v0.2.0 (Phase 2 完成)
