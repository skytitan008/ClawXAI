/**
 * Emotion to Live2D Expression Mapper
 *
 * Maps ClawXAI core emotions to Live2D expressions
 * Based on Airi's emotion system
 */

import type { EmotionType, Live2DExpression } from "./types.js";

/**
 * Default expression mapping
 * Each emotion maps to a Live2D expression file
 */
export const emotionToExpressionMap: Record<EmotionType, string> = {
  joy: "exp_01.exp.json", // Smile
  sadness: "exp_02.exp.json", // Sad
  anger: "exp_03.exp.json", // Angry
  surprise: "exp_04.exp.json", // Surprised
  fear: "exp_05.exp.json", // Worried
  disgust: "exp_06.exp.json", // Disgusted
  neutral: "exp_00.exp.json", // Neutral
};

/**
 * Emotion intensity thresholds
 * Determines when to trigger expression changes
 */
export const emotionThresholds = {
  min: 0.3, // Minimum intensity to trigger expression
  high: 0.7, // High intensity triggers stronger expression
};

/**
 * Blend times for smooth transitions (in ms)
 */
export const blendTimes: Record<EmotionType, number> = {
  joy: 300,
  sadness: 500,
  anger: 200,
  surprise: 150,
  fear: 250,
  disgust: 300,
  neutral: 400,
};

/**
 * Get expression file for emotion
 */
export function getExpressionForEmotion(emotion: EmotionType): string {
  return emotionToExpressionMap[emotion] || emotionToExpressionMap.neutral;
}

/**
 * Get blend time for emotion
 */
export function getBlendTimeForEmotion(emotion: EmotionType): number {
  return blendTimes[emotion] || 300;
}

/**
 * Calculate target expression based on emotion intensities
 */
export function calculateTargetExpression(
  emotions: Array<{ type: EmotionType; intensity: number }>,
): EmotionType {
  if (emotions.length === 0) {
    return "neutral";
  }

  // Find dominant emotion above threshold
  const dominant = emotions
    .filter((e) => e.intensity >= emotionThresholds.min)
    .sort((a, b) => b.intensity - a.intensity)[0];

  return dominant?.type || "neutral";
}

/**
 * Airi emotion keywords mapping (for reference)
 * Original Airi uses Chinese keywords for emotion detection
 */
export const airiEmotionKeywords = {
  joy: ["开心", "高兴", "快乐", "笑", "哈哈", "嘻嘻", "😊", "😄", "😂"],
  sadness: ["难过", "伤心", "哭", "悲伤", "😢", "😭", "😞"],
  anger: ["生气", "愤怒", "烦", "讨厌", "😠", "😡", "🤬"],
  surprise: ["惊讶", "哇", "啊", "咦", "😮", "😯", "😲"],
  fear: ["害怕", "恐惧", "担心", "紧张", "😨", "😰", "😱"],
  disgust: ["恶心", "讨厌", "呸", "🤮", "🤢"],
  neutral: [],
};
