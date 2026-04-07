/**
 * ClawXAI Memory - 融合 EdgeClaw ClawXMemory 的三层记忆系统
 * 
 * @module @clawxai/memory
 */

export type MemoryLevel = 'L0' | 'L1' | 'L2';

export interface MemoryFragment {
  id: string;
  level: MemoryLevel;
  content: string;
  topics: string[];
  emotions?: EmotionTag[];
  timestamp: number;
  metadata: Record<string, any>;
}

export interface EmotionTag {
  type: string;
  intensity: number;
  source?: string;
}

export interface RetrievalContext {
  userId?: string;
  workspaceId?: string;
  currentProject?: string;
}

export interface RetrievalResult {
  level: MemoryLevel;
  confidence: number;
  memories: MemoryItem[];
  relatedTopics?: string[];
  fragments?: MemoryFragment[];
  raw?: boolean;
}

export interface MemoryItem {
  id: string;
  content: string;
  score?: number;
}

export interface MemoryEvent {
  type: string;
  timestamp: number;
}

export interface ConversationEndEvent extends MemoryEvent {
  type: 'conversation-end';
  messages: Message[];
  metadata: ConversationMetadata;
  duration: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ConversationMetadata {
  userId?: string;
  workspaceId?: string;
  topics?: string[];
}

/**
 * 记忆存储器接口
 */
export interface MemoryRepository {
  saveFragment(fragment: MemoryFragment): Promise<void>;
  getFragment(id: string): Promise<MemoryFragment | null>;
  getFragments(filters: FragmentFilters): Promise<MemoryFragment[]>;
  getConversations(filters: ConversationFilters): Promise<ConversationRecord[]>;
  getProjects(): Promise<Project[]>;
  getTimelines(): Promise<Timeline[]>;
  getUserProfile(): Promise<UserProfile>;
  updateUserProfile(profile: Partial<UserProfile>): Promise<void>;
  getStats(): Promise<MemoryStats>;
  getRecent(limit: number): Promise<MemoryFragment[]>;
  getTopicCloud(): Promise<TopicCloudItem[]>;
}

export interface FragmentFilters {
  topics?: string[];
  level?: MemoryLevel;
  timeRange?: { start: number; end: number };
}

export interface ConversationFilters {
  fragmentIds?: string[];
  timeRange?: { start: number; end: number };
}

export interface ConversationRecord {
  id: string;
  messages: Message[];
  timestamp: number;
  metadata: ConversationMetadata;
}

export interface Project {
  id: string;
  name: string;
  timelines: Timeline[];
}

export interface Timeline {
  id: string;
  name: string;
  fragments: MemoryFragment[];
}

export interface UserProfile {
  id: string;
  preferences?: string[];
  emotions?: EmotionTag[];
  createdAt: number;
  updatedAt: number;
}

export interface MemoryStats {
  total: number;
  l2Count: number;
  l1Count: number;
  l0Count: number;
  lastDreamAt?: number;
}

export interface TopicCloudItem {
  topic: string;
  count: number;
  weight: number;
}

/**
 * 简易内存实现 (基于文件)
 */
export class SimpleMemoryRepository implements MemoryRepository {
  private fragments: Map<string, MemoryFragment> = new Map();
  private conversations: Map<string, ConversationRecord> = new Map();
  private userProfile: UserProfile | null = null;

  async saveFragment(fragment: MemoryFragment): Promise<void> {
    this.fragments.set(fragment.id, fragment);
    console.log(`[MemoryRepository] Saved fragment ${fragment.id} (L${fragment.level})`);
  }

  async getFragment(id: string): Promise<MemoryFragment | null> {
    return this.fragments.get(id) || null;
  }

  async getFragments(filters: FragmentFilters): Promise<MemoryFragment[]> {
    let results = Array.from(this.fragments.values());

    if (filters.topics) {
      results = results.filter(f => 
        f.topics.some(t => filters.topics!.includes(t))
      );
    }

    if (filters.level) {
      results = results.filter(f => f.level === filters.level);
    }

    return results;
  }

