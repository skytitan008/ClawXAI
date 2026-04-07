/**
 * LLM-as-Judge 测试套件
 */

import { LLMComplexityJudge, createLLMJudge } from '../src/llm-judge';
import type { ComplexityLevel } from '../src/llm-judge';

interface TestCase {
  name: string;
  message: string;
  expected: ComplexityLevel;
}

const testCases: TestCase[] = [
  {
    name: 'Simple greeting',
    message: 'Hello',
    expected: 'SIMPLE',
  },
  {
    name: 'Simple question',
    message: 'What is the weather today?',
    expected: 'SIMPLE',
  },
  {
    name: 'Medium question',
    message: 'Can you explain how to set up a Node.js project with TypeScript?',
    expected: 'MEDIUM',
  },
  {
    name: 'Complex task',
    message: 'I need to build a REST API with Express.js that includes user authentication, database integration with PostgreSQL, and proper error handling. Can you help me design the architecture and provide code examples for each component?',
    expected: 'COMPLEX',
  },
  {
    name: 'Reasoning math',
    message: 'If a train travels at 60 mph for 2.5 hours, then stops for 30 minutes, and continues at 45 mph for another 1.5 hours, what is the average speed for the entire journey?',
    expected: 'REASONING',
  },
  {
    name: 'Reasoning why',
    message: 'Why do some programmers prefer functional programming over object-oriented programming? What are the key differences and trade-offs?',
    expected: 'REASONING',
  },
  {
    name: 'Code generation',
    message: 'Write a TypeScript function that implements a binary search tree with insert, delete, and search operations. Include proper type definitions and error handling.',
    expected: 'COMPLEX',
  },
  {
    name: 'Chinese simple',
    message: '你好',
    expected: 'SIMPLE',
  },
  {
    name: 'Chinese medium',
    message: '请问如何安装 Node.js 和 pnpm？',
    expected: 'MEDIUM',
  },
  {
    name: 'Chinese reasoning',
    message: '为什么量子计算机比传统计算机快？请详细解释其原理和优势。',
    expected: 'REASONING',
  },
];

async function runTests(): Promise<void> {
  console.log('🧪 Running LLM-as-Judge Tests...\n');

  const judge = createLLMJudge({
    enableCache: false, // 测试时禁用缓存
  });

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    process.stdout.write(`Test: ${testCase.name}... `);
    
    try {
      const result = await judge.judge(testCase.message);
      
      if (result.complexity === testCase.expected) {
        console.log(`✅ PASS (${result.complexity}, ${result.source}, ${(result.confidence * 100).toFixed(0)}%)`);
        passed++;
      } else {
        console.log(`❌ FAIL (Expected: ${testCase.expected}, Got: ${result.complexity})`);
        console.log(`   Message: "${testCase.message}"`);
        console.log(`   Reasoning: ${result.reasoning}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Results: ${passed}/${testCases.length} passed`);
  console.log(`   Passed: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  console.log(`   Failed: ${failed}`);
  
  // 缓存统计
  const stats = judge.getCacheStats();
  console.log(`\n💾 Cache Stats: ${stats.entries} valid entries, ${stats.size} total`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!\n');
  } else {
    console.log('\n⚠️  Some tests failed.\n');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(console.error);
