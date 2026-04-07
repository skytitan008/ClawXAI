/**
 * Token 统计模块
 * 
 * 收集和统计 Token 使用情况
 * 支持成本计算和 Dashboard API
 */

export interface TokenUsage {
  /** 请求 ID */
  requestId: string;
  /** 时间戳 */
  timestamp: number;
  /** 模型 */
  model: string;
  /** 提供商 */
  provider: string;
  /** 输入 Token */
  promptTokens: number;
  /** 输出 Token */
  completionTokens: number;
  /** 总 Token */
  totalTokens: number;
  /** 成本 (USD) */
  cost: number;
  /** 用户 ID */
  userId?: string;
  /** 工作区 ID */
  workspaceId?: string;
}

export interface TokenStats {
  /** 总请求数 */
  totalRequests: number;
  /** 总 Token 数 */
  totalTokens: number;
  /** 总成本 (USD) */
  totalCost: number;
  /** 平均每次请求 Token */
  avgTokensPerRequest: number;
  /** 平均每次请求成本 */
  avgCostPerRequest: number;
  /** 时间段 (小时) */
  periodHours: number;
}

export interface ModelPricing {
  /** 每 1K 输入 Token 价格 (USD) */
  inputPricePer1K: number;
  /** 每 1K 输出 Token 价格 (USD) */
  outputPricePer1K: number;
}

/**
 * 模型定价表 (USD per 1K tokens)
 */
export const MODEL_PRICING: Record<string, ModelPricing> = {
  // OpenAI
  'gpt-4o': { inputPricePer1K: 0.005, outputPricePer1K: 0.015 },
  'gpt-4o-mini': { inputPricePer1K: 0.00015, outputPricePer1K: 0.0006 },
  'gpt-4-turbo': { inputPricePer1K: 0.01, outputPricePer1K: 0.03 },
  'gpt-3.5-turbo': { inputPricePer1K: 0.0005, outputPricePer1K: 0.0015 },
  
  // Anthropic
  'claude-sonnet-4-5': { inputPricePer1K: 0.003, outputPricePer1K: 0.015 },
  'claude-3-5-sonnet': { inputPricePer1K: 0.003, outputPricePer1K: 0.015 },
  'claude-3-opus': { inputPricePer1K: 0.015, outputPricePer1K: 0.075 },
  'claude-3-haiku': { inputPricePer1K: 0.00025, outputPricePer1K: 0.00125 },
  
  // Google
  'gemini-pro': { inputPricePer1K: 0.00025, outputPricePer1K: 0.0005 },
  'gemini-ultra': { inputPricePer1K: 0.007, outputPricePer1K: 0.021 },
  
  // Meta (via Groq/etc)
  'llama-3-70b': { inputPricePer1K: 0.00059, outputPricePer1K: 0.00079 },
  'llama-3-8b': { inputPricePer1K: 0.00005, outputPricePer1K: 0.00008 },
  
  // 本地模型 (成本为 0)
  'minicpm': { inputPricePer1K: 0, outputPricePer1K: 0 },
  'qwen': { inputPricePer1K: 0, outputPricePer1K: 0 },
};

/**
 * Token 统计收集器
 */
export class TokenStatsCollector {
  private usages: TokenUsage[] = [];
  private maxHistory: number;

  constructor(maxHistory: number = 10000) {
    this.maxHistory = maxHistory;
  }

