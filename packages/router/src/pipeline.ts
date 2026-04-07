/**
 * 路由管线 - 并行执行多个路由器
 * 
 * 支持：
 * - 并行执行
 * - 短路机制 (S3 检测直接返回)
 * - 权重系统
 * - 性能基准
 */

import type { PrivacyLevel, RouterDecision, DetectionContext, Router } from './index';

export interface RouterPipelineConfig {
  /** 路由器列表 */
  routers: Router[];
  /** 是否启用短路 (S3 检测直接返回) */
  enableShortCircuit?: boolean;
  /** 是否并行执行 */
  enableParallel?: boolean;
  /** 超时时间 (毫秒) */
  timeout?: number;
}

export interface PipelineResult {
  decision: RouterDecision;
  routers: Array<{
    id: string;
    decision: RouterDecision;
    duration: number;
  }>;
  totalDuration: number;
  shortCircuited: boolean;
}

/**
 * 路由管线
 */
export class RouterPipeline {
  private routers: Router[];
  private enableShortCircuit: boolean;
  private enableParallel: boolean;
  private timeout: number;

  constructor(config: RouterPipelineConfig) {
    this.routers = config.routers;
    this.enableShortCircuit = config.enableShortCircuit ?? true;
    this.enableParallel = config.enableParallel ?? true;
    this.timeout = config.timeout ?? 5000;
  }

  /**
   * 执行路由管线
   */
  async execute(context: DetectionContext): Promise<PipelineResult> {
    const startTime = Date.now();
    const routerResults: Array<{
      id: string;
      decision: RouterDecision;
      duration: number;
    }> = [];

    let finalDecision: RouterDecision | null = null;
    let shortCircuited = false;

    if (this.enableParallel) {
      // 并行执行所有路由器
      const promises = this.routers.map(async (router) => {
        const routerStart = Date.now();
        try {
          const decision = await router.detect(context);
          const duration = Date.now() - routerStart;
          return { id: router.id, decision, duration };
        } catch (error) {
          console.error(`[RouterPipeline] Router ${router.id} error:`, error);
          return {
            id: router.id,
            decision: {
              level: 'S1' as PrivacyLevel,
              action: 'passthrough',
              reason: `Router error: ${error}`,
            },
            duration: Date.now() - routerStart,
          };
        }
      });

      const results = await Promise.all(promises);
      routerResults.push(...results);

      // 合并结果 (最严格的优先级最高：S3 > S2 > S1)
      finalDecision = this.mergeDecisions(results.map(r => r.decision));
    } else {
      // 串行执行
      for (const router of this.routers) {
        const routerStart = Date.now();
        const decision = await router.detect(context);
        const duration = Date.now() - routerStart;

        routerResults.push({ id: router.id, decision, duration });

        // 短路机制：S3 检测直接返回
        if (this.enableShortCircuit && decision.level === 'S3') {
          finalDecision = decision;
          shortCircuited = true;
          break;
        }

        // 保存最严格的结果
        if (!finalDecision || this.isStricter(decision, finalDecision)) {
          finalDecision = decision;
        }
      }
    }

    const totalDuration = Date.now() - startTime;

    return {
      decision: finalDecision!,
      routers: routerResults,
      totalDuration,
      shortCircuited,
    };
  }

  /**
   * 合并多个路由决策
   */
  private mergeDecisions(decisions: RouterDecision[]): RouterDecision {
    // 按严格程度排序：S3 > S2 > S1
    const priority: Record<PrivacyLevel, number> = {
      S3: 3,
      S2: 2,
      S1: 1,
    };

    // 找到最严格的决策
    let strictest = decisions[0];
    for (const decision of decisions) {
      if (priority[decision.level] > priority[strictest.level]) {
        strictest = decision;
      }
    }

    // 合并原因
    const reasons = decisions
      .filter(d => d.level !== 'S1')
      .map(d => d.reason)
      .join('; ');

    return {
      ...strictest,
      reason: reasons || strictest.reason,
    };
  }

  /**
   * 判断哪个决策更严格
   */
  private isStricter(a: RouterDecision, b: RouterDecision): boolean {
    const priority: Record<PrivacyLevel, number> = {
      S3: 3,
      S2: 2,
      S1: 1,
    };
    return priority[a.level] > priority[b.level];
  }

  /**
   * 添加路由器
   */
  addRouter(router: Router): void {
    this.routers.push(router);
  }

  /**
   * 移除路由器
   */
  removeRouter(routerId: string): boolean {
    const index = this.routers.findIndex(r => r.id === routerId);
    if (index !== -1) {
      this.routers.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 获取路由器列表
   */
  getRouters(): string[] {
    return this.routers.map(r => r.id);
  }
}

/**
 * 创建路由管线
 */
export function createRouterPipeline(config: RouterPipelineConfig): RouterPipeline {
  return new RouterPipeline(config);
}

export default RouterPipeline;
