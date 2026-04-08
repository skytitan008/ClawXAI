/**
 * Enhanced Memory Types
 * Inspired by PAI (Personal AI Infrastructure)
 */

export interface Memory {
  id: string;
  type: MemoryType;
  content: string;
  metadata: MemoryMetadata;
  createdAt: number;
  updatedAt: number;
  accessedAt: number;
  accessCount: number;
  importance: number;
  tags: string[];
}

export type MemoryType =
  | "episodic" // Specific events/experiences
  | "semantic" // General knowledge/facts
  | "procedural" // Skills/how-to
  | "emotional" // Emotional associations
  | "contextual"; // Context-specific info

export interface MemoryMetadata {
  source: string;
  confidence: number;
  language: string;
  entities: string[];
  relations: string[];
  embeddings?: number[];
}

export interface KnowledgeNode {
  id: string;
  type: NodeType;
  label: string;
  data: any;
  connections: KnowledgeConnection[];
}

export type NodeType = "concept" | "entity" | "event" | "person" | "place" | "idea" | "skill";

export interface KnowledgeConnection {
  targetId: string;
  relation: string;
  strength: number;
  createdAt: number;
}

export interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>;
  edges: Map<string, KnowledgeConnection[]>;
}

export interface LearningEvent {
  id: string;
  type: LearningEventType;
  data: any;
  timestamp: number;
  outcome?: LearningOutcome;
}

export type LearningEventType =
  | "observation" // New information observed
  | "feedback" // Feedback received
  | "correction" // Error correction
  | "reinforcement" // Positive/negative reinforcement
  | "consolidation"; // Memory consolidation

export interface LearningOutcome {
  success: boolean;
  confidence: number;
  adjustments: string[];
}

export interface MemoryConfig {
  enabled: boolean;
  autoConsolidate: boolean;
  consolidationInterval: number; // ms
  maxMemories: number;
  importanceThreshold: number;
  storage: "memory" | "sqlite" | "hybrid";
  sqlitePath?: string;
}

export interface LearningConfig {
  enabled: boolean;
  autoLearn: boolean;
  learningRate: number;
  forgetRate: number;
  consolidationStrategy: "time" | "importance" | "access";
}

export interface EnhancedMemoryConfig {
  memory: MemoryConfig;
  learning: LearningConfig;
  knowledgeGraph: {
    enabled: boolean;
    maxNodes: number;
    autoLink: boolean;
  };
}
