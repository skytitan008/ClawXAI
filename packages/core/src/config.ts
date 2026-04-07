/**
 * ClawXAI 配置文件
 * 
 * 支持 JSON 格式配置，可热重载
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import type { PrivacyRules } from '@clawxai/router';
import type { TokenSaverConfig } from '@clawxai/router';

export interface ClawXAIConfig {
  /** 隐私检测配置 */
  privacy: {
    /** 是否启用隐私检测 */
    enabled: boolean;
    /** S3 级别自动切换到本地处理 */
    autoLocalMode: boolean;
    /** S2 级别自动脱敏 */
    autoRedact: boolean;
    /** 自定义规则 (可选) */
    customRules?: Partial<PrivacyRules>;
  };

  /** 成本优化配置 */
  cost: {
    /** 是否启用成本优化 */
    enabled: boolean;
    /** 缓存时间 (毫秒) */
    cacheTTL: number;
    /** 模型路由配置 */
    models: TokenSaverConfig['tiers'];
  };

  /** 记忆系统配置 */
  memory: {
    /** 是否启用记忆 */
    enabled: boolean;
    /** 存储类型: 'memory' | 'sqlite' */
    storage: 'memory' | 'sqlite';
    /** SQLite 数据库路径 */
    dbPath?: string;
    /** 自动构建记忆 */
    autoBuild: boolean;
    /** 记忆保留天数 */
    retentionDays: number;
  };

  /** 日志配置 */
  logging: {
    /** 日志级别 */
    level: 'debug' | 'info' | 'warn' | 'error';
    /** 是否输出详细路由日志 */
    verboseRouter: boolean;
    /** 是否输出详细记忆日志 */
    verboseMemory: boolean;
  };

  /** 性能配置 */
  performance: {
    /** 路由决策超时 (毫秒) */
    routerTimeout: number;
    /** 最大并发路由数 */
    maxConcurrentRouters: number;
  };
}

/**
 * 默认配置
 */
export const defaultConfig: ClawXAIConfig = {
  privacy: {
    enabled: true,
    autoLocalMode: true,
    autoRedact: true,
  },

  cost: {
    enabled: true,
    cacheTTL: 5 * 60 * 1000, // 5 分钟
    models: {
      SIMPLE: { provider: 'openai', model: 'gpt-4o-mini' },
      MEDIUM: { provider: 'openai', model: 'gpt-4o' },
      COMPLEX: { provider: 'anthropic', model: 'claude-sonnet-4-5' },
      REASONING: { provider: 'openai', model: 'o4-mini' },
    },
  },

  memory: {
    enabled: true,
    storage: 'memory',
    dbPath: join(homedir(), '.clawxai', 'memory.db'),
    autoBuild: true,
    retentionDays: 90,
  },

  logging: {
    level: 'info',
    verboseRouter: false,
    verboseMemory: false,
  },

  performance: {
    routerTimeout: 5000,
    maxConcurrentRouters: 10,
  },
};

/**
 * 配置路径
 */
const CONFIG_DIR = join(homedir(), '.clawxai');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

/**
 * 确保配置目录存在
 */
function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * 加载配置文件
 */
export function loadConfig(): ClawXAIConfig {
  if (!existsSync(CONFIG_PATH)) {
    console.log('[Config] No config file found, using defaults');
    return defaultConfig;
  }

  try {
    const content = readFileSync(CONFIG_PATH, 'utf-8');
    const userConfig = JSON.parse(content) as Partial<ClawXAIConfig>;

    // 合并配置
    const config = {
      ...defaultConfig,
      ...userConfig,
      privacy: { ...defaultConfig.privacy, ...userConfig.privacy },
      cost: { ...defaultConfig.cost, ...userConfig.cost },
      memory: { ...defaultConfig.memory, ...userConfig.memory },
      logging: { ...defaultConfig.logging, ...userConfig.logging },
      performance: { ...defaultConfig.performance, ...userConfig.performance },
    };

    console.log(`[Config] Loaded from ${CONFIG_PATH}`);
    return config;
  } catch (error) {
    console.warn(`[Config] Failed to load config: ${error}`);
    console.warn('[Config] Using defaults');
    return defaultConfig;
  }
}

/**
 * 保存配置文件
 */
export function saveConfig(config: ClawXAIConfig): void {
  ensureConfigDir();
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  console.log(`[Config] Saved to ${CONFIG_PATH}`);
}

/**
 * 创建示例配置文件
 */
export function createExampleConfig(): void {
  ensureConfigDir();
  const examplePath = join(CONFIG_DIR, 'config.example.json');
  
  const example = {
    privacy: {
      enabled: true,
      autoLocalMode: true,
      autoRedact: true,
      // 自定义敏感词示例
      customRules: {
        keywords: {
          S2: ['custom_sensitive_word'],
          S3: ['top_secret_keyword'],
        },
      },
    },

    cost: {
      enabled: true,
      cacheTTL: 300000,
      models: {
        SIMPLE: { provider: 'openai', model: 'gpt-4o-mini' },
        MEDIUM: { provider: 'openai', model: 'gpt-4o' },
        COMPLEX: { provider: 'anthropic', model: 'claude-sonnet-4-5' },
        REASONING: { provider: 'openai', model: 'o4-mini' },
      },
    },

    memory: {
      enabled: true,
      storage: 'memory', // 或 'sqlite'
      dbPath: '~/.clawxai/memory.db',
      autoBuild: true,
      retentionDays: 90,
    },

    logging: {
      level: 'info',
      verboseRouter: true,
      verboseMemory: true,
    },

    performance: {
      routerTimeout: 5000,
      maxConcurrentRouters: 10,
    },
  };

  writeFileSync(examplePath, JSON.stringify(example, null, 2), 'utf-8');
  console.log(`[Config] Example config created at ${examplePath}`);
}

/**
 * 验证配置
 */
export function validateConfig(config: ClawXAIConfig): boolean {
  // 验证隐私配置
  if (typeof config.privacy.enabled !== 'boolean') {
    console.error('[Config] Invalid privacy.enabled');
    return false;
  }

  // 验证成本配置
  if (typeof config.cost.cacheTTL !== 'number' || config.cost.cacheTTL < 0) {
    console.error('[Config] Invalid cost.cacheTTL');
    return false;
  }

  // 验证记忆配置
  if (!['memory', 'sqlite'].includes(config.memory.storage)) {
    console.error('[Config] Invalid memory.storage');
    return false;
  }

  // 验证日志级别
  if (!['debug', 'info', 'warn', 'error'].includes(config.logging.level)) {
    console.error('[Config] Invalid logging.level');
    return false;
  }

  return true;
}

/**
 * 获取配置路径
 */
export function getConfigPath(): string {
  return CONFIG_PATH;
}

/**
 * 获取示例配置路径
 */
export function getExampleConfigPath(): string {
  return join(CONFIG_DIR, 'config.example.json');
}
