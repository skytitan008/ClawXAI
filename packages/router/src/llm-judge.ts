/**
 * LLM-as-Judge 复杂度判断模块
 * 
 * 使用本地 LLM (Ollama/MiniCPM) 判断任务复杂度
 * 支持缓存机制 (5 分钟 TTL)
 */

export type ComplexityLevel = 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'REASONING';

export interface LLMJudgeConfig {
  /** LLM 端点 URL */
  endpoint?: string;
  /** 模型名称 */
  model?: string;
  /** 缓存 TTL (毫秒) */
  cacheTTL?: number;
  /** 超时时间 (毫秒) */
  timeout?: number;
  /** 是否启用缓存 */
  enableCache?: boolean;
}

export interface ComplexityCache {
  complexity: ComplexityLevel;
  timestamp: number;
  confidence: number;
}

export interface LLMJudgeResult {
  complexity: ComplexityLevel;
  confidence: number;
  reasoning: string;
  source: 'llm' | 'fallback' | 'cache';
}

/**
 * LLM-as-Judge 复杂度判断器
 */
export class LLMComplexityJudge {
  private endpoint: string;
  private model: string;
  private cache: Map<string, ComplexityCache>;
  private cacheTTL: number;
  private timeout: number;
  private enableCache: boolean;

  constructor(config: LLMJudgeConfig = {}) {
    this.endpoint = config.endpoint || 'http://localhost:11434';
    this.model = config.model || 'minicpm:latest';
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 5 * 60 * 1000; // 5 分钟
    this.timeout = config.timeout || 10000; // 10 秒
    this.enableCache = config.enableCache ?? true;
  }

  /**
   * 判断任务复杂度
   */
  async judge(message: string): Promise<LLMJudgeResult> {
    const cacheKey = this.hash(message);

    // 检查缓存
    if (this.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        console.log(`[LLMJudge] Cache hit: ${cached.complexity}`);
        return {
          complexity: cached.complexity,
          confidence: cached.confidence,
          reasoning: 'From cache',
          source: 'cache',
        };
      }
    }

    try {
      // 调用 LLM 判断
      const result = await this.callLLM(message);
      
      // 缓存结果
      if (this.enableCache) {
        this.cache.set(cacheKey, {
          complexity: result.complexity,
          timestamp: Date.now(),
          confidence: result.confidence,
        });
        this.cleanupCache();
      }

      return result;
    } catch (error) {
      console.warn(`[LLMJudge] LLM call failed, using fallback: ${error}`);
      // Fallback: 使用规则判断
      const fallback = this.fallbackJudge(message);
      return {
        ...fallback,
        source: 'fallback',
      };
    }
  }

  /**
   * 调用 LLM API
   */
  private async callLLM(message: string): Promise<LLMJudgeResult> {
    const prompt = this.buildPrompt(message);

    const response = await fetch(`${this.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 100,
        },
      }),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseLLMResponse(data.response);
  }

  /**
   * 构建提示词
   */
  private buildPrompt(message: string): string {
    return `You are a task complexity classifier. Classify the following user message into one of four categories:

- SIMPLE: Simple greetings, basic questions, short responses (<15 words)
- MEDIUM: Multi-sentence questions, moderate complexity (15-50 words)
- COMPLEX: Code generation, multi-step tasks, detailed analysis (>50 words)
- REASONING: Math problems, logical reasoning, "why/how" questions requiring deep thinking

Message: "${message}"

Respond with ONLY the category name (SIMPLE/MEDIUM/COMPLEX/REASONING) and a confidence score (0-100), like:
COMPLEX 85`;
  }

  /**
   * 解析 LLM 响应
   */
  private parseLLMResponse(response: string): LLMJudgeResult {
    const lines = response.trim().split('\n');
    const firstLine = lines[0].trim().toUpperCase();

    // 提取复杂度和置信度
    const match = firstLine.match(/(SIMPLE|MEDIUM|COMPLEX|REASONING)\s+(\d+)/);
    if (match) {
      const complexity = match[1] as ComplexityLevel;
      const confidence = parseInt(match[2]) / 100;
      return {
        complexity,
        confidence: Math.min(1, Math.max(0, confidence)),
        reasoning: lines.slice(1).join('\n').trim(),
        source: 'llm',
      };
    }

    // Fallback: 仅从响应中提取复杂度
    for (const level of ['REASONING', 'COMPLEX', 'MEDIUM', 'SIMPLE']) {
      if (firstLine.includes(level)) {
        return {
          complexity: level as ComplexityLevel,
          confidence: 0.7,
          reasoning: 'Parsed from response',
          source: 'llm',
        };
      }
    }

    // 默认
    return {
      complexity: 'MEDIUM',
      confidence: 0.5,
      reasoning: 'Default classification',
      source: 'llm',
    };
  }

  /**
   * Fallback: 基于规则的判断
   */
  private fallbackJudge(message: string): LLMJudgeResult {
    const wordCount = message.split(/\s+/).length;
    const hasCode = /```|function|class|import|from|const|let|var/.test(message);
    const hasReasoning = /\b(why|how|explain|analyze|compare|calculate|solve|prove|为什么 | 如何 | 解释 | 分析 | 比较 | 计算 | 解决 | 证明)\b/i.test(message);
    const hasMath = /\b\d+\s*[\+\-\*\/]\s*\d+\b/.test(message);
    const sentences = message.split(/[.!?！？]+/).filter(s => s.trim().length > 0).length;

    // REASONING: 推理/数学/深度分析
    if (hasReasoning && (wordCount > 20 || hasMath)) {
      return {
        complexity: 'REASONING',
        confidence: 0.85,
        reasoning: 'Reasoning keywords detected',
        source: 'fallback',
      };
    }

    // COMPLEX: 代码生成或多步骤任务
    if (hasCode || wordCount > 60 || sentences > 4) {
      return {
        complexity: 'COMPLEX',
        confidence: 0.8,
        reasoning: 'Code or long message detected',
        source: 'fallback',
      };
    }

    // MEDIUM: 中等复杂度
    if (wordCount > 12 || sentences > 2) {
      return {
        complexity: 'MEDIUM',
        confidence: 0.75,
        reasoning: 'Medium length message',
        source: 'fallback',
      };
    }

    // SIMPLE: 简单问候或问题
    return {
      complexity: 'SIMPLE',
      confidence: 0.9,
      reasoning: 'Short simple message',
      source: 'fallback',
    };
  }

  /**
   * 哈希函数
   */
  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `judge_${Math.abs(hash)}`;
  }

  /**
   * 清理过期缓存
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; entries: number } {
    const now = Date.now();
    let valid = 0;
    for (const [, value] of this.cache.entries()) {
      if (now - value.timestamp < this.cacheTTL) {
        valid++;
      }
    }
    return {
      size: this.cache.size,
      entries: valid,
    };
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * 创建默认 LLM Judge
 */
export function createLLMJudge(config: LLMJudgeConfig = {}): LLMComplexityJudge {
  return new LLMComplexityJudge(config);
}

export default LLMComplexityJudge;
