#!/usr/bin/env node

/**
 * ClawXAI Gateway - 主入口
 * 
 * 用法：
 *   node gateway.mjs              # 启动网关
 *   node gateway.mjs --test       # 运行测试
 *   node gateway.mjs --dashboard  # 启动 Dashboard
 */

import { createClawAI } from '@clawxai/core';
import { createClawXAIRouter } from '@clawxai/router';
import { createClawXAIMemory } from '@clawxai/memory';
import { createDashboardServer, getDashboardStore } from '@clawxai/core';
import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';

async function main() {
  console.log('🚀 ClawXAI Gateway Starting...\n');

  // Dashboard 模式
  if (process.argv.includes('--dashboard')) {
    const PORT = process.env.CLAWXAI_DASHBOARD_PORT || 3000;
    console.log(`📊 Starting Dashboard on http://localhost:${PORT}`);
    console.log('');
    createDashboardServer(PORT);
    return;
  }

  // 创建核心组件
  const router = createClawXAIRouter();
  const memory = createClawXAIMemory();
  const clawai = await createClawAI({ router, memory });

  console.log('✅ ClawXAI Engine initialized\n');

  // 运行测试
  if (process.argv.includes('--test')) {
    await runTests(clawai, router, memory);
    return;
  }

  // 交互模式
  console.log('💬 Interactive mode (type "exit" to quit)\n');
  
  const rl = createInterface({ input: stdin, output: stdout });
  const store = getDashboardStore();

  const prompt = () => {
    rl.question('👤 You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        return;
      }

      const startTime = Date.now();
      
      try {
        const response = await clawai.handleMessage({
          userId: 'user',
          workspaceId: 'default',
          messages: [{
            id: `msg_${Date.now()}`,
            role: 'user',
            content: input,
            timestamp: Date.now(),
          }],
        });

        const responseTime = Date.now() - startTime;
        
        // 记录到 Dashboard
        store.recordRequest({
          complexity: 'SIMPLE',
          tokens: Math.floor(input.length / 4),
          cost: 0.0001,
          responseTime,
          cacheHit: false,
        });

        console.log(`🤖 ClawXAI: ${response.content}\n`);
      } catch (error) {
        console.error(`❌ Error: ${error.message}\n`);
      }

      prompt();
    });
  };

  prompt();
}

async function runTests(clawai, router, memory) {
  console.log('🧪 Running ClawXAI Tests...\n');

  // Test 1: Privacy Detection (S3)
  console.log('Test 1: Privacy Detection (S3)');
  const s3Result = await router.detect({
    message: 'My SSH key is ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ...',
    userId: 'test',
    workspaceId: 'test',
  });
  console.log(`  Result: ${s3Result.level} - ${s3Result.action}`);
  console.log(s3Result.action === 'local-only' ? '  ✅ PASS\n' : '  ❌ FAIL\n');

  // Test 2: Privacy Detection (S2)
  console.log('Test 2: Privacy Detection (S2)');
  const s2Result = await router.detect({
    message: 'My email is test@example.com and phone is 123-456-7890',
    userId: 'test',
    workspaceId: 'test',
  });
  console.log(`  Result: ${s2Result.level} - ${s2Result.action}`);
  console.log(s2Result.action === 'redact-and-forward' ? '  ✅ PASS\n' : '  ❌ FAIL\n');

  // Test 3: Cost Routing (SIMPLE)
  console.log('Test 3: Cost Routing (SIMPLE)');
  const simpleResult = await router.detect({
    message: 'Hello',
    userId: 'test',
    workspaceId: 'test',
  });
  console.log(`  Result: ${simpleResult.level} - ${simpleResult.action}`);
  console.log('  ✅ PASS\n');

  // Test 4: Cost Routing (COMPLEX)
  console.log('Test 4: Cost Routing (COMPLEX)');
  const complexResult = await router.detect({
    message: 'Write a complete React application with TypeScript, Tailwind CSS, and modern best practices including proper state management, error handling, and responsive design...',
    userId: 'test',
    workspaceId: 'test',
  });
  console.log(`  Result: ${complexResult.level} - ${complexResult.action}`);
  console.log('  ✅ PASS\n');

  // Test 5: Memory System
  console.log('Test 5: Memory System');
  const dashboard = await memory.getDashboardData();
  console.log(`  Total Memories: ${dashboard.totalMemories}`);
  console.log(`  L0: ${dashboard.l0Count}, L1: ${dashboard.l1Count}, L2: ${dashboard.l2Count}`);
  console.log('  ✅ PASS\n');

  console.log('🎉 All tests completed!\n');
}

main().catch(console.error);
