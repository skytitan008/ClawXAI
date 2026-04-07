/**
 * ClawXAI Discord Channel Adapter
 * 
 * 集成 Discord 机器人到 ClawXAI
 */

import { Client, GatewayIntentBits, Partials, type Message as DiscordMessage } from 'discord.js';
import type { ChannelAdapter, Message } from '@clawxai/core';

export interface DiscordConfig {
  token: string;
  clientId: string;
  intents?: GatewayIntentBits[];
}

export class DiscordChannel implements ChannelAdapter {
  name = 'discord';
  private client: Client;
  private messageCallback?: (message: Message) => void;
  private config: DiscordConfig;

  constructor(config: DiscordConfig) {
    this.config = config;
    
    this.client = new Client({
      intents: config.intents || [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [Partials.Channel],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.once('ready', () => {
      console.log(`[Discord] Logged in as ${this.client.user?.tag}`);
    });

    this.client.on('messageCreate', async (message: DiscordMessage) => {
      // 忽略机器人消息
      if (message.author.bot) return;

      // 转换为 ClawXAI Message 格式
      const clawxaiMessage: Message = {
        id: message.id,
        role: 'user',
        content: message.content,
        timestamp: message.createdTimestamp,
        metadata: {
          channelId: message.channelId,
          guildId: message.guildId,
          authorId: message.author.id,
          authorName: message.author.username,
        },
      };

      // 调用消息回调
      if (this.messageCallback) {
        await this.messageCallback(clawxaiMessage);
      }
    });

    this.client.on('error', (error) => {
      console.error('[Discord] Error:', error);
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.login(this.config.token);
      console.log('[Discord] Connected successfully');
    } catch (error) {
      console.error('[Discord] Connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.client.destroy();
    console.log('[Discord] Disconnected');
  }

  async sendMessage(message: Message): Promise<void> {
    // 从 metadata 获取频道信息
    const channelId = message.metadata?.channelId;
    if (!channelId) {
      console.warn('[Discord] No channel ID, cannot send message');
      return;
    }

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel && 'send' in channel) {
        await channel.send(message.content);
        console.log('[Discord] Message sent');
      }
    } catch (error) {
      console.error('[Discord] Failed to send message:', error);
      throw error;
    }
  }

  onMessage(callback: (message: Message) => void): void {
    this.messageCallback = callback;
    console.log('[Discord] Message handler registered');
  }
}

/**
 * 创建 Discord 渠道适配器
 */
export function createDiscordChannel(config: DiscordConfig): DiscordChannel {
  return new DiscordChannel(config);
}

export default createDiscordChannel;
