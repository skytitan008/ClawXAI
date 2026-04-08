/**
 * @clawxai/airi-voice
 *
 * Voice integration for ClawXAI
 * STT (Speech-to-Text) and TTS (Text-to-Speech)
 *
 * @packageDocumentation
 */

import type { OpenClawPlugin } from "openclaw/plugin-sdk";
import { STTEngine, sttEngine } from "./src/stt-engine.js";
import { TTSEngine, ttsEngine } from "./src/tts-engine.js";
import type { VoiceEvent } from "./src/types.js";

/**
 * Voice Plugin for OpenClaw/EdgeClaw
 *
 * Features:
 * - Speech-to-Text (STT) - Multiple providers
 * - Text-to-Speech (TTS) - Multiple providers
 * - Voice commands
 * - Audio transcription
 */
export default {
  name: "@clawxai/airi-voice",
  version: "1.0.0",
  description: "Speech-to-Text and Text-to-Speech integration",

  /**
   * Initialize the plugin
   */
  async init(ctx) {
    console.log("[Airi Voice] Initializing...");

    // Register dashboard page
    if (ctx.dashboard) {
      ctx.dashboard.registerPage("/voice", "./assets/voice-control.html", {
        title: "Voice Control",
        icon: "mic",
      });
    }

    // Listen for voice events
    if (ctx.events) {
      ctx.events.on("voice:start", handleVoiceStart);
      ctx.events.on("voice:stop", handleVoiceStop);
    }

    // Register API endpoints
    if (ctx.api) {
      ctx.api.register("/voice/stt", {
        GET: getSTTStatus,
        POST: transcribeAudio,
      });

      ctx.api.register("/voice/tts", {
        POST: generateSpeech,
      });

      ctx.api.register("/voice/voices", {
        GET: getAvailableVoices,
      });

      ctx.api.register("/voice/config", {
        GET: getConfig,
        POST: updateConfig,
      });
    }

    // Register voice commands
    if (ctx.commands) {
      ctx.commands.register("speak", handleSpeakCommand);
      ctx.commands.register("transcribe", handleTranscribeCommand);
    }

    console.log("[Airi Voice] Initialized successfully");
  },

  /**
   * Shutdown the plugin
   */
  async shutdown() {
    console.log("[Airi Voice] Shutting down...");
    console.log("[Airi Voice] Shutdown complete");
  },

  /**
   * Plugin metadata
   */
  metadata: {
    author: "ClawXAI Team",
    license: "MIT",
    repository: "https://github.com/skytitan008/ClawXAI",
    dependencies: ["@clawxai/core"],
    capabilities: ["dashboard", "events", "api", "commands"],
  },
} satisfies OpenClawPlugin;

// Event handlers
async function handleVoiceStart(data: any) {
  console.log("[Airi Voice] Voice start event:", data);
  sttEngine.startRecording().catch(console.error);
}

async function handleVoiceStop(data: any) {
  console.log("[Airi Voice] Voice stop event:", data);
  try {
    const result = await sttEngine.stopRecording();

    // Emit transcript event
    const event: VoiceEvent = {
      type: "transcript",
      data: result,
      timestamp: Date.now(),
    };

    console.log("[Airi Voice] Transcript:", result.fullText);
  } catch (error) {
    console.error("[Airi Voice] Transcription failed:", error);
  }
}

// API handlers
async function getSTTStatus() {
  return {
    success: true,
    data: {
      recording: sttEngine.isCurrentlyRecording(),
      config: sttEngine.getConfig(),
    },
  };
}

async function transcribeAudio(request: Request) {
  try {
    const body = await request.json();
    const { audioData } = body;

    // Convert base64 to buffer
    const audioBuffer = audioData ? Buffer.from(audioData, "base64") : undefined;

    const result = await sttEngine.transcribe(audioBuffer);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function generateSpeech(request: Request) {
  try {
    const body = await request.json();
    const { text, voice, speed } = body;

    const result = await ttsEngine.speak(text, { voice, speed });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function getAvailableVoices() {
  const voices = await ttsEngine.getAvailableVoices();

  return {
    success: true,
    data: {
      currentProvider: ttsEngine.getConfig().provider,
      voices,
    },
  };
}

async function getConfig() {
  return {
    success: true,
    data: {
      stt: sttEngine.getConfig(),
      tts: ttsEngine.getConfig(),
    },
  };
}

async function updateConfig(request: Request) {
  try {
    const body = await request.json();
    const { stt, tts } = body;

    if (stt) {
      sttEngine.updateConfig(stt);
    }

    if (tts) {
      ttsEngine.updateConfig(tts);
    }

    return {
      success: true,
      message: "Config updated",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Command handlers
async function handleSpeakCommand(args: string[]) {
  const text = args.join(" ");

  if (!text) {
    return {
      success: false,
      error: "No text provided",
    };
  }

  try {
    await ttsEngine.speakAndPlay(text);

    return {
      success: true,
      message: "Speaking: " + text,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function handleTranscribeCommand(args: string[]) {
  try {
    await sttEngine.startRecording();

    return {
      success: true,
      message: "Recording started... Say something!",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
