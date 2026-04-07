#!/usr/bin/env node

/**
 * ClawXKairos 简化演示 - 用于截图
 */

import { createClawXKairos } from '@clawxai/core';

console.log('🚀 ClawXKairos Demo Starting...\n');

const agent = createClawXKairos({
  name: 'ClawXAI-Agent',
  tickInterval: 3000,
  maxConcurrentTasks: 2,
  taskTimeout: 10000,
});

// 注册执行器
agent.registerExecutor('demo', async (task, context) => {
  console.log(`  ⚙️  Executing: ${task.description}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`  ✅ Completed: ${task.name}`);
  return { success: true };
});

// 事件监听
agent.on('tick:start', (ctx) => {
  console.log(`\n⏰ Tick ${ctx.tick} starting...`);
});

agent.on('tick:end', (ctx) => {
  console.log(`⏰ Tick ${ctx.tick} completed in ${ctx.duration}ms`);
});

agent.on('task:created', (task) => {
  console.log(`  📋 Task created: ${task.name} [${task.priority}]`);
});

agent.on('task:completed', (task) => {
  console.log(`  ✅ Task completed: ${task.name}`);
});

// 创建任务
agent.createTask({
  name: 'demo',
  description: 'Initialize system',
  priority: 'high',
});

agent.createTask({
  name: 'demo',
  description: 'Load configuration',
  priority: 'normal',
});

// 启动
agent.start();

// 30 秒后停止
setTimeout(() => {
  console.log('\n⏹️  Stopping agent...');
  const status = agent.getStatus();
  console.log('\nFinal Status:');
  console.log(`  Total Ticks: ${status.tick}`);
  console.log(`  Total Tasks: ${status.totalTasks}`);
  console.log(`  Pending: ${status.pendingTasks}`);
  agent.stop();
  process.exit(0);
}, 30000);
