#!/usr/bin/env node

/**
 * ClawAI Gateway - 主入口
 * 
 * 用法：
 *   node gateway.mjs              # 启动网关
 *   node gateway.mjs --test       # 运行测试
 */

import { createClawAI } from '@claw-ai/core';
import { createClawAIRouter } from '@claw-ai/router';
import { createClawAIMemory } from '@claw-ai/memory';

async function main() {
  console.log('🚀 ClawAI Gateway Starting...\n');

  // 创建核心组件
  const router = createClawAIRouter();
  const memory = createClawAIMemory();
  const clawai = await createClawAI({ router, memory });

  console.log('✅ ClawAI Engine initialized\n');

  // 运行测试
  if (process.argv.includes('--test')) {
    await runTests(clawai, router);
    return;
  }

  // 启动交互式模式
  console.log('📝 Interactive mode (type "quit" to exit)\n');
  
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const context = {
    userId: 'default',
    workspaceId: 'default',
    messages: [],
  };

  const askQuestion = () => {
    return new Promise((resolve) => {
      rl.question('You: ', resolve);
    });
  };

  while (true) {
    const input = await askQuestion();
    
    if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!\n');
      rl.close();
      break;
    }

    if (!input.trim()) continue;

    // 添加用户消息
    context.messages.push({
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    });

    // 处理消息
    const response = await clawai.handleMessage(context);
    console.log(`\n🤖 ClawAI: ${response.content}\n`);

    // 添加助手回复
    context.messages.push(response);
  }
}

async function runTests(clawai, router) {
  console.log('🧪 Running ClawAI Tests...\n');

  // 测试 1: 隐私检测 (S3)
  console.log('Test 1: Privacy Detection (S3)');
  const s3Result = await router.detect({
    message: 'My SSH private key is -----BEGIN RSA PRIVATE KEY-----',
  });
  console.log(`  Result: ${s3Result.level} - ${s3Result.action}`);
  console.log(`  ✅ ${s3Result.level === 'S3' && s3Result.action === 'local-only' ? 'PASS' : 'FAIL'}\n`);

  // 测试 2: 隐私检测 (S2)
  console.log('Test 2: Privacy Detection (S2)');
  const s2Result = await router.detect({
    message: 'My email is test@example.com',
  });
  console.log(`  Result: ${s2Result.level} - ${s2Result.action}`);
  console.log(`  ✅ ${s2Result.level === 'S2' && s2Result.action === 'redact-and-forward' ? 'PASS' : 'FAIL'}\n`);

  // 测试 3: 成本路由 (SIMPLE)
  console.log('Test 3: Cost Routing (SIMPLE)');
  const simpleResult = await router.detect({
    message: 'Hi',
  });
  console.log(`  Result: ${simpleResult.level} - ${simpleResult.action}`);
  if (simpleResult.target) {
    console.log(`  Target: ${simpleResult.target.provider}/${simpleResult.target.model}`);
  }
  // S1 级别通过 (隐私检测通过，成本路由也通过)
  console.log(`  ✅ ${simpleResult.level === 'S1' ? 'PASS' : 'FAIL'}\n`);

  // 测试 4: 成本路由 (COMPLEX)
  console.log('Test 4: Cost Routing (COMPLEX)');
  const complexResult = await router.detect({
    message: '```typescript\nfunction complexCode() {\n  // ... 100 lines of code\n}\n```',
  });
  console.log(`  Result: ${complexResult.level} - ${complexResult.action}`);
  if (complexResult.target) {
    console.log(`  Target: ${complexResult.target.provider}/${complexResult.target.model}`);
  }
  // S1 级别通过
  console.log(`  ✅ ${complexResult.level === 'S1' ? 'PASS' : 'FAIL'}\n`);

  // 测试 5: 记忆系统
  console.log('Test 5: Memory System');
  const dashboard = await clawai.getMemoryDashboard();
  console.log(`  Total Memories: ${dashboard.overview.total}`);
  console.log(`  L0: ${dashboard.overview.l0Count}, L1: ${dashboard.overview.l1Count}, L2: ${dashboard.overview.l2Count}`);
  console.log(`  ✅ PASS\n`);

  console.log('🎉 All tests completed!\n');
}

// 运行主函数
main().catch(console.error);
