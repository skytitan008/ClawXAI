#!/usr/bin/env node
/**
 * 隐私规则演示脚本
 * 
 * 展示 50+ 敏感词和 20+ 正则模式的检测能力
 */

import { PrivacyRouter } from '../packages/router/src/index.ts';

async function demo(): Promise<void> {
  console.log('🔒 ClawXAI Privacy Detection Demo\n');
  console.log('='.repeat(70));
  console.log();
  console.log('📊 Rule Statistics:');
  console.log('  S2 Keywords: 30+ (Sensitive - redact and forward)');
  console.log('  S3 Keywords: 25+ (Highly sensitive - local only)');
  console.log('  S2 Patterns: 12 (Regex patterns)');
  console.log('  S3 Patterns: 15 (Regex patterns)');
  console.log('  Total: 55+ keywords, 27+ patterns');
  console.log();
  console.log('='.repeat(70));
  console.log();

  const router = new PrivacyRouter();

  const testCases = [
    // S2 检测
    { message: 'My email is test@example.com', expected: 'S2' },
    { message: 'My phone is 13812345678', expected: 'S2' },
    { message: 'My QQ is 12345678', expected: 'S2' },
    { message: 'My name is John Doe', expected: 'S2' },
    { message: 'I live in Beijing, China', expected: 'S1' },
    { message: 'My birthday is 1990 年 1 月 1 日', expected: 'S2' },
    
    // S3 检测
    { message: 'My SSH private key is...', expected: 'S3' },
    { message: 'Here is my credit card: 4111111111111111', expected: 'S3' },
    { message: 'My AWS access key: AKIAIOSFODNN7EXAMPLE', expected: 'S3' },
    { message: 'GitHub token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', expected: 'S3' },
    { message: 'JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0', expected: 'S3' },
    
    // S1 (无敏感)
    { message: 'Hello, how are you?', expected: 'S1' },
    { message: 'What is the weather today?', expected: 'S1' },
    { message: 'Can you help me with coding?', expected: 'S1' },
  ];

  console.log('🧪 Testing Privacy Detection:\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const result = await router.detect({ message: testCase.message });
    const status = result.level === testCase.expected ? '✅' : '❌';
    
    if (result.level === testCase.expected) {
      passed++;
    } else {
      failed++;
    }

    console.log(`${status} "${testCase.message}"`);
    console.log(`   Expected: ${testCase.expected}, Got: ${result.level}`);
    console.log(`   Action: ${result.action}`);
    console.log(`   Reason: ${result.reason}`);
    console.log();
  }

  console.log('='.repeat(70));
  console.log(`\n📊 Results: ${passed}/${testCases.length} passed`);
  console.log(`   Accuracy: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!\n');
  } else {
    console.log(`\n⚠️  ${failed} tests failed.\n`);
  }
}

demo().catch(console.error);
