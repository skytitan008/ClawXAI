/**
 * @clawxai/airi-live2d
 *
 * Live2D virtual avatar integration for ClawXAI
 * Inspired by Airi's stage-ui-live2d
 *
 * @packageDocumentation
 */

import type { OpenClawPlugin } from "openclaw/plugin-sdk";
import { Live2DRenderer } from "./src/renderer.js";
import type { EmotionType } from "./src/types.js";

const renderer = new Live2DRenderer();

/**
 * Live2D Plugin for OpenClaw/EdgeClaw
 *
 * Features:
 * - Emotion-driven facial expressions
 * - Auto blink and breath
 * - Voice lip sync (when enabled)
 * - Dashboard integration
 */
export default {
  name: "@clawxai/airi-live2d",
  version: "1.0.0",
  description: "Live2D virtual avatar with emotion-driven expressions",

  /**
   * Initialize the plugin
   */
  async init(ctx) {
    console.log("[Airi Live2D] Initializing...");

    // Register dashboard page
    if (ctx.dashboard) {
      ctx.dashboard.registerPage("/avatar", "./assets/avatar-view.html", {
        title: "Virtual Avatar",
        icon: "face",
      });
    }

    // Listen for emotion events from core
    if (ctx.events) {
      ctx.events.on("emotion:detected", handleEmotionDetected);
      ctx.events.on("message:received", handleMessageReceived);
    }

    // Register API endpoints
    if (ctx.api) {
      ctx.api.register("/live2d/model", {
        GET: getModelInfo,
        POST: loadModel,
      });

      ctx.api.register("/live2d/expression", {
        POST: setExpression,
      });

      ctx.api.register("/live2d/emotion", {
        POST: setEmotion,
      });
    }

    console.log("[Airi Live2D] Initialized successfully");
  },

  /**
   * Shutdown the plugin
   */
  async shutdown() {
    console.log("[Airi Live2D] Shutting down...");

    await renderer.dispose();

    console.log("[Airi Live2D] Shutdown complete");
  },

  /**
   * Plugin metadata
   */
  metadata: {
    author: "ClawXAI Team",
    license: "MIT",
    repository: "https://github.com/skytitan008/ClawXAI",
    dependencies: ["@clawxai/core"],
    capabilities: ["dashboard", "events", "api"],
  },
} satisfies OpenClawPlugin;

// Event handlers
async function handleEmotionDetected(data: { emotion: EmotionType; intensity: number }) {
  console.log("[Airi Live2D] Emotion detected:", data);

  if (data.intensity >= 0.3) {
    await renderer.setEmotion(data.emotion);
  }
}

async function handleMessageReceived(data: any) {
  // Could analyze message for emotion if not already detected
  // For now, just log
  console.log("[Airi Live2D] Message received");
}

// API handlers
async function getModelInfo() {
  const state = renderer.getState();
  return {
    success: true,
    data: state,
  };
}

async function loadModel(request: Request) {
  try {
    const body = await request.json();
    const { modelId, modelPath } = body;

    // Placeholder - would load actual model
    console.log("[Airi Live2D] Load model request:", modelId);

    return {
      success: true,
      message: "Model loaded",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function setExpression(request: Request) {
  try {
    const body = await request.json();
    const { expressionId } = body;

    await renderer.setExpression(expressionId);

    return {
      success: true,
      expression: expressionId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function setEmotion(request: Request) {
  try {
    const body = await request.json();
    const { emotion } = body;

    await renderer.setEmotion(emotion as EmotionType);

    return {
      success: true,
      emotion,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
