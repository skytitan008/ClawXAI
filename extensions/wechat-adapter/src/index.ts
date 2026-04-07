/**
 * @clawxai/wechat-adapter
 * 
 * 微信渠道适配器
 * 支持微信公众号/企业微信
 */

export interface WeChatAdapterConfig {
  /** 微信公众号 AppID */
  appId: string;
  /** 微信公众号 AppSecret */
  appSecret: string;
  /** Token (用于验证) */
  token: string;
  /** EncodingAESKey */
  encodingAesKey?: string;
  /** 是否为企业微信 */
  isWork?: boolean;
}

export interface WeChatMessage {
  /** 消息 ID */
  msgId: string;
  /** 发送者微信 ID */
  fromUserName: string;
  /** 接收者微信 ID */
  toUserName: string;
  /** 消息类型 */
  msgType: 'text' | 'image' | 'voice' | 'video' | 'location' | 'link';
  /** 消息内容 */
  content?: string;
  /** 创建时间 */
  createTime: number;
}

/**
 * 微信适配器
 */
export class WeChatAdapter {
  private config: WeChatAdapterConfig;
  private accessToken?: string;
  private tokenExpiresAt?: number;
  private connected: boolean = false;

  constructor(config: WeChatAdapterConfig) {
    this.config = config;
  }

  /**
   * 连接到微信
   */
  async connect(): Promise<void> {
    console.log('[WeChatAdapter] Connecting...');
    await this.refreshAccessToken();
    this.connected = true;
    console.log('[WeChatAdapter] Connected');
  }

  /**
   * 刷新访问令牌
   */
  private async refreshAccessToken(): Promise<void> {
    // 实际实现调用微信 API 获取 access_token
    this.accessToken = 'mock_access_token';
    this.tokenExpiresAt = Date.now() + 7200 * 1000; // 2 小时
    console.log('[WeChatAdapter] Access token refreshed');
  }

  /**
   * 发送消息
   */
  async sendMessage(openId: string, text: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected');
    }
    console.log(`[WeChatAdapter] Sending to ${openId}: ${text}`);
    // 实际实现调用微信客服消息 API
  }

  /**
   * 接收消息
   */
  onMessage(callback: (message: WeChatMessage) => void): void {
    console.log('[WeChatAdapter] Message listener registered');
    // 实际实现监听微信服务器推送
  }

  /**
   * 验证服务器配置
   */
  verifyServer(signature: string, timestamp: string, nonce: string): boolean {
    const arr = [this.config.token, timestamp, nonce].sort();
    const hash = require('crypto').createHash('sha1').update(arr.join('')).digest('hex');
    return hash === signature;
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.accessToken = undefined;
    console.log('[WeChatAdapter] Disconnected');
  }

  /**
   * 获取连接状态
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * 获取访问令牌
   */
  getAccessToken(): string | undefined {
    if (!this.accessToken || (this.tokenExpiresAt && Date.now() > this.tokenExpiresAt)) {
      this.refreshAccessToken();
    }
    return this.accessToken;
  }
}

/**
 * 创建微信适配器
 */
export function createWeChatAdapter(config: WeChatAdapterConfig): WeChatAdapter {
  return new WeChatAdapter(config);
}

export default WeChatAdapter;
