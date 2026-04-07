/**
 * ClawXAI Core - 基于 OpenClaw 的核心引擎
 * 
 * @module @clawxai/core
 */

import { loadConfig, type ClawXAIConfig as AppConfig } from './config';
import { createClawXAIRouter, type Router, type RouterDecision, type DetectionContext } from '@clawxai/router';
import { createClawXAIMemory, type ClawXAIMemory, type MemoryEvent } from '@clawxai/memory';

export interface ClawXAIConfig {
  router?: Router;
  memory?: ClawXAIMemory;
  channels?: string[];
  config?: AppConfig;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ConversationContext {
  userId: string;
  workspaceId: string;
  messages: Message[];
}

/**
 * ClawXAI 核心引擎
 */
export class ClawAIEngine {
  private router: Router;
  private memory: ClawXAIMemory;
  private config: AppConfig;
  private channels: Map<string, ChannelAdapter>;

  constructor(config: ClawXAIConfig = {}) {
    // 加载配置文件
    this.config = config.config || loadConfig();
    
    // 创建或使用提供的路由器和记忆
    this.router = config.router || createClawXAIRouter();
    this.memory = config.memory || createClawXAIMemory(
      this.config.memory.storage === 'sqlite' ? this.config.memory.dbPath : undefined
    );
    this.channels = new Map();
    
    console.log('[ClawXAI] Engine initialized with config');
  }

  /**
   * 处理用户消息
   */
  async handleMessage(context: ConversationContext): Promise<Message> {
    const lastMessage = context.messages[context.messages.length - 1];

    // Step 1: 路由决策
    const routerDecision = await this.router.detect({
      message: lastMessage.content,
      userId: context.userId,
      workspaceId: context.workspaceId,
    });

    if (this.config.logging.verboseRouter) {
      console.log(`[ClawXAI] Router decision: ${routerDecision.level} - ${routerDecision.action}`);
    }

    // Step 2: 根据路由决策处理
    let response: Message;
    
    if (routerDecision.action === 'local-only') {
      response = await this.handleLocal(context, lastMessage);
    } else if (routerDecision.action === 'redirect') {
      response = await this.handleCloud(context, lastMessage, routerDecision);
    } else {
      response = await this.handleDefault(context, lastMessage);
    }

    // Step 3: 构建记忆
    if (this.config.memory.autoBuild) {
      await this.memory.buildMemory({
        type: 'conversation-end',
        timestamp: Date.now(),
        messages: [...context.messages, response],
        metadata: { userId: context.userId, workspaceId: context.workspaceId },
        duration: Date.now() - lastMessage.timestamp,
      } as any);
    }

    return response;
  }

  private async handleLocal(context: ConversationContext, message: Message): Promise<Message> {
    // 本地处理 (隐私敏感)
    console.log('[ClawXAI] Processing locally (privacy-sensitive)');
    return {
      id: this.generateId(),
      role: 'assistant',
      content: '[Local Mode] This message contains sensitive data and was processed locally.',
      timestamp: Date.now(),
    };
  }

  private async handleCloud(
    context: ConversationContext,
    message: Message,
    decision: RouterDecision
  ): Promise<Message> {
    // 云端处理 (成本优化)
    const target = decision.target!;
    console.log(`[ClawXAI] Routing to ${target.provider}/${target.model}`);
    
    return {
      id: this.generateId(),
      role: 'assistant',
      content: `[Cloud Mode] Routed to ${target.model} for processing.`,
      timestamp: Date.now(),
      metadata: { routedTo: target },
    };
  }

  private async handleDefault(context: ConversationContext, message: Message): Promise<Message> {
    // 默认处理
    return {
      id: this.generateId(),
      role: 'assistant',
      content: '[Default Mode] Message processed.',
      timestamp: Date.now(),
    };
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * 注册消息渠道
   */
  registerChannel(name: string, adapter: ChannelAdapter): void {
    this.channels.set(name, adapter);
    console.log(`[ClawXAI] Registered channel: ${name}`);
  }

  /**
   * 获取记忆仪表板
   */
  async getMemoryDashboard() {
    return await this.memory.getDashboardData();
  }

  /**
   * 获取配置
   */
  getConfig(): AppConfig {
    return this.config;
  }
}

export interface ChannelAdapter {
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(message: Message): Promise<void>;
  onMessage(callback: (message: Message) => void): void;
}

/**
 * 创建 ClawXAI 引擎实例
 */
export async function createClawAI(config: ClawXAIConfig = {}): Promise<ClawAIEngine> {
  const engine = new ClawAIEngine(config);
  return engine;
}

// 导出默认
export default createClawAI;

// 重新导出配置相关
export { loadConfig, saveConfig, createExampleConfig } from './config';
export type { ClawXAIConfig as AppConfig };

// 导出 Dashboard
export { createDashboardServer, getDashboardStore } from './dashboard';
export type { DashboardData } from './dashboard';
