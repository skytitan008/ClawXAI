/**
 * SQLite 记忆存储
 * 
 * 使用 better-sqlite3 实现持久化存储
 * 支持 L0/L1/L2 三层记忆
 */

import Database from 'better-sqlite3';
import type { Memory, MemoryLevel } from './index';

export interface SQLiteMemoryConfig {
  /** 数据库路径 */
  dbPath: string;
  /** 是否自动创建表 */
  autoCreate?: boolean;
}

/**
 * SQLite 记忆存储
 */
export class SQLiteMemoryStorage {
  private db: Database.Database;
  private autoCreate: boolean;

  constructor(config: SQLiteMemoryConfig) {
    this.db = new Database(config.dbPath);
    this.autoCreate = config.autoCreate ?? true;

    if (this.autoCreate) {
      this.initializeTables();
    }
  }

  /**
   * 初始化数据库表
   */
  private initializeTables(): void {
    // L0: 原始对话
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories_l0 (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        workspace_id TEXT,
        role TEXT,
        content TEXT,
        timestamp INTEGER,
        metadata TEXT
      )
    `);

    // L1: 记忆片段
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories_l1 (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        summary TEXT,
        tags TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        metadata TEXT
      )
    `);

    // L2: 项目记忆/时间线
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories_l2 (
        id TEXT PRIMARY KEY,
        topic TEXT,
        timeline_start INTEGER,
        timeline_end INTEGER,
        key_points TEXT,
        summary TEXT,
        created_at INTEGER,
        metadata TEXT
      )
    `);

    // 创建索引
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_l0_user ON memories_l0(user_id);
      CREATE INDEX IF NOT EXISTS idx_l0_timestamp ON memories_l0(timestamp);
      CREATE INDEX IF NOT EXISTS idx_l1_created ON memories_l1(created_at);
      CREATE INDEX IF NOT EXISTS idx_l2_topic ON memories_l2(topic);
    `);

    console.log('[SQLiteMemory] Tables initialized');
  }

  /**
   * 保存 L0 记忆
   */
  saveL0(memory: Memory): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO memories_l0 
      (id, user_id, workspace_id, role, content, timestamp, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      memory.id,
      memory.userId || null,
      memory.workspaceId || null,
      memory.role,
      memory.content,
      memory.timestamp,
      JSON.stringify(memory.metadata || {}),
    );
  }

  /**
   * 保存 L1 记忆
   */
  saveL1(memory: Memory & { title?: string; summary?: string; tags?: string[] }): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO memories_l1 
      (id, title, content, summary, tags, created_at, updated_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      memory.id,
      memory.title || null,
      memory.content,
      memory.summary || null,
      JSON.stringify(memory.tags || []),
      memory.timestamp,
      Date.now(),
      JSON.stringify(memory.metadata || {}),
    );
  }

  /**
   * 保存 L2 记忆
   */
  saveL2(memory: Memory & { topic?: string; timeline_start?: number; timeline_end?: number; key_points?: string[] }): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO memories_l2 
      (id, topic, timeline_start, timeline_end, key_points, summary, created_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      memory.id,
      memory.topic || null,
      memory.timeline_start || memory.timestamp,
      memory.timeline_end || Date.now(),
      JSON.stringify(memory.key_points || []),
      memory.content,
      memory.timestamp,
      JSON.stringify(memory.metadata || {}),
    );
  }

  /**
   * 查询 L0 记忆
   */
  findL0(query: { userId?: string; limit?: number; offset?: number }): Memory[] {
    let sql = 'SELECT * FROM memories_l0';
    const params: any[] = [];

    if (query.userId) {
      sql += ' WHERE user_id = ?';
      params.push(query.userId);
    }

    sql += ' ORDER BY timestamp DESC';

    if (query.limit) {
      sql += ' LIMIT ?';
      params.push(query.limit);
    }

    if (query.offset) {
      sql += ' OFFSET ?';
      params.push(query.offset);
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      workspaceId: row.workspace_id,
      role: row.role,
      content: row.content,
      timestamp: row.timestamp,
      metadata: JSON.parse(row.metadata || '{}'),
    }));
  }

  /**
   * 查询 L1 记忆
   */
  findL1(query: { limit?: number; offset?: number }): Array<Memory & { title?: string; summary?: string; tags?: string[] }> {
    let sql = 'SELECT * FROM memories_l1 ORDER BY created_at DESC';
    const params: any[] = [];

    if (query.limit) {
      sql += ' LIMIT ?';
      params.push(query.limit);
    }

    if (query.offset) {
      sql += ' OFFSET ?';
      params.push(query.offset);
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      summary: row.summary,
      tags: JSON.parse(row.tags || '[]'),
      timestamp: row.created_at,
      metadata: JSON.parse(row.metadata || '{}'),
    }));
  }

  /**
   * 查询 L2 记忆
   */
  findL2(query: { topic?: string; limit?: number }): Array<Memory & { topic?: string; key_points?: string[] }> {
    let sql = 'SELECT * FROM memories_l2';
    const params: any[] = [];

    if (query.topic) {
      sql += ' WHERE topic = ?';
      params.push(query.topic);
    }

    sql += ' ORDER BY created_at DESC';

    if (query.limit) {
      sql += ' LIMIT ?';
      params.push(query.limit);
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      topic: row.topic,
      content: row.summary,
      key_points: JSON.parse(row.key_points || '[]'),
      timestamp: row.created_at,
      metadata: JSON.parse(row.metadata || '{}'),
    }));
  }

  /**
   * 删除记忆
   */
  delete(memoryId: string, level: MemoryLevel): boolean {
    const table = `memories_${level.toLowerCase()}`;
    const stmt = this.db.prepare(`DELETE FROM ${table} WHERE id = ?`);
    const result = stmt.run(memoryId);
    return result.changes > 0;
  }

  /**
   * 清空所有记忆
   */
  clear(): void {
    this.db.exec('DELETE FROM memories_l0');
    this.db.exec('DELETE FROM memories_l1');
    this.db.exec('DELETE FROM memories_l2');
    console.log('[SQLiteMemory] All memories cleared');
  }

  /**
   * 获取统计信息
   */
  getStats(): { l0: number; l1: number; l2: number } {
    const l0 = this.db.prepare('SELECT COUNT(*) as count FROM memories_l0').get() as any;
    const l1 = this.db.prepare('SELECT COUNT(*) as count FROM memories_l1').get() as any;
    const l2 = this.db.prepare('SELECT COUNT(*) as count FROM memories_l2').get() as any;

    return {
      l0: l0.count,
      l1: l1.count,
      l2: l2.count,
    };
  }

  /**
   * 备份数据库
   */
  backup(backupPath: string): void {
    const backup = this.db.backup(backupPath);
    console.log(`[SQLiteMemory] Database backed up to ${backupPath}`);
  }

  /**
   * 关闭数据库
   */
  close(): void {
    this.db.close();
    console.log('[SQLiteMemory] Database closed');
  }
}

/**
 * 创建 SQLite 记忆存储
 */
export function createSQLiteMemoryStorage(config: SQLiteMemoryConfig): SQLiteMemoryStorage {
  return new SQLiteMemoryStorage(config);
}

export default SQLiteMemoryStorage;
