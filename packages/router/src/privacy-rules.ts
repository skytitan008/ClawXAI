/**
 * ClawXAI 隐私检测规则配置
 * 
 * 敏感词库和正则模式定义
 * 支持热重载 (修改后自动生效)
 */

export interface PrivacyRules {
  keywords: {
    S2: string[];  // 敏感词 - 脱敏后转发
    S3: string[];  // 高度敏感 - 仅本地处理
  };
  patterns: {
    S2: Array<{ name: string; pattern: string; description: string }>;
    S3: Array<{ name: string; pattern: string; description: string }>;
  };
}

/**
 * 默认隐私检测规则
 */
export const defaultPrivacyRules: PrivacyRules = {
  keywords: {
    // S2: 敏感信息 - 需要脱敏
    S2: [
      // 个人身份信息
      'email', 'e-mail', 'mail',
      'phone', 'telephone', 'mobile',
      'address', '住址', '地址',
      'name', '姓名', '名字',
      'birthday', 'birth', '生日',
      'age', '年龄',
      
      // 账号相关
      'username', 'user', 'account', '账号',
      'password', 'passwd', 'pwd', '密码',
      'login', '登录',
      
      // 联系方式
      'wechat', '微信',
      'qq', 'telegram', 'tg',
      'skype', 'whatsapp',
      
      // 其他敏感
      'id card', '身份证',
      'passport', '护照',
      'license', '驾照', '驾驶证',
    ],
    
    // S3: 高度敏感信息 - 仅本地处理
    S3: [
      // 密钥类
      'ssh', 'private key', '私钥',
      'secret', 'token', 'api key', 'apikey',
      'credential', 'certificate', '证书',
      'auth', 'authentication', '认证',
      
      // 金融类
      'credit card', '信用卡',
      'bank card', '银行卡',
      'cvv', 'cvc', 'security code',
      'pin', 'payment', '支付',
      
      // 系统类
      'root', 'sudo', 'admin',
      'sudoers', 'shadow', 'passwd',
      '.pem', '.key', '.p12', '.pfx',
      
      // 其他
      'confidential', '机密',
      'classified', '秘密',
    ],
  },
  
  patterns: {
    // S2: 敏感模式
    S2: [
      {
        name: 'email',
        pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
        description: '邮箱地址',
      },
      {
        name: 'phone-cn',
        pattern: '\\b1[3-9]\\d{9}\\b',
        description: '中国大陆手机号',
      },
      {
        name: 'phone-us',
        pattern: '\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b',
        description: '美国手机号',
      },
      {
        name: 'qq',
        pattern: '\\b[1-9]\\d{4,10}\\b',
        description: 'QQ 号码',
      },
      {
        name: 'wechat',
        pattern: '\\b(wx|wechat|微信)[=:\\s][a-zA-Z][a-zA-Z0-9_-]{5,19}\\b',
        description: '微信号 (需要前缀标识)',
      },
    ],
    
    // S3: 高度敏感模式
    S3: [
      {
        name: 'ssh-rsa-key',
        pattern: '-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----',
        description: 'SSH 私钥',
      },
      {
        name: 'ssh-encrypted-key',
        pattern: '-----BEGIN ENCRYPTED PRIVATE KEY-----',
        description: '加密私钥',
      },
      {
        name: 'pgp-key',
        pattern: '-----BEGIN PGP PRIVATE KEY BLOCK-----',
        description: 'PGP 私钥',
      },
      {
        name: 'credit-card',
        pattern: '\\b(?:\\d{4}[- ]?){3}\\d{4}\\b',
        description: '信用卡号',
      },
      {
        name: 'credit-card-short',
        pattern: '\\b\\d{13,19}\\b',
        description: '信用卡号 (短格式)',
      },
      {
        name: 'cvv',
        pattern: '\\bCVV[=:\\s]\\d{3,4}\\b',
        description: '信用卡 CVV',
      },
      {
        name: 'bank-account-cn',
        pattern: '\\b\\d{16,19}\\b',
        description: '银行账号 (可能误报)',
      },
      {
        name: 'id-card-cn',
        pattern: '\\b\\d{17}[\\dXx]|\\d{15}\\b',
        description: '中国身份证号',
      },
      {
        name: 'us-ssn',
        pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
        description: '美国社保号',
      },
      {
        name: 'aws-access-key',
        pattern: '\\bAKIA[0-9A-Z]{16}\\b',
        description: 'AWS Access Key',
      },
      {
        name: 'aws-secret-key',
        pattern: '\\b[A-Za-z0-9/+=]{40}\\b',
        description: 'AWS Secret Key (可能误报)',
      },
      {
        name: 'github-token',
        pattern: '\\bghp_[A-Za-z0-9]{36}\\b',
        description: 'GitHub Personal Access Token',
      },
      {
        name: 'github-oauth',
        pattern: '\\bgho_[A-Za-z0-9]{36}\\b',
        description: 'GitHub OAuth Token',
      },
      {
        name: 'jwt-token',
        pattern: '\\beyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\b',
        description: 'JWT Token',
      },
      {
        name: 'ip-address',
        pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
        description: 'IP 地址 (可能误报)',
      },
      {
        name: 'url-with-auth',
        pattern: '\\bhttps?://[^:]+:[^@]+@',
        description: '带认证的 URL',
      },
    ],
  },
};

