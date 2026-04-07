/**
 * 用户系统 v3.2.0
 * 
 * 用户认证/配置同步/成就系统
 */

export interface User {
  /** 用户 ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email: string;
  /** 头像 */
  avatar?: string;
  /** 等级 */
  level: number;
  /** 经验值 */
  experience: number;
  /** 成就 */
  achievements: string[];
  /** 配置 */
  config: Record<string, any>;
  /** 创建时间 */
  createdAt: number;
  /** 最后活跃 */
  lastActiveAt: number;
}

export interface OAuthConfig {
  /** GitHub OAuth */
  github?: { clientId: string; clientSecret: string };
  /** Google OAuth */
  google?: { clientId: string; clientSecret: string };
  /** Discord OAuth */
  discord?: { clientId: string; clientSecret: string };
}

/**
 * 用户认证系统
 */
export class UserAuth {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, string> = new Map(); // sessionId -> userId
  private oauthConfig: OAuthConfig;

  constructor(oauthConfig: OAuthConfig = {}) {
    this.oauthConfig = oauthConfig;
  }

  /**
   * 注册
   */
  register(username: string, email: string, password: string): User {
    console.log(`[UserAuth] Registering user: ${username}`);

    // 检查用户是否存在
    for (const user of this.users.values()) {
      if (user.username === username || user.email === email) {
        throw new Error('User already exists');
      }
    }

    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      email,
      level: 1,
      experience: 0,
      achievements: [],
      config: {},
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };

    this.users.set(user.id, user);
    console.log(`[UserAuth] User registered: ${user.id}`);

    return user;
  }

  /**
   * 登录
   */
  login(email: string, password: string): string {
    console.log(`[UserAuth] Login attempt: ${email}`);

    // 查找用户
    let user: User | undefined;
    for (const u of this.users.values()) {
      if (u.email === email) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new Error('User not found');
    }

    // 验证密码 (实际实现需要哈希验证)
    // if (!verifyPassword(password, user.passwordHash)) {
    //   throw new Error('Invalid password');
    // }

    // 创建会话
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessions.set(sessionId, user.id);
    user.lastActiveAt = Date.now();

    console.log(`[UserAuth] Login successful: ${user.id}`);
    return sessionId;
  }

  /**
   * OAuth 登录
   */
  async oauthLogin(provider: 'github' | 'google' | 'discord', code: string): Promise<string> {
    console.log(`[UserAuth] OAuth login: ${provider}`);

    // 实际实现调用 OAuth provider API
    // const userInfo = await fetchOAuthUserInfo(provider, code);
    // const user = this.findOrCreateUser(userInfo);
    // const sessionId = this.createSession(user);

    const sessionId = `oauth_session_${provider}_${Date.now()}`;
    console.log(`[UserAuth] OAuth login successful: ${sessionId}`);
    return sessionId;
  }

  /**
   * 登出
   */
  logout(sessionId: string): void {
    this.sessions.delete(sessionId);
    console.log(`[UserAuth] Logout: ${sessionId}`);
  }

  /**
   * 验证会话
   */
  validateSession(sessionId: string): User | undefined {
    const userId = this.sessions.get(sessionId);
    if (!userId) {
      return undefined;
    }

    return this.users.get(userId);
  }

  /**
   * 获取用户
   */
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * 更新用户配置
   */
  updateUserConfig(userId: string, config: Record<string, any>): void {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.config = { ...user.config, ...config };
    console.log(`[UserAuth] User config updated: ${userId}`);
  }

  /**
   * 添加经验值
   */
  addExperience(userId: string, amount: number): void {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.experience += amount;

    // 升级逻辑
    const required = user.level * 100;
    while (user.experience >= required) {
      user.experience -= required;
      user.level++;
      console.log(`[UserAuth] User ${userId} leveled up to ${user.level}`);
    }
  }

  /**
   * 解锁成就
   */
  unlockAchievement(userId: string, achievementId: string): void {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.achievements.includes(achievementId)) {
      user.achievements.push(achievementId);
      console.log(`[UserAuth] Achievement unlocked: ${achievementId}`);
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalUsers: number;
    activeSessions: number;
  } {
    return {
      totalUsers: this.users.size,
      activeSessions: this.sessions.size,
    };
  }
}

/**
 * 创建用户认证系统
 */
export function createUserAuth(oauthConfig?: OAuthConfig): UserAuth {
  return new UserAuth(oauthConfig);
}

export default UserAuth;
