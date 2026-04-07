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
 * 
 * 包含 50+ 敏感关键词和 20+ 正则模式
 * 支持热重载 (修改后自动生效)
 */
export const defaultPrivacyRules: PrivacyRules = {
  keywords: {
    // S2: 敏感信息 - 需要脱敏 (30+ 词)
    S2: [
      // 个人身份信息 (PII)
      'email', 'e-mail', 'mail', '邮箱',
      'phone', 'telephone', 'mobile', '电话', '手机',
      'address', '住址', '地址', '住址',
      'name', '姓名', '名字', 'real name', '真名',
      'birthday', 'birth', '生日', '出生日期',
      'age', '年龄', '岁数',
      'gender', '性别', 'male', 'female',
      'nationality', '国籍', '民族',
      'marital', '婚姻', 'married', 'single',
      
      // 账号相关
      'username', 'user', 'account', '账号', '账户',
      'password', 'passwd', 'pwd', '密码', '口令',
      'login', '登录', 'signin', 'sign in',
      'register', 'signup', 'sign up', '注册',
      
      // 联系方式
      'wechat', '微信', 'weixin',
      'qq', 'qzone',
      'telegram', 'tg', '纸飞机',
      'skype', 'whatsapp', 'line',
      'discord', 'slack', 'teams',
      'facebook', 'twitter', 'instagram', 'linkedin',
      
      // 位置信息
      'location', 'location', 'gps', '坐标',
      'city', 'country', 'state', 'province',
      'zip', 'postal', 'postcode', '邮编',
      
      // 其他敏感
      'id card', '身份证', 'identity',
      'passport', '护照',
      'license', '驾照', '驾驶证', '行驶证',
      'insurance', '保险', '社保', '医保',
      'salary', 'income', '工资', '收入',
      'company', 'employer', '公司', '单位',
      'position', 'title', '职位', '职称',
      'education', '学校', '学历', '学位',
      'medical', 'health', '疾病', '病历',
    ],
    
    // S3: 高度敏感信息 - 仅本地处理 (25+ 词)
    S3: [
      // 密钥类
      'ssh', 'private key', '私钥', '公钥', 'public key',
      'secret', 'token', 'api key', 'apikey', 'access key',
      'credential', 'certificate', '证书', 'cert',
      'auth', 'authentication', '认证', 'authorize', '授权',
      'encryption', 'decrypt', '加密', '解密',
      'signature', 'sign', '签名',
      
      // 金融类
      'credit card', '信用卡', '借记卡', 'debit card',
      'bank card', '银行卡', '储蓄卡',
      'cvv', 'cvc', 'security code', '验证码',
      'pin', 'payment', '支付', '付款',
      'transaction', '转账', '汇款',
      'balance', '余额', '存款',
      'loan', '贷款', '抵押',
      'investment', '投资', '股票', '基金',
      
      // 系统类
      'root', 'sudo', 'admin', 'administrator',
      'sudoers', 'shadow', 'passwd', 'system32',
      '.pem', '.key', '.p12', '.pfx', '.jks',
      'keystore', 'truststore',
      'firewall', 'proxy', 'vpn',
      
      // 企业敏感
      'confidential', '机密', '机密级',
      'classified', '秘密', '秘密级',
      'proprietary', '专利', '知识产权',
      'nd', 'non-disclosure', '保密协议',
      'trade secret', '商业秘密',
      'merger', 'acquisition', '并购', '收购',
      
      // 法律相关
      'lawsuit', '诉讼', '起诉',
      'attorney', 'lawyer', '律师',
      'contract', '合同', '协议',
      'legal', '法庭', '法院',
    ],
  },
  
  patterns: {
    // S2: 敏感模式 (12 个)
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
        name: 'phone-intl',
        pattern: '\\+\\d{1,4}[-.\\s]?\\d{6,14}\\b',
        description: '国际手机号',
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
      {
        name: 'passport-cn',
        pattern: '\\b[Ee][A-Za-z0-9]{9}\\b|\\b[A-Z][0-9]{7}[0-9A-Z]\\b',
        description: '中国护照号',
      },
      {
        name: 'driver-license-cn',
        pattern: '\\b\\d{12}|\\d{15}|\\d{18}\\b',
        description: '驾驶证号 (可能误报)',
      },
      {
        name: 'social-security-cn',
        pattern: '\\b\\d{18}\\b',
        description: '社保号 (可能误报)',
      },
      {
        name: 'date-of-birth',
        pattern: '\\b\\d{4}[-/年]\\d{1,2}[-/月]\\d{1,2}[日号]?\\b',
        description: '出生日期',
      },
      {
        name: 'ip-address-private',
        pattern: '\\b(?:192\\.168|10\\.|172\\.(?:1[6-9]|2[0-9]|3[01]))\\.\\d{1,3}\\.\\d{1,3}\\b',
        description: '私有 IP 地址',
      },
      {
        name: 'mac-address',
        pattern: '\\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\\b',
        description: 'MAC 地址',
      },
    ],
    
    // S3: 高度敏感模式 (15 个)
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
        name: 'url-with-auth',
        pattern: '\\bhttps?://[^:]+:[^@]+@',
        description: '带认证的 URL',
      },
      {
        name: 'google-api-key',
        pattern: '\\bAIza[0-9A-Za-z_-]{35}\\b',
        description: 'Google API Key',
      },
      {
        name: 'slack-token',
        pattern: '\\bxox[baprs]-[0-9A-Za-z-]+\\b',
        description: 'Slack Token',
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
