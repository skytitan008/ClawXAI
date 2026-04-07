/**
 * ClawXAI Telegram Channel Adapter
 * 
 * 集成 Telegram 机器人到 ClawXAI
 */

import { Telegraf, Context } from 'telegraf';
import type { ChannelAdapter, Message } from '@clawxai/core';

export interface TelegramConfig {
  token: string;
  webhookUrl?: string;
}

export class TelegramChannel implements ChannelAdapter {
  name = 'telegram';
  private bot: Telegraf<Context>;
  private messageCallback?: (message: Message) => void;
  private config: TelegramConfig;

  constructor(config: TelegramConfig) {
    this.config = config;
    this.bot = new Telegraf(config.token);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.bot.start((ctx) => {
      console.log(`[Telegram] User ${ctx.from?.username} started the bot`);
      ctx.reply('👋 Welcome to ClawXAI! Send me a message.');
    });

    this.bot.on('message', async (ctx) => {
      // 忽略机器人消息
      if (ctx.from?.is_bot) return;

      const text = ctx.message?.text;
      if (!text) return;

      // 转换为 ClawXAI Message 格式
      const clawxaiMessage: Message = {
        id: ctx.message.message_id.toString(),
        role: 'user',
        content: text,
        timestamp: ctx.message.date * 1000,
        metadata: {
          chatId: ctx.chat?.id.toString(),
          userId: ctx.from?.id.toString(),
          username: ctx.from?.username,
          firstName: ctx.from?.first_name,
        },
      };

      // 调用消息回调
      if (this.messageCallback) {
        await this.messageCallback(clawxaiMessage);
      }
    });

    this.bot.on('error', (error) => {
      console.error('[Telegram] Error:', error);
    });
  }

  async connect(): Promise<void> {
    try {
      if (this.config.webhookUrl) {
        // Webhook 模式
        await this.bot.telegram.setWebhook(this.config.webhookUrl);
        await this.bot.launch({ webhook: { domain: this.config.webhookUrl } });
      } else {
        // 长轮询模式
        await this.bot.launch();
      }
      console.log('[Telegram] Connected successfully');
      
      // 优雅关闭
      process.once('SIGINT', () => this.bot.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    } catch (error) {
      console.error('[Telegram] Connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.bot.stop();
    console.log('[Telegram] Disconnected');
  }

  async sendMessage(message: Message): Promise<void> {
    const chatId = message.metadata?.chatId;
    if (!chatId) {
      console.warn('[Telegram] No chat ID, cannot send message');
      return;
    }

    try {
      await this.bot.telegram.sendMessage(chatId, message.content);
      console.log('[Telegram] Message sent');
    } catch (error) {
      console.error('[Telegram] Failed to send message:', error);
      throw error;
    }
  }

  onMessage(callback: (message: Message) => void): void {
    this.messageCallback = callback;
    console.log('[Telegram] Message handler registered');
  }
}

/**
 * 创建 Telegram 渠道适配器
 */
export function createTelegramChannel(config: TelegramConfig): TelegramChannel {
  return new TelegramChannel(config);
}

export default createTelegramChannel;
