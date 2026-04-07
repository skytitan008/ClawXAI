#!/usr/bin/env node

/**
 * ClawXKairos 示例 - 自驱动 Agent 演示
 * 
 * 展示如何使用 Tick 系统执行自主任务
 */

import { createClawXKairos } from '@clawxai/core';

// 创建 Agent
const agent = createClawXKairos({
  name: 'ClawXAI-Agent',
  tickInterval: 5000,  // 5 秒一个 Tick
  maxConcurrentTasks: 3,
  autoPlan: true,
  taskTimeout: 30000,  // 30 秒超时
});

// 注册任务执行器：数据收集
agent.registerExecutor('data:collect', async (task, context) => {
  console.log(`  📊 Collecting data: ${task.description}`);
  
  // 模拟数据收集
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const data = {
    timestamp: Date.now(),
    tick: context.tick,
    source: task.metadata?.source || 'unknown',
    items: Math.floor(Math.random() * 100),
  };
  
  console.log(`  ✅ Collected ${data.items} items`);
  return data;
});

// 注册任务执行器：数据分析
agent.registerExecutor('data:analyze', async (task, context) => {
  console.log(`  🔍 Analyzing data: ${task.description}`);
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const analysis = {
    timestamp: Date.now(),
    patterns: ['pattern1', 'pattern2'],
    anomalies: Math.random() > 0.8 ? 1 : 0,
    confidence: 0.85 + Math.random() * 0.1,
  };
  
  console.log(`  ✅ Analysis complete (confidence: ${analysis.confidence.toFixed(2)})`);
  return analysis;
});

// 注册任务执行器：报告生成
agent.registerExecutor('report:generate', async (task, context) => {
  console.log(`  📝 Generating report: ${task.description}`);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const report = {
    id: `report_${Date.now()}`,
    generated: new Date().toISOString(),
    summary: `Report for tick ${context.tick}`,
    sections: 3,
    pages: Math.floor(Math.random() * 10) + 1,
  };
  
  console.log(`  ✅ Report generated: ${report.id} (${report.pages} pages)`);
  return report;
});

// 注册任务执行器：系统清理
agent.registerExecutor('system:cleanup', async (task, context) => {
  console.log(`  🧹 Cleaning up: ${task.description}`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const cleaned = {
    files: Math.floor(Math.random() * 50),
    cache: `${(Math.random() * 100).toFixed(1)} MB`,
  };
  
  console.log(`  ✅ Cleaned ${cleaned.files} files, ${cleaned.cache} cache`);
  return cleaned;
});

// 事件监听
agent.on('tick:start', (context) => {
  console.log(`\n⏰ Tick ${context.tick} starting...`);
});

agent.on('tick:end', (context) => {
  console.log(`⏰ Tick ${context.tick} completed in ${context.duration}ms\n`);
});

agent.on('task:created', (task) => {
  console.log(`  📋 Task created: ${task.name} [${task.priority}]`);
});

agent.on('task:completed', (task) => {
  console.log(`  ✅ Task completed: ${task.name}`);
});

agent.on('task:failed', (task) => {
  console.error(`  ❌ Task failed: ${task.name} - ${task.error}`);
});

// 主函数
async function main() {
  console.log('🚀 ClawXKairos Demo Starting...\n');
  console.log('Agent Configuration:');
  console.log(`  Name: ${agent.getStatus().name}`);
  console.log(`  Tick Interval: ${agent.getStatus().tickInterval}ms`);
  console.log(`  Max Concurrent Tasks: ${agent.getStatus().maxConcurrentTasks || 3}`);
  console.log('\nPress Ctrl+C to stop\n');

  // 创建一些初始任务
  agent.createTask({
    name: 'data:collect',
    description: 'Collect user activity data',
    priority: 'high',
    metadata: { source: 'user_activity' },
  });

  agent.createTask({
    name: 'data:collect',
    description: 'Collect system metrics',
    priority: 'normal',
    metadata: { source: 'system_metrics' },
  });

  agent.createTask({
    name: 'system:cleanup',
    description: 'Clean temporary files',
    priority: 'low',
  });

  // 启动 Agent
  agent.start();

  // 动态创建任务演示
  setTimeout(() => {
    console.log('\n📌 Creating additional tasks...\n');
    
    agent.createTask({
      name: 'data:analyze',
      description: 'Analyze collected data',
      priority: 'high',
    });
  }, 15000);

  setTimeout(() => {
    console.log('\n📌 Creating report task...\n');
    
    agent.createTask({
      name: 'report:generate',
      description: 'Generate daily report',
      priority: 'normal',
    });
  }, 25000);

  // 运行 60 秒后停止
  setTimeout(() => {
    console.log('\n⏹️  Stopping agent...\n');
    agent.stop();
    
    // 打印最终状态
    const status = agent.getStatus();
    console.log('Final Agent Status:');
    console.log(`  Total Ticks: ${status.tick}`);
    console.log(`  Total Tasks: ${status.totalTasks}`);
    console.log(`  Pending Tasks: ${status.pendingTasks}`);
    console.log(`  Executors: ${status.executors.join(', ')}`);
    
    process.exit(0);
  }, 60000);
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  agent.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  agent.stop();
  process.exit(1);
});

main().catch(console.error);
