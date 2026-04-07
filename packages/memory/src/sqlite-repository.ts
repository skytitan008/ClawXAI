/**
 * SQLite 记忆存储器
 * 
 * 使用 better-sqlite3 实现持久化存储
 * 支持 L0/L1/L2 三层记忆
 */

import Database from 'better-sqlite3';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type {
  MemoryRepository,
  MemoryFragment,
  FragmentFilters,
  ConversationRecord,
  Project,
  Timeline,
  UserProfile,
  MemoryStats,
  TopicCloudItem,
  Message,
} from './types';

export class SQLiteMemoryRepository implements MemoryRepository {
  private db: Database.Database;
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || join(homedir(), '.clawxai', 'memory.db');
    
    // 确保目录存在
    const { mkdirSync } = require('node:fs');
    const { dirname } = require('node:path');
    mkdirSync(dirname(this.dbPath), { recursive: true });
    
    this.db = new Database(this.dbPath);
    this.initSchema();
    
    console.log(`[SQLiteMemory] Database initialized at ${this.dbPath}`);
  }

  /**
   * 初始化数据库表结构
   */
  private initSchema(): void {
    // L0: 原始对话
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        workspace_id TEXT,
        messages TEXT,  -- JSON 数组
        topics TEXT,    -- JSON 数组
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );
      CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at);
    `);

    // L1: 记忆片段
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS fragments (
        id TEXT PRIMARY KEY,
        level TEXT DEFAULT 'L1',
        content TEXT,
        topics TEXT,    -- JSON 数组
        emotions TEXT,  -- JSON 数组
        conversation_id TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        metadata TEXT,  -- JSON 对象
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
      );
      CREATE INDEX IF NOT EXISTS idx_fragments_level ON fragments(level);
      CREATE INDEX IF NOT EXISTS idx_fragments_topics ON fragments(topics);
      CREATE INDEX IF NOT EXISTS idx_fragments_created ON fragments(created_at);
    `);

    // L2: 项目记忆
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT,
        user_id TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );
      CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
    `);

    // L2: 时间线
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS timelines (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        name TEXT,
        fragments TEXT,  -- JSON 数组
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (project_id) REFERENCES projects(id)
      );
      CREATE INDEX IF NOT EXISTS idx_timelines_project ON timelines(project_id);
    `);

    // 用户画像
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY DEFAULT 'default',
        preferences TEXT,  -- JSON 数组
        emotions TEXT,     -- JSON 数组
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );
    `);

    // 初始化默认用户画像
    const count = this.db.prepare('SELECT COUNT(*) as c FROM user_profiles').get() as { c: number };
    if (count.c === 0) {
      this.db.exec(`
        INSERT INTO user_profiles (id, preferences, emotions)
        VALUES ('default', '[]', '[]')
      `);
    }
  }

  async saveFragment(fragment: MemoryFragment): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO fragments (id, level, content, topics, emotions, conversation_id, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      fragment.id,
      fragment.level,
      fragment.content,
      JSON.stringify(fragment.topics),
      JSON.stringify(fragment.emotions || []),
      fragment.metadata?.conversationId || null,
      JSON.stringify(fragment.metadata || {}),
      fragment.timestamp
    );

    console.log(`[SQLiteMemory] Saved fragment ${fragment.id} (L${fragment.level})`);
  }

  async getFragment(id: string): Promise<MemoryFragment | null> {
    const row = this.db.prepare('SELECT * FROM fragments WHERE id = ?').get(id) as any;
    if (!row) return null;

    return this.rowToFragment(row);
  }

  async getFragments(filters: FragmentFilters): Promise<MemoryFragment[]> {
    let sql = 'SELECT * FROM fragments WHERE 1=1';
    const params: any[] = [];

    if (filters.topics && filters.topics.length > 0) {
      sql += ' AND topics LIKE ?';
      params.push(`%${filters.topics[0]}%`);
    }

    if (filters.level) {
      sql += ' AND level = ?';
      params.push(filters.level);
    }

    if (filters.timeRange) {
      sql += ' AND created_at BETWEEN ? AND ?';
      params.push(filters.timeRange.start, filters.timeRange.end);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map(row => this.rowToFragment(row));
  }

  async getConversations(filters: any): Promise<ConversationRecord[]> {
    let sql = 'SELECT * FROM conversations WHERE 1=1';
    const params: any[] = [];

    if (filters.timeRange) {
      sql += ' AND created_at BETWEEN ? AND ?';
      params.push(filters.timeRange.start, filters.timeRange.end);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map(row => ({
      id: row.id,
      messages: JSON.parse(row.messages),
      timestamp: row.created_at,
      metadata: {
        userId: row.user_id,
        workspaceId: row.workspace_id,
        topics: row.topics ? JSON.parse(row.topics) : [],
      },
    }));
  }

  async getProjects(): Promise<Project[]> {
    const rows = this.db.prepare('SELECT * FROM projects').all() as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      timelines: this.getTimelinesForProject(row.id),
    }));
  }

  private getTimelinesForProject(projectId: string): Timeline[] {
    const rows = this.db.prepare('SELECT * FROM timelines WHERE project_id = ?').all(projectId) as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      fragments: row.fragments ? JSON.parse(row.fragments) : [],
    }));
  }

  async getTimelines(): Promise<Timeline[]> {
    const rows = this.db.prepare('SELECT * FROM timelines').all() as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      fragments: row.fragments ? JSON.parse(row.fragments) : [],
    }));
  }

  async getUserProfile(): Promise<UserProfile> {
    const row = this.db.prepare('SELECT * FROM user_profiles WHERE id = ?').get('default') as any;
    if (!row) {
      return {
        id: 'default',
        preferences: [],
        emotions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    return {
      id: row.id,
      preferences: row.preferences ? JSON.parse(row.preferences) : [],
      emotions: row.emotions ? JSON.parse(row.emotions) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    const current = await this.getUserProfile();
    const updated = {
      ...current,
      ...profile,
      updatedAt: Date.now(),
    };

    this.db.prepare(`
      UPDATE user_profiles
      SET preferences = ?, emotions = ?, updated_at = ?
      WHERE id = 'default'
    `).run(
      JSON.stringify(updated.preferences),
      JSON.stringify(updated.emotions),
      updated.updatedAt
    );
  }

  async getStats(): Promise<MemoryStats> {
    const total = this.db.prepare('SELECT COUNT(*) as c FROM fragments').get() as { c: number };
    const l2Count = this.db.prepare("SELECT COUNT(*) as c FROM fragments WHERE level = 'L2'").get() as { c: number };
    const l1Count = this.db.prepare("SELECT COUNT(*) as c FROM fragments WHERE level = 'L1'").get() as { c: number };
    const l0Count = this.db.prepare("SELECT COUNT(*) as c FROM fragments WHERE level = 'L0'").get() as { c: number };

    return {
      total: total.c,
      l2Count: l2Count.c,
      l1Count: l1Count.c,
      l0Count: l0Count.c,
    };
  }

  async getRecent(limit: number): Promise<MemoryFragment[]> {
    const rows = this.db.prepare('SELECT * FROM fragments ORDER BY created_at DESC LIMIT ?').all(limit) as any[];
    return rows.map(row => this.rowToFragment(row));
  }

  async getTopicCloud(): Promise<TopicCloudItem[]> {
    const rows = this.db.prepare('SELECT topics FROM fragments').all() as { topics: string }[];
    const topicCount = new Map<string, number>();

    for (const row of rows) {
      const topics = JSON.parse(row.topics) as string[];
      for (const topic of topics) {
        topicCount.set(topic, (topicCount.get(topic) || 0) + 1);
      }
    }

    const maxCount = Math.max(...Array.from(topicCount.values()), 1);

    return Array.from(topicCount.entries()).map(([topic, count]) => ({
      topic,
      count,
      weight: count / maxCount,
    }));
  }

  async saveConversation(record: ConversationRecord): Promise<void> {
    this.db.prepare(`
      INSERT OR REPLACE INTO conversations (id, user_id, workspace_id, messages, topics, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      record.id,
      record.metadata.userId,
      record.metadata.workspaceId,
      JSON.stringify(record.messages),
      JSON.stringify(record.metadata.topics || []),
      record.timestamp
    );
  }

  private rowToFragment(row: any): MemoryFragment {
    return {
      id: row.id,
      level: row.level as MemoryFragment['level'],
      content: row.content,
      topics: row.topics ? JSON.parse(row.topics) : [],
      emotions: row.emotions ? JSON.parse(row.emotions) : [],
      timestamp: row.created_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    };
  }

  close(): void {
    this.db.close();
    console.log('[SQLiteMemory] Database closed');
  }
}
