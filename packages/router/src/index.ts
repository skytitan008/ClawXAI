/**
 * ClawAI Router - 融合 EdgeClaw ClawXRouter 的隐私和成本优化路由
 * 
 * @module @claw-ai/router
 */

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
  
  private keywords: Record<string, string[]>;
  private patterns: Record<string, RegExp[]>;

  constructor(config: PrivacyRouterConfig) {
    this.keywords = config.keywords || {
      S2: ['password', 'email', 'phone', 'address'],
      S3: ['ssh', 'private_key', '.pem', 'secret', 'token'],
    };
    this.patterns = config.patterns || {
      S2: [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g],
      S3: [/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g],
    };
  }

  async detect(context: DetectionContext): Promise<RouterDecision> {
    const message = context.message.toLowerCase();

    // 检测 S3 关键词
    for (const keyword of this.keywords.S3 || []) {
      if (message.includes(keyword)) {
        return {
          level: 'S3',
          action: 'local-only',
          reason: `Rule detector: Highly sensitive keyword "${keyword}" detected`,
        };
      }
    }

    // 检测 S3 模式
    for (const pattern of this.patterns.S3 || []) {
      if (pattern.test(context.message)) {
        return {
          level: 'S3',
          action: 'local-only',
          reason: 'Rule detector: Highly sensitive pattern detected',
        };
      }
    }

    // 检测 S2 关键词
    for (const keyword of this.keywords.S2 || []) {
      if (message.includes(keyword)) {
        return {
          level: 'S2',
          action: 'redact-and-forward',
          redact: true,
          reason: `Sensitive keyword "${keyword}" detected, will redact before forwarding`,
        };
      }
    }

    // 检测 S2 模式
    for (const pattern of this.patterns.S2 || []) {
      pattern.lastIndex = 0;
      if (pattern.test(context.message)) {
        return {
          level: 'S2',
          action: 'redact-and-forward',
          redact: true,
          reason: 'Sensitive pattern detected, will redact before forwarding',
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
 * 成本感知路由器 - 简单规则判断复杂度
 */
export class TokenSaverRouter implements Router {
  readonly id = 'token-saver';

  private tiers: Record<ComplexityLevel, { provider: string; model: string }>;

  constructor(config: TokenSaverConfig) {
    this.tiers = config.tiers || {
      SIMPLE: { provider: 'openai', model: 'gpt-4o-mini' },
      MEDIUM: { provider: 'openai', model: 'gpt-4o' },
      COMPLEX: { provider: 'anthropic', model: 'claude-sonnet-4-5' },
      REASONING: { provider: 'openai', model: 'o4-mini' },
    };
  }

  async detect(context: DetectionContext): Promise<RouterDecision> {
    const message = context.message;
    const complexity = this.estimateComplexity(message);
    return this.complexityToDecision(complexity);
  }

  private estimateComplexity(message: string): ComplexityLevel {
    const wordCount = message.split(/\s+/).length;
    const hasCode = /```|function|class|import|from/.test(message);
    const hasReasoning = /why|how|explain|analyze|compare/.test(message.toLowerCase());

    if (hasReasoning && wordCount > 50) {
      return 'REASONING';
    }

    if (hasCode || wordCount > 100) {
      return 'COMPLEX';
    }

    if (wordCount > 20) {
      return 'MEDIUM';
    }

    return 'SIMPLE';
  }

  private complexityToDecision(complexity: ComplexityLevel): RouterDecision {
    const target = this.tiers[complexity];
    return {
      level: 'S1',
      action: 'redirect',
      target,
      reason: `${complexity} task routed to ${target.model}`,
    };
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
 * 创建默认 ClawAI 路由器
 */
export function createClawAIRouter(): RouterPipeline {
  const pipeline = new RouterPipeline();

  // 注册隐私路由器 (高权重，安全优先)
  pipeline.register(
    new PrivacyRouter({}),
    90
  );

  // 注册成本路由器 (低权重，成本优化)
  pipeline.register(
    new TokenSaverRouter({}),
    40
  );

  return pipeline;
}

// 配置类型
export interface PrivacyRouterConfig {
  keywords?: {
    S2?: string[];
    S3?: string[];
  };
  patterns?: {
    S2?: RegExp[];
    S3?: RegExp[];
  };
}

export interface TokenSaverConfig {
  tiers?: Record<ComplexityLevel, { provider: string; model: string }>;
}

// 导出默认
export default createClawAIRouter;
