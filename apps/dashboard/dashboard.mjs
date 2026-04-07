#!/usr/bin/env node

/**
 * ClawXAI Dashboard Server
 * 
 * 启动 Dashboard HTTP 服务器
 */

import { createDashboardServer } from '@clawxai/core';

const PORT = process.env.CLAWXAI_DASHBOARD_PORT || 3000;

console.log('🚀 Starting ClawXAI Dashboard...');
console.log(`📊 Dashboard will be available at http://localhost:${PORT}`);
console.log('');
console.log('Endpoints:');
console.log('  GET  /api/dashboard  - Full dashboard data');
console.log('  GET  /api/stats      - Statistics only');
console.log('  GET  /api/routing    - Routing distribution');
console.log('  GET  /api/memory     - Memory statistics');
console.log('  POST /api/record     - Record new request');
console.log('  POST /api/reset      - Reset all statistics');
console.log('');
console.log('Press Ctrl+C to stop');
console.log('');

createDashboardServer(PORT);
