/**
 * Live2D Renderer - Complete Implementation
 *
 * Core rendering engine using PixiJS + pixi-live2d-display
 * Full implementation inspired by Airi's stage-ui-live2d
 */

import * as PIXI from "pixi.js";
import { getExpressionForEmotion, getBlendTimeForEmotion } from "./emotion-mapper.js";
import type { Live2DModel, Live2DConfig, EmotionType } from "./types.js";

// Dynamic import for pixi-live2d-display (optional dependency)
let Live2DModelClass: any = null;

async function loadLive2DDisplay() {
  if (!Live2DModelClass) {
    try {
      const module = await import("pixi-live2d-display");
      Live2DModelClass = module.Live2DModel;
      console.log("[Live2DRenderer] pixi-live2d-display loaded successfully");
    } catch (error) {
      console.warn("[Live2DRenderer] pixi-live2d-display not available, using mock mode");
      Live2DModelClass = null;
    }
  }
  return Live2DModelClass;
}

export class Live2DRenderer {
  private app: PIXI.Application | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private model: any = null;
  private currentExpression: string = "neutral";
  private config: Live2DConfig | null = null;
  private isInitialized: boolean = false;
  private isMockMode: boolean = false;
  private expressionHistory: Map<string, number> = new Map();

  /**
   * Initialize the Live2D renderer
   */
  async init(canvasElement: HTMLCanvasElement): Promise<void> {
    this.canvas = canvasElement;

    try {
      this.app = new PIXI.Application({
        view: canvasElement,
        autoStart: true,
        resizeTo: canvasElement.parentElement || window,
        transparent: true,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
      });

      await this.app.start();

      // Try to load Live2D display library
      await loadLive2DDisplay();

      if (!Live2DModelClass) {
        this.isMockMode = true;
        console.log("[Live2DRenderer] Running in mock mode (no Live2D library)");
        this.setupMockDisplay();
      }

      this.isInitialized = true;
      console.log("[Live2DRenderer] Initialized successfully", {
        mockMode: this.isMockMode,
        hasLive2D: !!Live2DModelClass,
      });
    } catch (error) {
      console.error("[Live2DRenderer] Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Setup mock display for development without Live2D models
   */
  private setupMockDisplay() {
    if (!this.app) return;

    // Create a simple visual indicator for mock mode
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x667eea, 0.3);
    graphics.drawCircle(0, 0, 100);
    graphics.endFill();
    graphics.x = this.app.screen.width / 2;
    graphics.y = this.app.screen.height / 2;

    // Add text
    const text = new PIXI.Text("Live2D\nMock Mode", {
      fontFamily: "Arial",
      fontSize: 24,
      fill: 0xffffff,
      align: "center",
    });
    text.anchor.set(0.5);
    text.x = this.app.screen.width / 2;
    text.y = this.app.screen.height / 2;

    this.app.stage.addChild(graphics);
    this.app.stage.addChild(text);

    // Store for cleanup
    (this.app.stage as any).__mockGraphics = graphics;
    (this.app.stage as any).__mockText = text;
  }

  /**
   * Update mock display based on emotion
   */
  private updateMockDisplay(emotion: EmotionType) {
    if (!this.app || !this.isMockMode) return;

    const graphics = (this.app.stage as any).__mockGraphics;
    const text = (this.app.stage as any).__mockText;

    if (!graphics || !text) return;

    // Change color based on emotion
    const emotionColors: Record<EmotionType, number> = {
      joy: 0xffd700, // Gold
      sadness: 0x4169e1, // Royal Blue
      anger: 0xff4500, // Orange Red
      surprise: 0xff69b4, // Hot Pink
      fear: 0x8b0000, // Dark Red
      disgust: 0x228b22, // Forest Green
      neutral: 0x667eea, // Purple
    };

    graphics.clear();
    graphics.beginFill(emotionColors[emotion], 0.5);
    graphics.drawCircle(0, 0, 100 + (emotion === "joy" ? 20 : 0));
    graphics.endFill();

    text.text = `Live2D\n${emotion.toUpperCase()}\n(Mock)`;
  }

  /**
   * Load a Live2D model
   */
  async loadModel(modelConfig: Live2DModel): Promise<void> {
    if (!this.app) {
      throw new Error("Renderer not initialized");
    }

    try {
      console.log("[Live2DRenderer] Loading model:", modelConfig.name);

      if (this.isMockMode || !Live2DModelClass) {
        // Mock mode - just store config
        this.config = {
          model: modelConfig,
          autoBlink: true,
          autoBreath: true,
          eyeTracking: true,
          mouthSync: false,
        };
        console.log("[Live2DRenderer] Model loaded (mock mode):", modelConfig.name);
        return;
      }

      // Real Live2D model loading
      // Clear existing model
      if (this.model) {
        this.app.stage.removeChild(this.model);
        this.model.destroy();
        this.model = null;
      }

      // Load new model
      this.model = await Live2DModelClass.from(modelConfig.path);

      // Scale and position model
      const scaleX = (this.app.screen.width * 0.8) / this.model.width;
      const scaleY = (this.app.screen.height * 0.8) / this.model.height;
      const scale = Math.min(scaleX, scaleY);

      this.model.scale.set(scale);
      this.model.x = this.app.screen.width / 2;
      this.model.y = this.app.screen.height / 2;
      this.model.anchor.set(0.5, 0.5);

      // Enable interactions
      this.model.interactive = true;
      this.model.buttonMode = true;

      // Add to stage
      this.app.stage.addChild(this.model);

      // Setup config
      this.config = {
        model: modelConfig,
        autoBlink: true,
        autoBreath: true,
        eyeTracking: true,
        mouthSync: false,
      };

      // Setup auto animations
      this.setupAutoAnimations();

      console.log("[Live2DRenderer] Model loaded successfully:", modelConfig.name);
    } catch (error) {
      console.error("[Live2DRenderer] Failed to load model:", error);
      // Fallback to mock mode
      this.isMockMode = true;
      this.config = {
        model: modelConfig,
        autoBlink: true,
        autoBreath: true,
        eyeTracking: true,
        mouthSync: false,
      };
      throw error;
    }
  }

  /**
   * Setup automatic animations (blink, breath)
   */
  private setupAutoAnimations() {
    if (!this.model || !this.config) return;

    // Enable auto blink
    if (this.config.autoBlink && this.model.internalModel) {
      this.model.internalModel.coreModel.setParameterValue("ParamEyeLOpen", 1);
      this.model.internalModel.coreModel.setParameterValue("ParamEyeROpen", 1);
    }

    // Setup tick for animations
    this.app!.ticker.add((delta) => {
      if (this.model && this.config?.autoBreath) {
        // Simple breath animation
        const time = Date.now() / 1000;
        const breath = Math.sin(time) * 0.1 + 1;
        this.model.scale.y = this.model.scale.x * breath;
      }
    });
  }

  /**
   * Set the current expression
   */
  async setExpression(expressionId: string): Promise<void> {
    if (!this.model) {
      console.warn("[Live2DRenderer] No model loaded");
      return;
    }

    const blendTime = 300;

    console.log("[Live2DRenderer] Setting expression:", expressionId);

    if (this.isMockMode || !this.model.internalModel) {
      // Mock mode - just update state
      this.currentExpression = expressionId;
      console.log("[Live2DRenderer] Expression set (mock):", expressionId);
      return;
    }

    try {
      // Real Live2D expression
      await this.model.expression(expressionId);
      this.currentExpression = expressionId;

      // Track expression usage
      const count = this.expressionHistory.get(expressionId) || 0;
      this.expressionHistory.set(expressionId, count + 1);

      console.log("[Live2DRenderer] Expression set:", expressionId);
    } catch (error) {
      console.error("[Live2DRenderer] Failed to set expression:", error);
      throw error;
    }
  }

  /**
   * Set emotion (automatically maps to expression)
   */
  async setEmotion(emotion: EmotionType): Promise<void> {
    const expressionFile = getExpressionForEmotion(emotion);
    const expressionId = expressionFile.replace(".exp.json", "");

    console.log("[Live2DRenderer] Setting emotion:", emotion, "->", expressionId);

    if (this.isMockMode) {
      this.updateMockDisplay(emotion);
    }

    await this.setExpression(expressionId);
    this.currentExpression = emotion;
  }

  /**
   * Set emotion with intensity
   */
  async setEmotionWithIntensity(emotion: EmotionType, intensity: number): Promise<void> {
    console.log("[Live2DRenderer] Emotion with intensity:", emotion, intensity);

    if (intensity < 0.3) {
      // Too weak, ignore
      return;
    }

    await this.setEmotion(emotion);
  }

  /**
   * Update model parameters (for animations)
   */
  update(delta: number): void {
    if (!this.model || !this.config) return;

    // In production with real Live2D:
    // this.model.update(delta);
  }

  /**
   * Enable/disable mouth sync for voice
   */
  setMouthSync(enabled: boolean): void {
    if (this.config) {
      this.config.mouthSync = enabled;
      console.log("[Live2DRenderer] Mouth sync:", enabled ? "enabled" : "disabled");

      if (this.model && this.model.internalModel) {
        // Would setup mouth movement based on audio input
      }
    }
  }

  /**
   * Sync mouth with audio amplitude
   */
  syncMouthWithAudio(amplitude: number): void {
    if (!this.config?.mouthSync || !this.model) return;

    // Map amplitude to mouth open parameter
    const mouthOpen = Math.min(1, amplitude / 100);

    if (this.model.internalModel) {
      this.model.internalModel.coreModel.setParameterValue("ParamMouthOpenY", mouthOpen);
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      initialized: this.isInitialized,
      hasModel: !!this.model,
      currentExpression: this.currentExpression,
      isMockMode: this.isMockMode,
      hasLive2DLibrary: !!Live2DModelClass,
      config: this.config,
      expressionHistory: Object.fromEntries(this.expressionHistory),
    };
  }

  /**
   * Get expression statistics
   */
  getExpressionStats() {
    return {
      total: Array.from(this.expressionHistory.values()).reduce((a, b) => a + b, 0),
      byExpression: Object.fromEntries(this.expressionHistory),
      mostUsed:
        Array.from(this.expressionHistory.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "none",
    };
  }

  /**
   * Cleanup and dispose
   */
  async dispose(): Promise<void> {
    console.log("[Live2DRenderer] Disposing...");

    if (this.model) {
      if (this.app && this.model.parent) {
        this.app.stage.removeChild(this.model);
      }
      this.model.destroy();
      this.model = null;
    }

    if (this.app) {
      await this.app.destroy(true, { children: true, texture: true, baseTexture: true });
      this.app = null;
    }

    this.isInitialized = false;
    this.expressionHistory.clear();

    console.log("[Live2DRenderer] Disposed successfully");
  }
}

// Singleton instance
export const live2DRenderer = new Live2DRenderer();
