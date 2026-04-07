#!/usr/bin/env node
/**
 * Token 统计 API 演示
 * 
 * 展示 Token 收集和统计功能
 */

import { TokenStatsCollector, MODEL_PRICING } from '../packages/router/src/token-stats.ts';

async function demo(): Promise<void> {
  console.log('💰 ClawXAI Token Stats Demo\n');
  console.log('='.repeat(70));
  console.log();

  const collector = new TokenStatsCollector(10000);

  // 模拟 Token 使用记录
  const mockUsages = [
    { model: 'gpt-4o', promptTokens: 100, completionTokens: 200, provider: 'openai' },
    { model: 'gpt-4o-mini', promptTokens: 50, completionTokens: 100, provider: 'openai' },
    { model: 'claude-sonnet-4-5', promptTokens: 150, completionTokens: 300, provider: 'anthropic' },
    { model: 'gpt-4o', promptTokens: 200, completionTokens: 400, provider: 'openai' },
    { model: 'llama-3-70b', promptTokens: 80, completionTokens: 160, provider: 'groq' },
    { model: 'gpt-4o-mini', promptTokens: 30, completionTokens: 60, provider: 'openai' },
    { model: 'claude-3-haiku', promptTokens: 40, completionTokens: 80, provider: 'anthropic' },
    { model: 'minicpm', promptTokens: 100, completionTokens: 200, provider: 'local' },
  ];

  console.log('📝 Recording mock usages...\n');

  for (const usage of mockUsages) {
    const recorded = collector.record(usage);
    console.log(`  ✅ ${usage.model}: ${recorded.totalTokens} tokens, $${recorded.cost.toFixed(6)}`);
  }

  console.log();
  console.log('='.repeat(70));
  console.log();

  // 总体统计
  const stats = collector.getStats(24);
  console.log('📊 Overall Statistics (24h):\n');
  console.log(`  Total Requests: ${stats.totalRequests}`);
  console.log(`  Total Tokens: ${stats.totalTokens.toLocaleString()}`);
  console.log(`  Total Cost: $${stats.totalCost.toFixed(6)}`);
  console.log(`  Avg Tokens/Request: ${stats.avgTokensPerRequest.toFixed(1)}`);
  console.log(`  Avg Cost/Request: $${stats.avgCostPerRequest.toFixed(6)}`);
  console.log();

  // 按模型统计
  const byModel = collector.getByModel(24);
  console.log('📈 By Model:\n');
  for (const [model, modelStats] of Object.entries(byModel)) {
    console.log(`  ${model}:`);
    console.log(`    Requests: ${modelStats.totalRequests}`);
    console.log(`    Tokens: ${modelStats.totalTokens.toLocaleString()}`);
    console.log(`    Cost: $${modelStats.totalCost.toFixed(6)}`);
  }
  console.log();

  // 成本对比
  console.log('💡 Cost Optimization Analysis:\n');
  
  const totalTokens = stats.totalTokens;
  const avgCost = stats.totalCost;
  
  // 如果全部用最便宜的模型
  const cheapestModel = 'gpt-4o-mini';
  const cheapestPricing = MODEL_PRICING[cheapestModel];
  const cheapestCost = (totalTokens / 2 / 1000) * cheapestPricing.inputPricePer1K +
                       (totalTokens / 2 / 1000) * cheapestPricing.outputPricePer1K;
  
  // 如果全部用最贵的模型
  const expensiveModel = 'claude-3-opus';
  const expensivePricing = MODEL_PRICING[expensiveModel];
  const expensiveCost = (totalTokens / 2 / 1000) * expensivePricing.inputPricePer1K +
                        (totalTokens / 2 / 1000) * expensivePricing.outputPricePer1K;
  
  const savings = ((expensiveCost - avgCost) / expensiveCost * 100);
  
  console.log(`  Current cost: $${avgCost.toFixed(6)}`);
  console.log(`  If all ${cheapestModel}: $${cheapestCost.toFixed(6)}`);
  console.log(`  If all ${expensiveModel}: $${expensiveCost.toFixed(6)}`);
  console.log();
  console.log(`  💰 Savings vs expensive: $${(expensiveCost - avgCost).toFixed(6)} (${savings.toFixed(1)}%)`);
  console.log(`  💰 Extra vs cheapest: $${(avgCost - cheapestCost).toFixed(6)}`);
  console.log();

  console.log('='.repeat(70));
  console.log('\n✨ Token stats demo completed!\n');
}

demo().catch(console.error);
