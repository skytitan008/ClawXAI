#!/usr/bin/env node
/**
 * LLM-as-Judge 演示脚本
 * 
 * 展示 LLM 复杂度判断功能
 */

import { createLLMJudge } from '../packages/router/src/llm-judge';

async function demo(): Promise<void> {
  console.log('🧠 ClawXAI LLM-as-Judge Demo\n');
  console.log('='.repeat(60));
  console.log();

  const judge = createLLMJudge({
    endpoint: 'http://localhost:11434',
    model: 'minicpm:latest',
    enableCache: true,
    cacheTTL: 5 * 60 * 1000, // 5 分钟
  });

  const examples = [
    '你好',
    'How are you?',
    '请解释一下量子计算的基本原理',
    'Write a Python function to sort a list',
    'If x + y = 10 and x - y = 4, what are x and y?',
    'Build a full-stack web application with React, Node.js, and MongoDB including authentication, API endpoints, and database schema design',
  ];

  console.log('📝 Testing messages:\n');

  for (const message of examples) {
    console.log(`Message: "${message}"`);
    
    const result = await judge.judge(message);
    
    console.log(`  Complexity: ${result.complexity}`);
    console.log(`  Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`  Source: ${result.source}`);
    console.log(`  Reasoning: ${result.reasoning}`);
    console.log();
  }

  // 缓存统计
  const stats = judge.getCacheStats();
  console.log('💾 Cache Statistics:');
  console.log(`  Total entries: ${stats.size}`);
  console.log(`  Valid entries: ${stats.entries}`);
  console.log();

  // 测试缓存
  console.log('🔄 Testing cache (same message twice)...\n');
  
  const testMessage = 'What is machine learning?';
  console.log(`First call: "${testMessage}"`);
  const result1 = await judge.judge(testMessage);
  console.log(`  Result: ${result1.complexity} (${result1.source})`);
  
  console.log(`\nSecond call: "${testMessage}"`);
  const result2 = await judge.judge(testMessage);
  console.log(`  Result: ${result2.complexity} (${result2.source})`);
  
  if (result2.source === 'cache') {
    console.log('\n✅ Cache working correctly!');
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✨ Demo completed!\n');
}

demo().catch(console.error);
