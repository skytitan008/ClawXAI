# 🦎 ClawXAI 融合开发计划 v2

**策略**: 以 EdgeClaw 为主体，逐步融合 Airi 和 PAI 的核心功能

---

## 📋 融合方法

### 方法 A: 直接复制代码 ✅

**适用**: 独立模块，不依赖框架

**步骤**:

1. 从 Airi/PAI 复制源代码
2. 适配 EdgeClaw 的插件系统
3. 创建 EdgeClaw 扩展包

### 方法 B: 参考实现 🔧

**适用**: 框架耦合度高的模块

**步骤**:

1. 分析 Airi/PAI 的核心逻辑
2. 在 EdgeClaw 中重新实现
3. 保持 API 兼容

---

## 🎯 第一阶段：Airi Live2D 集成

### 分析结果

**Airi Live2D 模块结构**:

```
airi/packages/stage-ui-live2d/
├── src/
│   ├── components/          # Vue 组件
│   │   └── scenes/
│   │       └── Live2D.vue   # 主渲染组件
│   ├── composables/         # Vue 组合式 API
│   │   └── live2d/
│   ├── constants/
│   │   └── emotions.ts      # 情感定义
│   ├── stores/
│   │   ├── live2d.ts        # Live2D 状态管理
│   │   └── expression-store.ts  # 表情管理
│   ├── tools/
│   │   └── expression-tools.ts  # 表情工具
│   └── utils/
│       ├── eye-motions.ts   # 眼部动作
│       ├── live2d-preview.ts
│       └── live2d-zip-loader.ts
```

**核心依赖**:

- PixiJS (渲染引擎)
- Vue 3 (UI 框架)
- Live2D Cubism SDK

### 融合策略

由于 Airi 的 Live2D 深度耦合 Vue，我们采用**方法 B - 参考实现**:

1. **创建独立的 Live2D 渲染服务** (不依赖 Vue)
2. **复用 PixiJS + Live2D SDK**
3. **创建 EdgeClaw 插件接口**

**目标结构**:

```
clawxai/extensions/airi-live2d/
├── package.json
├── index.ts              # 插件入口
├── src/
│   ├── renderer.ts       # Live2D 渲染器 (PixiJS)
│   ├── model-loader.ts   # 模型加载
│   ├── expression-engine.ts  # 表情引擎
│   ├── emotion-mapper.ts # 情感映射 (Airi → Live2D)
│   └── types.ts
└── assets/
    └── default-model/    # 默认 Live2D 模型
```

---

## 🎯 第二阶段：Airi 语音集成

### 分析结果

**Airi 语音模块**:

```
airi/packages/audio/
├── src/
│   ├── audio-context.ts
│   ├── audio-recorder.ts
│   └── audio-player.ts

airi/packages/audio-pipelines-transcribe/
├── src/
│   └── transcribe.ts     # 语音识别管道

airi/packages/pipelines-audio/
├── src/
│   ├── stt/              # STT 管道
│   └── tts/              # TTS 管道
```

### 融合策略

采用**方法 A - 直接复制**:

1. 复制音频处理核心代码
2. 适配 EdgeClaw 的插件系统
3. 集成现有的 STT/TTS 服务

**目标结构**:

```
clawxai/extensions/airi-voice/
├── package.json
├── index.ts
├── src/
│   ├── stt-engine.ts     # 语音识别
│   ├── tts-engine.ts     # 语音合成
│   ├── audio-processor.ts
│   └── voice-config.ts
└── providers/
    ├── elevenlabs.ts     # TTS 提供商
    ├── deepgram.ts       # STT 提供商
    └── openai.ts         # OpenAI Whisper
```

---

## 🎯 第三阶段：PAI 记忆集成

### 分析结果

**PAI 核心模块**:

```
pai/Packs/
├── Media/                # 媒体处理
├── ContentAnalysis/      # 内容分析
├── Thinking/             # 思考引擎
├── Utilities/            # 工具集
└── Agents/               # Agent 系统
```

