#!/usr/bin/env node
/**
 * 路由管线演示脚本
 * 
 * 展示并行执行和短路机制
 */

import { PrivacyRouter, TokenSaverRouter, RouterPipeline } from '../packages/router/src/index.ts';

async function demo(): Promise<void> {
  console.log('⚡ ClawXAI Router Pipeline Demo\n');
  console.log('='.repeat(70));
  console.log();

  // 创建路由器
  const privacyRouter = new PrivacyRouter();
  const tokenSaverRouter = new TokenSaverRouter();

  // 创建管线
  const pipeline = new RouterPipeline({
    routers: [privacyRouter, tokenSaverRouter],
    enableShortCircuit: true,
    enableParallel: true,
    timeout: 5000,
  });

  const testCases = [
    {
      name: 'Simple message (S1)',
      message: 'Hello, how are you?',
    },
    {
      name: 'Email detected (S2)',
      message: 'My email is test@example.com',
    },
    {
      name: 'SSH key detected (S3 - short circuit)',
      message: 'Here is my SSH private key: -----BEGIN RSA PRIVATE KEY-----',
    },
    {
      name: 'Complex question (S1 + COMPLEX)',
      message: 'I need to build a full-stack web application with React, Node.js, PostgreSQL, authentication, API endpoints, and database schema design. Can you help?',
    },
  ];

  console.log('🧪 Testing Router Pipeline:\n');
  console.log('Configuration:');
  console.log('  - Routers: PrivacyRouter, TokenSaverRouter');
  console.log('  - Parallel: true');
  console.log('  - Short-circuit: true');
  console.log('  - Timeout: 5000ms');
  console.log();
  console.log('='.repeat(70));
  console.log();

  for (const testCase of testCases) {
    console.log(`📝 Test: ${testCase.name}`);
    console.log(`   Message: "${testCase.message}"`);
    console.log();

    const result = await pipeline.execute({ message: testCase.message });

    console.log(`   Final Decision:`);
    console.log(`     Level: ${result.decision.level}`);
    console.log(`     Action: ${result.decision.action}`);
    console.log(`     Reason: ${result.decision.reason}`);
    if (result.decision.target) {
      console.log(`     Target: ${result.decision.target.provider}/${result.decision.target.model}`);
    }
    console.log();

    console.log(`   Router Results:`);
    for (const router of result.routers) {
      console.log(`     - ${router.id}: ${router.decision.level} (${router.duration}ms)`);
    }
    console.log();

    console.log(`   Performance:`);
    console.log(`     Total: ${result.totalDuration}ms`);
    console.log(`     Short-circuited: ${result.shortCircuited ? '✅ Yes' : '❌ No'}`);
    console.log();
    console.log('-'.repeat(70));
    console.log();
  }

  console.log('✨ Pipeline demo completed!\n');
}

demo().catch(console.error);
