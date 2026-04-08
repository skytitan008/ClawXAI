# 🦎 @clawxai/airi-live2d

**Live2D Virtual Avatar Integration for ClawXAI**

Inspired by [Airi](https://github.com/moeru-ai/airi)'s stage-ui-live2d module.

---

## ✨ Features

- **Emotion-Driven Expressions** - Automatically changes facial expressions based on detected emotions
- **7 Emotion Support** - Joy, Sadness, Anger, Surprise, Fear, Disgust, Neutral
- **Smooth Transitions** - Blended expression changes (150-500ms)
- **Dashboard Integration** - Interactive avatar view in ClawXAI Dashboard
- **API Control** - RESTful API for programmatic control
- **Auto Animations** - Blink and breath animations (when model supports)

---

## 📦 Installation

This extension is included in ClawXAI by default.

To enable:

1. Add to your `openclaw.json` config:

```json
{
  "extensions": {
    "@clawxai/airi-live2d": {
      "enabled": true,
      "model": {
        "id": "default",
        "path": "./extensions/airi-live2d/assets/default-model"
      }
    }
  }
}
```

2. Restart EdgeClaw/ClawXAI

---

## 🎮 Usage

### Dashboard

Access the avatar control panel at: `http://localhost:19000/avatar`

Features:

- Live model preview
- Emotion testing buttons
- Real-time status display

### API

#### Get Model Status

```bash
GET /api/live2d/model
```

Response:

```json
{
  "success": true,
  "data": {
    "initialized": true,
    "hasModel": true,
    "currentExpression": "neutral"
  }
}
```

#### Load Model

```bash
POST /api/live2d/model
Content-Type: application/json

{
  "modelId": "default",
  "modelPath": "./assets/default-model"
}
```

#### Set Expression

```bash
POST /api/live2d/expression
Content-Type: application/json

{
  "expressionId": "exp_01"
}
```

#### Set Emotion

```bash
POST /api/live2d/emotion
Content-Type: application/json

{
  "emotion": "joy"
}
```

### Events

Listen for emotion events:

```javascript
ctx.events.on("emotion:detected", (data) => {
  // data.emotion: 'joy' | 'sadness' | 'anger' | ...
  // data.intensity: 0.0 - 1.0
});
```

---

## 🎭 Emotions

| Emotion  | Expression File | Blend Time |
| -------- | --------------- | ---------- |
| Neutral  | exp_00.exp.json | 400ms      |
| Joy      | exp_01.exp.json | 300ms      |
| Sadness  | exp_02.exp.json | 500ms      |
| Anger    | exp_03.exp.json | 200ms      |
| Surprise | exp_04.exp.json | 150ms      |
| Fear     | exp_05.exp.json | 250ms      |
| Disgust  | exp_06.exp.json | 300ms      |

---

## 📁 Model Structure

To add custom Live2D models:

```
assets/your-model/
├── model.moc3              # Live2D model file
├── model.cdi3.json         # Model metadata
├── physics.json            # Physics settings
├── pose.json               # Pose settings
├── textures/
│   └── texture_00.png      # Model textures
└── expressions/
    ├── exp_00.exp.json     # Neutral
    ├── exp_01.exp.json     # Joy
    ├── exp_02.exp.json     # Sadness
    └── ...
```

---

## 🔧 Development

### Build

```bash
cd extensions/airi-live2d
pnpm install
pnpm build
```

### Type Check

```bash
pnpm typecheck
```

### Dependencies

- `pixi.js` ^8.6.6 - Rendering engine
- `live2d-cubism-core` ^5.0.0 - Live2D SDK (optional, for full features)

---

## 🎯 Roadmap

### v1.0.0 (Current)

- ✅ Basic Live2D rendering
- ✅ Emotion mapping
- ✅ Dashboard integration
- ✅ API endpoints

### v1.1.0 (Next)

- [ ] Full PixiJS + Live2D integration
- [ ] Auto blink animation
- [ ] Auto breath animation
- [ ] Mouth sync for voice

### v1.2.0

- [ ] Multiple model support
- [ ] Model switching UI
- [ ] Custom expression editor
- [ ] Motion blending

### v2.0.0

- [ ] 3D model support (Three.js)
- [ ] VRM avatar support
- [ ] Advanced physics
- [ ] Real-time lip sync

---

## 📚 References

- [Airi Project](https://github.com/moeru-ai/airi) - Original Live2D implementation
- [PixiJS](https://pixijs.com/) - Rendering engine
- [Live2D Cubism](https://www.live2d.com/en/) - 2D animation technology

---

## 📄 License

MIT License - See LICENSE file for details.

---

**Made with ❤️ by the ClawXAI Team**