  async getConversations(filters: ConversationFilters): Promise<ConversationRecord[]> {
    return Array.from(this.conversations.values());
  }

  async getProjects(): Promise<Project[]> {
    return [];
  }

  async getTimelines(): Promise<Timeline[]> {
    return [];
  }

  async getUserProfile(): Promise<UserProfile> {
    if (!this.userProfile) {
      this.userProfile = {
        id: 'default',
        preferences: [],
        emotions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }
    return this.userProfile;
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    const current = await this.getUserProfile();
    this.userProfile = {
      ...current,
      ...profile,
      updatedAt: Date.now(),
    };
  }

  async getStats(): Promise<MemoryStats> {
    const fragments = Array.from(this.fragments.values());
    return {
      total: fragments.length,
      l2Count: fragments.filter(f => f.level === 'L2').length,
      l1Count: fragments.filter(f => f.level === 'L1').length,
      l0Count: fragments.filter(f => f.level === 'L0').length,
    };
  }

  async getRecent(limit: number): Promise<MemoryFragment[]> {
    return Array.from(this.fragments.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async getTopicCloud(): Promise<TopicCloudItem[]> {
    const topicCount = new Map<string, number>();
    
    for (const fragment of this.fragments.values()) {
      for (const topic of fragment.topics) {
        topicCount.set(topic, (topicCount.get(topic) || 0) + 1);
      }
    }

    const maxCount = Math.max(...topicCount.values(), 1);
    
    return Array.from(topicCount.entries()).map(([topic, count]) => ({
      topic,
      count,
      weight: count / maxCount,
    }));
  }

  async addConversation(record: ConversationRecord): Promise<void> {
    this.conversations.set(record.id, record);
  }
}

/**
 * ClawXAI Memory - 三层记忆系统
 */
export class ClawXAIMemory {
  private repository: MemoryRepository;

  constructor(repository?: MemoryRepository) {
    this.repository = repository || new SimpleMemoryRepository();
  }

  /**
   * 记忆检索 - 沿"记忆树"推理导航
   */
  async retrieve(query: string, context: RetrievalContext = {}): Promise<RetrievalResult> {
    console.log(`[ClawXAIMemory] Retrieving for: "${query}"`);

    // Step 1: 先从高层记忆 (L2) 评估相关性
    const l2Results = await this.retrieveL2(query, context);
    if (l2Results.confidence > 0.8) {
      console.log(`[ClawXAIMemory] Found high-confidence L2 memory`);
      return l2Results;
    }

    // Step 2: 向下钻取 L1 记忆片段
    const l1Results = await this.retrieveL1(query, l2Results.relatedTopics || []);
    if (l1Results.confidence > 0.7) {
      console.log(`[ClawXAIMemory] Found relevant L1 memory`);
      return l1Results;
    }

    // Step 3: 追溯到具体对话 (L0)
    const l0Results = await this.retrieveL0(l1Results.fragments || []);
    console.log(`[ClawXAIMemory] Retrieved from L0 raw conversations`);
    
    return l0Results;
  }

  private async retrieveL2(query: string, context: RetrievalContext): Promise<RetrievalResult> {
    // 检索项目记忆和时间线记忆
    const projects = await this.repository.getProjects();
    const timelines = await this.repository.getTimelines();
    const userProfile = await this.repository.getUserProfile();

    // 简单关键词匹配 (实际应该用 LLM)
    const queryLower = query.toLowerCase();
    const relatedTopics: string[] = [];

    // 从用户画像中提取话题
    if (userProfile.preferences) {
      for (const pref of userProfile.preferences) {
        if (pref.toLowerCase().includes(queryLower)) {
          relatedTopics.push(pref);
        }
      }
    }

    const confidence = relatedTopics.length > 0 ? 0.5 : 0.3;

    return {
      level: 'L2',
      confidence,
      memories: [],
      relatedTopics,
    };
  }

  private async retrieveL1(query: string, topics: string[]): Promise<RetrievalResult> {
    // 检索记忆片段
    const fragments = await this.repository.getFragments({ topics });
    
    // 简单匹配
    const queryLower = query.toLowerCase();
    const matches = fragments.filter(f => 
      f.content.toLowerCase().includes(queryLower) ||
      f.topics.some(t => t.toLowerCase().includes(queryLower))
    );

    const bestScore = matches.length > 0 ? 0.7 : 0.4;

    return {
      level: 'L1',
      confidence: bestScore,
      memories: matches.map(f => ({ id: f.id, content: f.content })),
      fragments: matches,
    };
  }

  private async retrieveL0(fragments: MemoryFragment[]): Promise<RetrievalResult> {
    // 追溯到原始对话
    const conversations = await this.repository.getConversations({});

    return {
      level: 'L0',
      confidence: 1.0,
      memories: conversations.map(c => ({ id: c.id, content: c.messages[0]?.content || '' })),
      raw: true,
    };
  }

  /**
   * 记忆构建 - 自动蒸馏、聚合、更新
   */
  async buildMemory(event: MemoryEvent): Promise<void> {
    switch (event.type) {
      case 'conversation-end':
        await this.handleConversationEnd(event as ConversationEndEvent);
        break;
    }
  }

  private async handleConversationEnd(event: ConversationEndEvent): Promise<void> {
    console.log(`[ClawXAIMemory] Conversation ended, extracting L1 memory`);

    // 提取关键信息
    const topics = event.metadata.topics || this.extractTopics(event.messages);
    const summary = this.generateSummary(event.messages);

    // 创建 L1 记忆片段
    const fragment: MemoryFragment = {
      id: this.generateId(),
      level: 'L1',
      content: summary,
      topics,
      timestamp: Date.now(),
      metadata: {
        duration: event.duration,
        messageCount: event.messages.length,
      },
    };

    await this.repository.saveFragment(fragment);
  }

  private extractTopics(messages: Message[]): string[] {
    // 简单实现：从消息中提取关键词
    const text = messages.map(m => m.content).join(' ');
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been']);
    const topics = words
      .filter(w => w.length > 4 && !stopWords.has(w))
      .slice(0, 5);
    return [...new Set(topics)];
  }

  private generateSummary(messages: Message[]): string {
    const userMessages = messages.filter(m => m.role === 'user');
    const lastMessage = userMessages[userMessages.length - 1];
    return lastMessage ? `User discussed: ${lastMessage.content.slice(0, 100)}...` : 'Conversation summary';
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * 获取记忆仪表板数据
   */
  async getDashboardData(): Promise<MemoryDashboard> {
    const stats = await this.repository.getStats();
    const recentMemories = await this.repository.getRecent(20);
    const topicCloud = await this.repository.getTopicCloud();

    return {
      overview: stats,
      recentMemories,
      topicCloud,
    };
  }
}

export interface MemoryDashboard {
  overview: MemoryStats;
  recentMemories: MemoryFragment[];
  topicCloud: TopicCloudItem[];
}

/**
 * 创建默认 ClawXAI 记忆系统
 * 
 * @param dbPath - 可选的 SQLite 数据库路径 (实验性功能)
 *                 如果未指定或 SQLite 不可用，将使用内存存储
 */
export function createClawXAIMemory(dbPath?: string): ClawXAIMemory {
  // 尝试使用 SQLite (实验性)
  if (dbPath) {
    try {
      const { SQLiteMemoryRepository } = require('./sqlite-repository');
      const repository = new SQLiteMemoryRepository(dbPath);
      console.log(`[Memory] ✅ Using SQLite storage: ${dbPath}`);
      return new ClawXAIMemory(repository);
    } catch (error) {
      console.warn(`[Memory] ⚠️  SQLite not available (experimental feature)`);
      console.warn(`[Memory] ℹ️  Falling back to in-memory storage`);
    }
  }
  
  // 默认使用内存存储 (稳定)
  const repository = new SimpleMemoryRepository();
  console.log('[Memory] ✅ Using in-memory storage (stable)');
  return new ClawXAIMemory(repository);
}

// 导出默认
export default createClawXAIMemory;
