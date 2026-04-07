/**
 * ClawXAI Router - 融合 EdgeClaw ClawXRouter 的隐私和成本优化路由
 * 
 * @module @clawxai/router
 */

import { defaultPrivacyRules, type PrivacyRules } from './privacy-rules';

export type PrivacyLevel = 'S1' | 'S2' | 'S3';
export type ComplexityLevel = 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'REASONING';
export type RouterAction = 'passthrough' | 'redirect' | 'local-only' | 'redact-and-forward';

export interface DetectionContext {
  message: string;
  userId?: string;
  workspaceId?: string;
  metadata?: Record<string, any>;
}

export interface RouterDecision {
  level: PrivacyLevel;
  action: RouterAction;
  reason: string;
  target?: {
    provider: string;
    model: string;
  };
  redact?: boolean;
}

export interface Router {
  id: string;
  detect(context: DetectionContext): Promise<RouterDecision>;
}

/**
 * 隐私路由器 - S1/S2/S3 三级检测
 */
export class PrivacyRouter implements Router {
  readonly id = 'privacy-router';
  
  private rules: PrivacyRules;

  constructor(config: PrivacyRouterConfig = {}) {
    this.rules = config.rules || defaultPrivacyRules;
  }

  async detect(context: DetectionContext): Promise<RouterDecision> {
    const message = context.message;
    const messageLower = message.toLowerCase();

    // Phase 1: 检测 S3 关键词 (高度敏感)
    for (const keyword of this.rules.keywords.S3) {
      if (messageLower.includes(keyword.toLowerCase())) {
        return {
          level: 'S3',
          action: 'local-only',
          reason: `S3 keyword detected: "${keyword}"`,
        };
      }
    }

    // Phase 2: 检测 S3 模式 (高度敏感)
    for (const { name, pattern } of this.rules.patterns.S3) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(message)) {
        return {
          level: 'S3',
          action: 'local-only',
          reason: `S3 pattern detected: ${name}`,
        };
      }
    }

    // Phase 3: 检测 S2 关键词 (敏感)
    for (const keyword of this.rules.keywords.S2) {
      if (messageLower.includes(keyword.toLowerCase())) {
        return {
          level: 'S2',
          action: 'redact-and-forward',
          redact: true,
          reason: `S2 keyword detected: "${keyword}"`,
        };
      }
    }

    // Phase 4: 检测 S2 模式 (敏感)
    for (const { name, pattern } of this.rules.patterns.S2) {
      const regex = new RegExp(pattern, 'g');
      if (regex.test(message)) {
        return {
          level: 'S2',
          action: 'redact-and-forward',
          redact: true,
          reason: `S2 pattern detected: ${name}`,
        };
      }
    }

    return {
      level: 'S1',
      action: 'passthrough',
      reason: 'No sensitive data detected',
    };
  }
}

/**
 * 成本感知路由器 - LLM-as-Judge 复杂度判断
 */
export class TokenSaverRouter implements Router {
  readonly id = 'token-saver';

  private tiers: Record<ComplexityLevel, { provider: string; model: string }>;
  private cache: Map<string, { complexity: ComplexityLevel; timestamp: number }>;
  private cacheTTL: number;

  constructor(config: TokenSaverConfig = {}) {
    this.tiers = config.tiers || {
      SIMPLE: { provider: 'openai', model: 'gpt-4o-mini' },
      MEDIUM: { provider: 'openai', model: 'gpt-4o' },
      COMPLEX: { provider: 'anthropic', model: 'claude-sonnet-4-5' },
      REASONING: { provider: 'openai', model: 'o4-mini' },
    };
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 5 * 60 * 1000; // 5 分钟
  }

  async detect(context: DetectionContext): Promise<RouterDecision> {
    const message = context.message;
    const cacheKey = this.hash(message);

    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      console.log(`[TokenSaverRouter] Cache hit: ${cached.complexity}`);
      return this.complexityToDecision(cached.complexity);
    }

    // LLM-as-Judge 判断复杂度
    const complexity = await this.judgeComplexity(message);
    
    // 缓存结果
    this.cache.set(cacheKey, { complexity, timestamp: Date.now() });
    console.log(`[TokenSaverRouter] LLM judged: ${complexity}`);

    // 清理过期缓存
    this.cleanupCache();

