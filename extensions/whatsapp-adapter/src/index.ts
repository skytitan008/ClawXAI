/**
 * @clawxai/whatsapp-adapter
 * 
 * WhatsApp 渠道适配器
 * 支持 WhatsApp Business API
 */

export interface WhatsAppAdapterConfig {
  /** WhatsApp Business API Token */
  accessToken: string;
  /** Phone Number ID */
  phoneNumberId: string;
  /** Business Account ID */
  businessAccountId: string;
  /** Webhook Verify Token */
  webhookVerifyToken?: string;
}

export interface WhatsAppMessage {
  /** 消息 ID */
  id: string;
  /** 发送者 ID */
  from: string;
  /** 消息类型 */
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  /** 消息内容 */
  text?: { body: string };
  /** 时间戳 */
  timestamp: number;
}

/**
 * WhatsApp 适配器
 */
export class WhatsAppAdapter {
  private config: WhatsAppAdapterConfig;
  private connected: boolean = false;

  constructor(config: WhatsAppAdapterConfig) {
    this.config = config;
  }

  /**
   * 连接到 WhatsApp
   */
  async connect(): Promise<void> {
    console.log('[WhatsAppAdapter] Connecting...');
    this.connected = true;
    console.log('[WhatsAppAdapter] Connected');
  }

  /**
   * 发送消息
   */
  async sendMessage(to: string, text: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected');
    }
    console.log(`[WhatsAppAdapter] Sending to ${to}: ${text}`);
    // 实际实现调用 WhatsApp Business API
  }

  /**
   * 接收消息
   */
  onMessage(callback: (message: WhatsAppMessage) => void): void {
    console.log('[WhatsAppAdapter] Message listener registered');
    // 实际实现监听 WhatsApp webhook
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('[WhatsAppAdapter] Disconnected');
  }

  /**
   * 获取连接状态
   */
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * 创建 WhatsApp 适配器
 */
export function createWhatsAppAdapter(config: WhatsAppAdapterConfig): WhatsAppAdapter {
  return new WhatsAppAdapter(config);
}

export default WhatsAppAdapter;
