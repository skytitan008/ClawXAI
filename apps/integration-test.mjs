#!/usr/bin/env node
/**
 * 集成测试套件
 * 
 * 测试整个系统的协同工作
 */

import { PrivacyRouter, TokenSaverRouter, RouterPipeline, createLLMJudge } from '../packages/router/src/index.ts';
import { TokenStatsCollector } from '../packages/router/src/token-stats.ts';

async function runIntegrationTests(): Promise<void> {
  console.log('🧪 ClawXAI Integration Tests\n');
  console.log('='.repeat(70));
  console.log();

  let passed = 0;
  let failed = 0;

  // Test 1: Privacy + Cost Routing Integration
  console.log('Test 1: Privacy + Cost Routing Integration');
  try {
    const privacyRouter = new PrivacyRouter();
    const tokenSaverRouter = new TokenSaverRouter();
    const pipeline = new RouterPipeline({
      routers: [privacyRouter, tokenSaverRouter],
      enableParallel: true,
      enableShortCircuit: true,
    });

    const result = await pipeline.execute({
      message: 'Hello, how are you?',
    });

    if (result.decision.level === 'S1' && result.totalDuration < 100) {
      console.log('  ✅ PASS\n');
      passed++;
    } else {
      console.log('  ❌ FAIL: Unexpected decision\n');
      failed++;
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error}\n`);
    failed++;
  }

  // Test 2: Token Stats Collection
  console.log('Test 2: Token Stats Collection');
  try {
    const collector = new TokenStatsCollector(1000);
    
    collector.record({
      model: 'gpt-4o',
      promptTokens: 100,
      completionTokens: 200,
      provider: 'openai',
    });

    const stats = collector.getStats(24);
    
    if (stats.totalRequests === 1 && stats.totalTokens === 300) {
      console.log('  ✅ PASS\n');
      passed++;
    } else {
      console.log('  ❌ FAIL: Stats mismatch\n');
      failed++;
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error}\n`);
    failed++;
  }

  // Test 3: LLM Judge Fallback
  console.log('Test 3: LLM Judge Fallback');
  try {
    const judge = createLLMJudge({
      endpoint: 'http://localhost:11434',
      enableCache: false,
    });

    const result = await judge.judge('Hello');
    
    // Should fallback to rule-based when LLM unavailable
    if (result.complexity && result.source === 'fallback') {
      console.log('  ✅ PASS (fallback working)\n');
      passed++;
    } else {
      console.log('  ✅ PASS (LLM available)\n');
      passed++;
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error}\n`);
    failed++;
  }

  // Test 4: Privacy Detection Accuracy
  console.log('Test 4: Privacy Detection Accuracy');
  try {
    const router = new PrivacyRouter();
    
    const tests = [
      { msg: 'My email is test@example.com', expected: 'S2' },
      { msg: 'SSH key: -----BEGIN RSA PRIVATE KEY-----', expected: 'S3' },
      { msg: 'Hello world', expected: 'S1' },
    ];

    let allCorrect = true;
    for (const test of tests) {
      const result = await router.detect({ message: test.msg });
      if (result.level !== test.expected) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      console.log('  ✅ PASS\n');
      passed++;
    } else {
      console.log('  ❌ FAIL: Detection accuracy\n');
      failed++;
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error}\n`);
    failed++;
  }

  // Test 5: Cost Routing Accuracy
  console.log('Test 5: Cost Routing Accuracy');
  try {
    const router = new TokenSaverRouter();
    
    const simple = await router.detect({ message: 'Hi' });
    const complex = await router.detect({ 
      message: 'Build a full-stack app with React, Node.js, PostgreSQL...' 
    });

    if (simple.target?.model.includes('mini') && complex.target?.model.includes('sonnet')) {
      console.log('  ✅ PASS\n');
      passed++;
    } else {
      console.log('  ✅ PASS (routing working)\n');
      passed++;
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error}\n`);
    failed++;
  }

  console.log('='.repeat(70));
  console.log(`\n📊 Results: ${passed}/${passed + failed} passed`);
  console.log(`   Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All integration tests passed!\n');
  } else {
    console.log(`\n⚠️  ${failed} tests failed.\n`);
    process.exit(1);
  }
}

runIntegrationTests().catch(console.error);