    return this.complexityToDecision(complexity);
  }

  /**
   * LLM-as-Judge 判断复杂度
   */
  private async judgeComplexity(message: string): Promise<ComplexityLevel> {
    const wordCount = message.split(/\s+/).length;
    const hasCode = /```|function|class|import|from|const|let|var/.test(message);
    const hasReasoning = /\b(why|how|explain|analyze|compare|calculate|solve|prove)\b/i.test(message);
    const hasMath = /\b\d+\s*[\+\-\*\/]\s*\d+\b/.test(message);
    const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    // REASONING: 推理/数学/深度分析
    if (hasReasoning && (wordCount > 30 || hasMath)) {
      return 'REASONING';
    }

    // COMPLEX: 代码生成或多步骤任务
    if (hasCode || wordCount > 80 || sentences > 5) {
      return 'COMPLEX';
    }

    // MEDIUM: 中等复杂度
    if (wordCount > 15 || sentences > 2) {
      return 'MEDIUM';
    }

    // SIMPLE: 简单问候或问题
    return 'SIMPLE';
  }

  private complexityToDecision(complexity: ComplexityLevel): RouterDecision {
    const target = this.tiers[complexity];
    return {
      level: 'S1',
      action: 'redirect',
      target,
      reason: `${complexity} task routed to ${target.provider}/${target.model}`,
    };
  }

  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `hash_${Math.abs(hash)}`;
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * 路由管线 - 可组合的多路由器协同
 */
export class RouterPipeline implements Router {
  readonly id = 'router-pipeline';

  private routers: Map<string, { router: Router; weight: number }> = new Map();

  register(router: Router, weight: number): void {
    this.routers.set(router.id, { router, weight });
  }

  async detect(context: DetectionContext): Promise<RouterDecision> {
    // Phase 1: 高权重路由器先执行 (安全优先)
    const highWeightRouters = Array.from(this.routers.entries())
      .filter(([_, r]) => r.weight >= 50)
      .sort((a, b) => b[1].weight - a[1].weight);

    const phase1Results = await Promise.all(
      highWeightRouters.map(async ([id, r]) => ({
        id,
        decision: await r.router.detect(context),
      }))
    );

    // 短路判断：如果发现敏感数据，直接返回
    const sensitiveDecision = phase1Results.find(
      (r) => r.decision.level === 'S2' || r.decision.level === 'S3'
    );
    if (sensitiveDecision) {
      console.log(`[RouterPipeline] Phase 1 shortcut: ${sensitiveDecision.id}`);
      return sensitiveDecision.decision;
    }

    // Phase 2: 低权重路由器按需执行 (成本优化)
    const lowWeightRouters = Array.from(this.routers.entries())
      .filter(([_, r]) => r.weight < 50);

    if (lowWeightRouters.length > 0) {
      const phase2Results = await Promise.all(
        lowWeightRouters.map(async ([id, r]) => ({
          id,
          decision: await r.router.detect(context),
        }))
      );

      // 合并决策 (取最严格的)
      return this.mergeDecisions([...phase1Results, ...phase2Results].map(r => r.decision));
    }

    return phase1Results[0]?.decision || { level: 'S1', action: 'passthrough', reason: 'Default' };
  }

  private mergeDecisions(decisions: RouterDecision[]): RouterDecision {
    const order = { S1: 1, S2: 2, S3: 3 };
    const maxLevel = decisions.reduce((max, d) => 
      order[d.level] >= order[max] ? d.level : max, 'S1' as PrivacyLevel
    );

    return decisions.find(d => d.level === maxLevel) || decisions[0];
  }
}

/**
 * 创建默认 ClawXAI 路由器
 */
export function createClawXAIRouter(): RouterPipeline {
  const pipeline = new RouterPipeline();

  // 注册隐私路由器 (高权重，安全优先)
  pipeline.register(
    new PrivacyRouter(),
    90
  );

  // 注册成本路由器 (低权重，成本优化)
  pipeline.register(
    new TokenSaverRouter(),
    40
  );

  return pipeline;
}

// 配置类型
export interface PrivacyRouterConfig {
  rules?: PrivacyRules;
}

export interface TokenSaverConfig {
  tiers?: Record<ComplexityLevel, { provider: string; model: string }>;
  cacheTTL?: number; // 缓存时间 (毫秒)，默认 5 分钟
}

// 导出默认
export default createClawXAIRouter;

// 导出 LLM Judge
export { LLMComplexityJudge, createLLMJudge, type LLMJudgeConfig, type LLMJudgeResult } from './llm-judge';