### 融合策略

采用**方法 B - 参考实现**:

1. 分析 PAI 的记忆存储逻辑
2. 与 EdgeClaw 的 ClawXMemory 融合
3. 增强学习和检索功能

**目标结构**:

```
clawxai/extensions/pai-memory-enhanced/
├── package.json
├── index.ts
├── src/
│   ├── long-term-memory.ts   # 长期记忆
│   ├── knowledge-graph.ts    # 知识图谱
│   ├── learning-engine.ts    # 学习引擎
│   └── retrieval-system.ts   # 检索系统
└── integrations/
    └── clawxmemory-bridge.ts # 与 ClawXMemory 桥接
```

---

## 🚀 立即开始：创建 Airi Live2D 扩展

### Step 1: 创建扩展目录

```bash
cd clawxai/extensions
mkdir -p airi-live2d/src
mkdir -p airi-live2d/assets
```

### Step 2: 创建 package.json

```json
{
  "name": "@clawxai/airi-live2d",
  "version": "1.0.0",
  "type": "module",
  "main": "index.ts",
  "dependencies": {
    "pixi.js": "^8.0.0",
    "live2d-cubism-core": "^5.0.0"
  }
}
```

### Step 3: 创建核心渲染器

```typescript
// src/renderer.ts
import * as PIXI from "pixi.js";

export class Live2DRenderer {
  private app: PIXI.Application;
  private model: any;

  async init(canvas: HTMLCanvasElement) {
    this.app = new PIXI.Application({
      view: canvas,
      autoStart: true,
      resizeTo: window,
      transparent: true,
    });
  }

  async loadModel(modelPath: string) {
    // 加载 Live2D 模型
  }

  setExpression(expressionId: string) {
    // 设置表情
  }

  setEmotion(emotion: "happy" | "sad" | "angry" | "neutral") {
    // 根据情感切换表情
  }
}
```

### Step 4: 创建情感映射

```typescript
// src/emotion-mapper.ts
import { EmotionType } from "@clawxai/core";

export const emotionToExpression: Record<EmotionType, string> = {
  joy: "smile_01",
  sadness: "sad_01",
  anger: "angry_01",
  surprise: "surprised_01",
  fear: "worried_01",
  disgust: "disgusted_01",
  neutral: "neutral_01",
};
```

### Step 5: 创建插件入口

```typescript
// index.ts
import type { OpenClawPlugin } from "openclaw/plugin-sdk";
import { Live2DRenderer } from "./src/renderer.js";

const renderer = new Live2DRenderer();

export default {
  name: "@clawxai/airi-live2d",
  version: "1.0.0",

  async init(ctx) {
    // 注册 Dashboard 页面
    ctx.dashboard.registerPage("/live2d", "./assets/view.html");

    // 注册情感事件监听
    ctx.events.on("emotion:detected", (emotion) => {
      renderer.setEmotion(emotion);
    });
  },

  async shutdown() {
    renderer.dispose();
  },
} satisfies OpenClawPlugin;
```

---

## 📊 开发优先级

### P0 - 核心功能 (本周)

1. ✅ 创建扩展框架
2. ⏳ 实现基础 Live2D 渲染
3. ⏳ 情感映射系统
4. ⏳ Dashboard 集成

### P1 - 增强功能 (下周)

1. 语音集成
2. 表情动画
3. 模型自定义
4. 性能优化

### P2 - 完善功能 (后续)

1. 多模型支持
2. 高级情感表达
3. 用户交互
4. 移动端适配

---

## 🎯 成功标准

- [ ] Live2D 模型可在 Dashboard 中渲染
- [ ] 情感分析结果可触发表情变化
- [ ] 支持至少 3 个默认模型
- [ ] 性能稳定 (60 FPS)
- [ ] 文档完整

---

**开始融合开发！** 🚀
