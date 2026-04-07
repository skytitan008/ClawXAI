/**
 * ClawXAI Dashboard API
 * 
 * 提供 Token 统计、成本计算、路由决策分布等数据
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

export interface DashboardData {
  /** 统计信息 */
  stats: {
    /** 总请求数 */
    totalRequests: number;
    /** 总 Token 使用量 */
    totalTokens: number;
    /** 总成本 (USD) */
    totalCost: number;
    /** 缓存命中率 */
    cacheHitRate: number;
    /** 平均响应时间 (ms) */
    avgResponseTime: number;
  };

  /** 路由决策分布 */
  routing: {
    /** 各复杂度分布 */
    complexity: {
      SIMPLE: number;
      MEDIUM: number;
      COMPLEX: number;
      REASONING: number;
    };
    /** 各模型使用分布 */
    models: Record<string, number>;
    /** 隐私级别分布 */
    privacy: {
      S1: number;
      S2: number;
      S3: number;
    };
  };

  /** 记忆统计 */
  memory: {
    /** 总记忆数 */
    totalMemories: number;
    /** L0 记忆数 */
    l0Count: number;
    /** L1 记忆数 */
    l1Count: number;
    /** L2 记忆数 */
    l2Count: number;
    /** 存储大小 (KB) */
    storageSize: number;
  };

  /** 时间序列数据 (最近 24 小时) */
  timeline: Array<{
    timestamp: number;
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

/**
 * 模拟数据存储 (实际应使用数据库)
 */
class DashboardStore {
  private stats = {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalResponseTime: 0,
  };

  private routing = {
    complexity: { SIMPLE: 0, MEDIUM: 0, COMPLEX: 0, REASONING: 0 },
    models: {} as Record<string, number>,
    privacy: { S1: 0, S2: 0, S3: 0 },
  };

  private timeline: Array<{
    timestamp: number;
    requests: number;
    tokens: number;
    cost: number;
  }> = [];

  /**
   * 记录请求
   */
  recordRequest(data: {
    complexity?: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'REASONING';
    model?: string;
    privacy?: 'S1' | 'S2' | 'S3';
    tokens?: number;
    cost?: number;
    responseTime?: number;
    cacheHit?: boolean;
  }): void {
    this.stats.totalRequests++;
    
    if (data.tokens) this.stats.totalTokens += data.tokens;
    if (data.cost) this.stats.totalCost += data.cost;
    if (data.responseTime) this.stats.totalResponseTime += data.responseTime;
    
    if (data.cacheHit) {
      this.stats.cacheHits++;
    } else {
      this.stats.cacheMisses++;
    }

    if (data.complexity) {
      this.routing.complexity[data.complexity]++;
    }
    
    if (data.model) {
      this.routing.models[data.model] = (this.routing.models[data.model] || 0) + 1;
    }
    
    if (data.privacy) {
      this.routing.privacy[data.privacy]++;
    }

    // 更新时间线
    this.updateTimeline(data);
  }

  private updateTimeline(data: { tokens?: number; cost?: number }): void {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    
    // 清理旧数据
    this.timeline = this.timeline.filter(point => point.timestamp > hourAgo);
    
    // 找到或创建当前时间点
    const lastPoint = this.timeline[this.timeline.length - 1];
    const currentMinute = Math.floor(now / 60000) * 60000;
    
    if (lastPoint && lastPoint.timestamp === currentMinute) {
      lastPoint.requests++;
      if (data.tokens) lastPoint.tokens += data.tokens;
      if (data.cost) lastPoint.cost += data.cost;
    } else {
      this.timeline.push({
        timestamp: currentMinute,
        requests: 1,
        tokens: data.tokens || 0,
        cost: data.cost || 0,
      });
    }
  }

  /**
   * 获取仪表板数据
   */
  getDashboardData(memoryStats?: { total: number; l0: number; l1: number; l2: number }): DashboardData {
    const cacheHitRate = this.stats.cacheHits + this.stats.cacheMisses > 0
      ? this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)
      : 0;
    
    const avgResponseTime = this.stats.totalRequests > 0
      ? this.stats.totalResponseTime / this.stats.totalRequests
      : 0;

    return {
      stats: {
        totalRequests: this.stats.totalRequests,
        totalTokens: this.stats.totalTokens,
        totalCost: this.stats.totalCost,
        cacheHitRate,
        avgResponseTime,
      },
      routing: {
        complexity: { ...this.routing.complexity },
        models: { ...this.routing.models },
        privacy: { ...this.routing.privacy },
      },
      memory: memoryStats || {
        totalMemories: 0,
        l0Count: 0,
        l1Count: 0,
        l2Count: 0,
        storageSize: 0,
      },
      timeline: this.timeline,
    };
  }

  /**
   * 重置统计
   */
  reset(): void {
    this.stats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalResponseTime: 0,
    };
    this.routing = {
      complexity: { SIMPLE: 0, MEDIUM: 0, COMPLEX: 0, REASONING: 0 },
      models: {},
      privacy: { S1: 0, S2: 0, S3: 0 },
    };
    this.timeline = [];
  }
}

const store = new DashboardStore();

/**
 * 创建 Dashboard HTTP 服务器
 */
export function createDashboardServer(port: number = 3000) {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // API 路由
    if (req.url === '/api/dashboard' && req.method === 'GET') {
      const data = store.getDashboardData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    if (req.url === '/api/stats' && req.method === 'GET') {
      const data = store.getDashboardData().stats;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    if (req.url === '/api/routing' && req.method === 'GET') {
      const data = store.getDashboardData().routing;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    if (req.url === '/api/memory' && req.method === 'GET') {
      const data = store.getDashboardData().memory;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    if (req.url === '/api/record' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          store.recordRequest(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (req.url === '/api/reset' && req.method === 'POST') {
      store.reset();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // 静态文件服务
    if (req.url === '/' || req.url === '/index.html') {
      const htmlPath = join(process.cwd(), 'apps/dashboard/dist/index.html');
      if (existsSync(htmlPath)) {
        const html = readFileSync(htmlPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
      }
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(port, () => {
    console.log(`📊 Dashboard server running at http://localhost:${port}`);
  });

  return server;
}

/**
 * 获取存储实例 (用于直接访问)
 */
export function getDashboardStore(): DashboardStore {
  return store;
}
