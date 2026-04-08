# 🎤 @clawxai/airi-voice

**Voice Integration for ClawXAI**

Speech-to-Text (STT) and Text-to-Speech (TTS) with multi-provider support.

Inspired by [Airi](https://github.com/moeru-ai/airi)'s audio modules.

---

## ✨ Features

### Speech-to-Text (STT)

- **Multi-Provider Support**: Whisper, Deepgram, Google, Azure
- **Streaming Transcription**: Real-time speech recognition
- **Multi-Language**: 100+ languages supported
- **Confidence Scoring**: Accuracy metrics for transcripts
- **Mock Mode**: Test without API keys

### Text-to-Speech (TTS)

- **Multi-Provider Support**: ElevenLabs, Google, Azure
- **Voice Selection**: Multiple voice options per provider
- **Speed & Pitch Control**: Customize speech characteristics
- **Audio Caching**: Cache generated speech for efficiency
- **Mock Mode**: Test without API keys

### Voice Commands

- **Hands-free Control**: Voice-activated commands
- **Custom Triggers**: Define custom wake words
- **Integration**: Works with ClawXAI event system

---

## 📦 Installation

This extension is included in ClawXAI by default.

To enable:

1. Add to your `openclaw.json` config:

```json
{
  "plugins": {
    "allow": ["@clawxai/airi-voice"],
    "entries": {
      "@clawxai/airi-voice": {
        "enabled": true,
        "config": {
          "stt": {
            "provider": "whisper",
            "apiKey": "your-api-key",
            "language": "zh-CN"
          },
          "tts": {
            "provider": "elevenlabs",
            "apiKey": "your-api-key",
            "voice": "default"
          },
          "autoTranscribe": true,
          "autoSpeak": false
        }
      }
    }
  }
}
```

2. Restart gateway:

```bash
systemctl --user restart openclaw-gateway
```

---

## 🎮 Usage

### Dashboard

Access the voice control panel:

```
http://localhost:18112/voice
```

Features:

- 🎙️ Start/Stop recording
- 🔊 Test TTS
- ⚙️ Configure providers
- 📝 View transcripts

### API Endpoints

#### STT (Speech-to-Text)

```bash
# Start recording
POST /api/voice/stt/start
Response: { "recordingId": "..." }

# Stop recording and transcribe
POST /api/voice/stt/stop
Response: {
  "transcript": "Hello world",
  "confidence": 0.95,
  "language": "zh-CN"
}

# Upload audio file
POST /api/voice/stt/transcribe
Content-Type: multipart/form-data
Body: { audio: File }
```

#### TTS (Text-to-Speech)

```bash
# Generate speech
POST /api/voice/tts/speak
Body: {
  "text": "Hello world",
  "voice": "default",
  "speed": 1.0
}
Response: { "audioUrl": "..." }

# List available voices
GET /api/voice/tts/voices
Response: [{ "id": "voice1", "name": "Voice 1" }]
```

#### Configuration

```bash
# Get current config
GET /api/voice/config

# Update config
POST /api/voice/config
Body: {
  "stt": { "provider": "whisper" },
  "tts": { "provider": "elevenlabs" }
}

# Get status
GET /api/voice/status
```

---

## ⚙️ Configuration

### STT Providers

| Provider     | Cost | Quality   | Languages | Setup         |
| ------------ | ---- | --------- | --------- | ------------- |
| **Mock**     | Free | N/A       | All       | None          |
| **Whisper**  | Free | High      | 100+      | Local install |
| **Deepgram** | Paid | Very High | 30+       | API key       |
| **Google**   | Paid | High      | 125+      | API key       |
| **Azure**    | Paid | High      | 100+      | API key       |

### TTS Providers

| Provider       | Cost | Quality   | Voices | Setup   |
| -------------- | ---- | --------- | ------ | ------- |
| **Mock**       | Free | N/A       | 1      | None    |
| **ElevenLabs** | Paid | Excellent | 20+    | API key |
| **Google**     | Paid | Good      | 100+   | API key |
| **Azure**      | Paid | Very Good | 400+   | API key |

---

## 🔧 Development

### Local Development

```bash
cd extensions/airi-voice
pnpm install
pnpm build
pnpm typecheck
```

### Testing

```bash
# Test STT
node demo-stt.mjs

# Test TTS
node demo-tts.mjs

# Test full integration
node demo.mjs
```

---

## 📊 Events

The voice system emits the following events:

```typescript
// Voice recording started
{ type: 'voice:started', timestamp: number }

// Voice recording stopped
{ type: 'voice:stopped', timestamp: number }

// Transcript ready
{
  type: 'transcript:ready',
  transcript: string,
  confidence: number,
  language: string
}

// Speech generated
{
  type: 'speech:generated',
  text: string,
  audioUrl: string,
  duration: number
}
```

---

## 🐛 Troubleshooting

### Issue: No audio input

**Solution**: Check browser microphone permissions

### Issue: API errors

**Solution**: Verify API keys in configuration

### Issue: Mock mode always active

**Solution**: Set provider to non-mock value and add API key

### Issue: Voice not heard

**Solution**: Check browser audio output and volume

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Inspired by [Airi](https://github.com/moeru-ai/airi) audio modules
- Built on [OpenClaw/EdgeClaw](https://github.com/OpenBMB/EdgeClaw) plugin system