/**
 * 验证规则配置
 */
export function validatePrivacyRules(rules: PrivacyRules): boolean {
  // 检查关键词数组
  if (!Array.isArray(rules.keywords.S2) || !Array.isArray(rules.keywords.S3)) {
    return false;
  }
  
  // 检查模式数组
  if (!Array.isArray(rules.patterns.S2) || !Array.isArray(rules.patterns.S3)) {
    return false;
  }
  
  // 验证正则表达式
  for (const pattern of [...rules.patterns.S2, ...rules.patterns.S3]) {
    try {
      new RegExp(pattern.pattern);
    } catch {
      console.error(`Invalid regex pattern: ${pattern.name} - ${pattern.pattern}`);
      return false;
    }
  }
  
  return true;
}

/**
 * 从配置文件加载规则
 */
export async function loadPrivacyRules(configPath?: string): Promise<PrivacyRules> {
  // 如果没有配置文件，返回默认规则
  if (!configPath) {
    console.log('[PrivacyRules] Using default rules');
    return defaultPrivacyRules;
  }
  
  try {
    const fs = await import('node:fs');
    const path = await import('node:path');
    
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent) as PrivacyRules;
    
    if (validatePrivacyRules(config)) {
      console.log(`[PrivacyRules] Loaded rules from ${configPath}`);
      return config;
    } else {
      console.warn('[PrivacyRules] Invalid config, using defaults');
      return defaultPrivacyRules;
    }
  } catch (error) {
    console.warn(`[PrivacyRules] Failed to load config: ${error}`);
    return defaultPrivacyRules;
  }
}

/**
 * 监听配置文件变化并热重载
 */
export function watchPrivacyRules(
  configPath: string,
  callback: (rules: PrivacyRules) => void
): () => void {
  let watcher: any = null;
  
  try {
    const chokidar = require('chokidar');
    watcher = chokidar.watch(configPath, {
      persistent: true,
      ignoreInitial: true,
    });
    
    watcher.on('change', async () => {
      console.log('[PrivacyRules] Config file changed, reloading...');
      const rules = await loadPrivacyRules(configPath);
      callback(rules);
    });
    
    console.log(`[PrivacyRules] Watching config file: ${configPath}`);
  } catch {
    console.warn('[PrivacyRules] chokidar not available, config hot-reload disabled');
  }
  
  // 返回停止监听的函数
  return () => {
    if (watcher) {
      watcher.close();
    }
  };
}
