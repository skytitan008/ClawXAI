/**
 * Long-Term Memory System
 * Inspired by PAI's memory architecture
 */

import type { Memory, MemoryType, MemoryConfig } from "./types.js";

export class LongTermMemory {
  private config: MemoryConfig;
  private memories: Map<string, Memory> = new Map();
  private importanceQueue: Memory[] = [];
  private consolidationTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<MemoryConfig>) {
    this.config = {
      enabled: config?.enabled ?? true,
      autoConsolidate: config?.autoConsolidate ?? true,
      consolidationInterval: config?.consolidationInterval ?? 300000, // 5 min
      maxMemories: config?.maxMemories ?? 1000,
      importanceThreshold: config?.importanceThreshold ?? 0.5,
      storage: config?.storage ?? "memory",
      sqlitePath: config?.sqlitePath,
    };

    if (this.config.autoConsolidate) {
      this.startConsolidation();
    }
  }

  /**
   * Store a new memory
   */
  async store(
    content: string,
    type: MemoryType,
    metadata: any = {},
    importance?: number,
  ): Promise<Memory> {
    const memory: Memory = {
      id: this.generateId(),
      type,
      content,
      metadata: {
        source: metadata.source || "user",
        confidence: metadata.confidence ?? 0.9,
        language: metadata.language || "zh-CN",
        entities: metadata.entities || [],
        relations: metadata.relations || [],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      accessedAt: Date.now(),
      accessCount: 0,
      importance: importance ?? this.calculateImportance(content, type),
      tags: metadata.tags || [],
    };

    this.memories.set(memory.id, memory);
    this.updateImportanceQueue(memory);

    console.log("[LTM] Memory stored:", memory.id, "type:", type);

    return memory;
  }

  /**
   * Retrieve memories by query
   */
  async retrieve(
    query: string,
    options?: {
      type?: MemoryType;
      limit?: number;
      minImportance?: number;
      tags?: string[];
    },
  ): Promise<Memory[]> {
    let results = Array.from(this.memories.values());

    // Filter by type
    if (options?.type) {
      results = results.filter((m) => m.type === options.type);
    }

    // Filter by importance
    if (options?.minImportance) {
      results = results.filter((m) => m.importance >= options.minImportance);
    }

    // Filter by tags
    if (options?.tags?.length) {
      results = results.filter((m) => options.tags!.some((tag) => m.tags.includes(tag)));
    }

    // Search in content
    if (query) {
      results = results.filter((m) => m.content.toLowerCase().includes(query.toLowerCase()));
    }

    // Sort by importance and recency
    results.sort((a, b) => {
      const scoreA = a.importance * 0.7 + a.accessCount * 0.3;
      const scoreB = b.importance * 0.7 + b.accessCount * 0.3;
      return scoreB - scoreA;
    });

    // Update access time
    results.forEach((m) => {
      m.accessedAt = Date.now();
      m.accessCount++;
    });

    return results.slice(0, options?.limit || 10);
  }

  /**
   * Delete a memory
   */
  async delete(memoryId: string): Promise<boolean> {
    const deleted = this.memories.delete(memoryId);
    if (deleted) {
      this.removeFromImportanceQueue(memoryId);
      console.log("[LTM] Memory deleted:", memoryId);
    }
    return deleted;
  }

  /**
   * Update a memory
   */
  async update(memoryId: string, updates: Partial<Memory>): Promise<Memory | null> {
    const memory = this.memories.get(memoryId);
    if (!memory) return null;

    Object.assign(memory, updates);
    memory.updatedAt = Date.now();

    console.log("[LTM] Memory updated:", memoryId);
    return memory;
  }

  /**
   * Consolidate memories (cleanup, merge, optimize)
   */
  async consolidate(): Promise<void> {
    console.log("[LTM] Starting consolidation...");

    // Remove low-importance old memories
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    for (const [id, memory] of this.memories.entries()) {
      if (
        memory.importance < this.config.importanceThreshold &&
        memory.createdAt < oneWeekAgo &&
        memory.accessCount === 0
      ) {
        await this.delete(id);
      }
    }

    // Enforce max memories limit
    if (this.memories.size > this.config.maxMemories) {
      const sorted = Array.from(this.memories.values()).sort((a, b) => a.importance - b.importance);

      const toDelete = sorted.slice(0, sorted.length - this.config.maxMemories);
      for (const memory of toDelete) {
        await this.delete(memory.id);
      }
    }

    console.log("[LTM] Consolidation complete. Memories:", this.memories.size);
  }

  /**
   * Get memory statistics
   */
  getStats() {
    const memories = Array.from(this.memories.values());

    return {
      total: memories.length,
      byType: {
        episodic: memories.filter((m) => m.type === "episodic").length,
        semantic: memories.filter((m) => m.type === "semantic").length,
        procedural: memories.filter((m) => m.type === "procedural").length,
        emotional: memories.filter((m) => m.type === "emotional").length,
        contextual: memories.filter((m) => m.type === "contextual").length,
      },
      avgImportance: memories.reduce((sum, m) => sum + m.importance, 0) / memories.length,
      totalAccesses: memories.reduce((sum, m) => sum + m.accessCount, 0),
    };
  }

  /**
   * Export memories
   */
  export(filter?: { type?: MemoryType; minImportance?: number }): Memory[] {
    let memories = Array.from(this.memories.values());

    if (filter?.type) {
      memories = memories.filter((m) => m.type === filter.type);
    }

    if (filter?.minImportance) {
      memories = memories.filter((m) => m.importance >= filter.minImportance);
    }

    return memories;
  }

  /**
   * Import memories
   */
  import(memories: Memory[]): void {
    for (const memory of memories) {
      this.memories.set(memory.id, memory);
      this.updateImportanceQueue(memory);
    }
    console.log("[LTM] Imported", memories.length, "memories");
  }

  /**
   * Calculate importance score
   */
  private calculateImportance(content: string, type: MemoryType): number {
    let score = 0.5;

    // Longer content = potentially more important
    if (content.length > 100) score += 0.1;
    if (content.length > 500) score += 0.1;

    // Certain types are inherently more important
    if (type === "procedural") score += 0.2;
    if (type === "emotional") score += 0.15;

    // Keywords boost importance
    const importantKeywords = ["记住", "重要", "必须", "一定", "critical", "important", "must"];
    if (importantKeywords.some((kw) => content.toLowerCase().includes(kw))) {
      score += 0.15;
    }

    return Math.min(1.0, score);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update importance queue
   */
  private updateImportanceQueue(memory: Memory): void {
    const index = this.importanceQueue.findIndex((m) => m.importance < memory.importance);
    if (index === -1) {
      this.importanceQueue.push(memory);
    } else {
      this.importanceQueue.splice(index, 0, memory);
    }
  }

  /**
   * Remove from importance queue
   */
  private removeFromImportanceQueue(memoryId: string): void {
    const index = this.importanceQueue.findIndex((m) => m.id === memoryId);
    if (index !== -1) {
      this.importanceQueue.splice(index, 1);
    }
  }

  /**
   * Start auto-consolidation
   */
  private startConsolidation(): void {
    if (this.consolidationTimer) {
      clearInterval(this.consolidationTimer);
    }

    this.consolidationTimer = setInterval(() => {
      this.consolidate().catch(console.error);
    }, this.config.consolidationInterval);
  }

  /**
   * Stop auto-consolidation
   */
  stopConsolidation(): void {
    if (this.consolidationTimer) {
      clearInterval(this.consolidationTimer);
      this.consolidationTimer = null;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.autoConsolidate && !this.consolidationTimer) {
      this.startConsolidation();
    } else if (!this.config.autoConsolidate && this.consolidationTimer) {
      this.stopConsolidation();
    }

    console.log("[LTM] Config updated");
  }

  /**
   * Get configuration
   */
  getConfig(): MemoryConfig {
    return { ...this.config };
  }

  /**
   * Clear all memories
   */
  clear(): void {
    this.memories.clear();
    this.importanceQueue = [];
    console.log("[LTM] All memories cleared");
  }
}

// Singleton instance
export const longTermMemory = new LongTermMemory();
