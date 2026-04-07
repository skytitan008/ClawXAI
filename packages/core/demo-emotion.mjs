#!/usr/bin/env node

/**
 * 情感分析演示 - 用于截图
 */

import { createEmotionAnalyzer } from './dist/index.js';

const analyzer = createEmotionAnalyzer();

console.log('😊 ClawXAI Emotion Analysis Demo\n');
console.log('=' .repeat(50));

const tests = [
  { text: '我太开心了！😂', expected: 'joy' },
  { text: '今天好难过...😢', expected: 'sadness' },
  { text: '气死我了！😡', expected: 'anger' },
  { text: '好害怕啊😨', expected: 'fear' },
  { text: '哇！真的吗？！😱', expected: 'surprise' },
  { text: '好恶心🤢', expected: 'disgust' },
  { text: '你好，请问...', expected: 'neutral' },
];

for (const { text, expected } of tests) {
  const result = analyzer.analyze(text);
  const response = analyzer.getSuggestedResponse(result.primary, result.intensity);
  const color = analyzer.getColor(result.primary);
  
  console.log(`\n"${text}"`);
  console.log(`  Primary: ${result.primary.toUpperCase()} ${expected === result.primary ? '✅' : '❌'}`);
  console.log(`  Intensity: ${(result.intensity * 100).toFixed(0)}%`);
  console.log(`  Color: ${color}`);
  console.log(`  Response: ${response}`);
}

console.log('\n' + '='.repeat(50));
console.log('✅ Emotion Analysis Complete!\n');
