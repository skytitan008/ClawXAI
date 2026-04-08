/**
 * Live2D Emotion Types
 * Mapped from ClawXAI Core emotion system
 */

export type EmotionType = "joy" | "sadness" | "anger" | "surprise" | "fear" | "disgust" | "neutral";

export interface Live2DExpression {
  id: string;
  name: string;
  emotion: EmotionType;
  file: string; // Path to expression file
  blendTime?: number; // Blend time in ms
}

export interface Live2DModel {
  id: string;
  name: string;
  path: string; // Path to model directory
  expressions: Live2DExpression[];
  idleMotion?: string; // Idle motion file
}

export interface Live2DConfig {
  model: Live2DModel;
  autoBlink: boolean;
  autoBreath: boolean;
  eyeTracking: boolean;
  mouthSync: boolean; // For voice sync
}

export interface EmotionIntensity {
  emotion: EmotionType;
  intensity: number; // 0.0 - 1.0
}