  /**
   * 记录 Token 使用
   */
  record(usage: Omit<TokenUsage, 'requestId' | 'timestamp' | 'totalTokens' | 'cost'> & {
    totalTokens?: number;
    cost?: number;
  }): TokenUsage {
    const pricing = MODEL_PRICING[usage.model] || MODEL_PRICING['gpt-4o-mini'];
    
    const promptTokens = usage.promptTokens;
    const completionTokens = usage.completionTokens;
    const totalTokens = usage.totalTokens || (promptTokens + completionTokens);
    
    // 计算成本
    const cost = usage.cost ?? (
      (promptTokens / 1000) * pricing.inputPricePer1K +
      (completionTokens / 1000) * pricing.outputPricePer1K
    );

    const tokenUsage: TokenUsage = {
      ...usage,
      requestId: this.generateRequestId(),
      timestamp: Date.now(),
      totalTokens,
      cost,
    };

    this.usages.push(tokenUsage);

    // 限制历史记录
    if (this.usages.length > this.maxHistory) {
      this.usages.shift();
    }

    return tokenUsage;
  }

  /**
   * 获取统计数据
   */
  getStats(periodHours: number = 24): TokenStats {
    const cutoff = Date.now() - (periodHours * 60 * 60 * 1000);
    const filtered = this.usages.filter(u => u.timestamp >= cutoff);

    const totalRequests = filtered.length;
    const totalTokens = filtered.reduce((sum, u) => sum + u.totalTokens, 0);
    const totalCost = filtered.reduce((sum, u) => sum + u.cost, 0);

    return {
      totalRequests,
      totalTokens,
      totalCost,
      avgTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
      avgCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
      periodHours,
    };
  }

  /**
   * 按模型分组统计
   */
  getByModel(periodHours: number = 24): Record<string, TokenStats> {
    const cutoff = Date.now() - (periodHours * 60 * 60 * 1000);
    const filtered = this.usages.filter(u => u.timestamp >= cutoff);

    const grouped: Record<string, TokenUsage[]> = {};
    for (const usage of filtered) {
      if (!grouped[usage.model]) {
        grouped[usage.model] = [];
      }
      grouped[usage.model].push(usage);
    }

    const result: Record<string, TokenStats> = {};
    for (const [model, usages] of Object.entries(grouped)) {
      const totalRequests = usages.length;
      const totalTokens = usages.reduce((sum, u) => sum + u.totalTokens, 0);
      const totalCost = usages.reduce((sum, u) => sum + u.cost, 0);

      result[model] = {
        totalRequests,
        totalTokens,
        totalCost,
        avgTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
        avgCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
        periodHours,
      };
    }

    return result;
  }

  /**
   * 按用户分组统计
   */
  getByUser(periodHours: number = 24): Record<string, TokenStats> {
    const cutoff = Date.now() - (periodHours * 60 * 60 * 1000);
    const filtered = this.usages.filter(u => u.timestamp >= cutoff && u.userId);

    const grouped: Record<string, TokenUsage[]> = {};
    for (const usage of filtered) {
      if (!usage.userId) continue;
      if (!grouped[usage.userId]) {
        grouped[usage.userId] = [];
      }
      grouped[usage.userId].push(usage);
    }

    const result: Record<string, TokenStats> = {};
    for (const [userId, usages] of Object.entries(grouped)) {
      const totalRequests = usages.length;
      const totalTokens = usages.reduce((sum, u) => sum + u.totalTokens, 0);
      const totalCost = usages.reduce((sum, u) => sum + u.cost, 0);

      result[userId] = {
        totalRequests,
        totalTokens,
        totalCost,
        avgTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
        avgCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
        periodHours,
      };
    }

    return result;
  }

  /**
   * 获取最近使用记录
   */
  getRecent(limit: number = 100): TokenUsage[] {
    return this.usages.slice(-limit);
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.usages = [];
  }

  /**
   * 生成请求 ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 导出为 JSON
   */
  exportJSON(): string {
    return JSON.stringify({
      usages: this.usages,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * 从 JSON 导入
   */
  importJSON(json: string): void {
    const data = JSON.parse(json);
    if (Array.isArray(data.usages)) {
      this.usages = data.usages;
    }
  }
}

/**
 * 创建 Token 统计收集器
 */
export function createTokenStatsCollector(maxHistory?: number): TokenStatsCollector {
  return new TokenStatsCollector(maxHistory);
}

export default TokenStatsCollector;
