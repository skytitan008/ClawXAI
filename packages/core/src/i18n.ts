/**
 * 多语言支持 v3.3.0
 * 
 * i18n 框架/翻译/本地化
 */

export type Language = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'fr-FR' | 'de-DE' | 'es-ES';

export interface Translation {
  [key: string]: string | Translation;
}

export interface I18nConfig {
  /** 默认语言 */
  defaultLanguage?: Language;
  /** 支持的语言 */
  supportedLanguages?: Language[];
  /** 翻译文件路径 */
  translationsPath?: string;
}

/**
 * 多语言系统
 */
export class I18n {
  private translations: Record<Language, Translation> = {} as Record<Language, Translation>;
  private currentLanguage: Language;
  private defaultLanguage: Language;

  constructor(config: I18nConfig = {}) {
    this.defaultLanguage = config.defaultLanguage || 'zh-CN';
    this.currentLanguage = this.defaultLanguage;

    // 初始化翻译
    this.initializeTranslations();
  }

  /**
   * 初始化翻译
   */
  private initializeTranslations(): void {
    // 中文
    this.translations['zh-CN'] = {
      welcome: '欢迎',
      goodbye: '再见',
      settings: '设置',
      profile: '个人资料',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      search: '搜索',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      confirm: '确认',
      language: '语言',
      theme: '主题',
      notifications: '通知',
      privacy: '隐私',
      help: '帮助',
      about: '关于',
    };

    // English
    this.translations['en-US'] = {
      welcome: 'Welcome',
      goodbye: 'Goodbye',
      settings: 'Settings',
      profile: 'Profile',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      language: 'Language',
      theme: 'Theme',
      notifications: 'Notifications',
      privacy: 'Privacy',
      help: 'Help',
      about: 'About',
    };

    // 日本語
    this.translations['ja-JP'] = {
      welcome: 'ようこそ',
      goodbye: 'さようなら',
      settings: '設定',
      profile: 'プロフィール',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      search: '検索',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      confirm: '確認',
      language: '言語',
      theme: 'テーマ',
      notifications: '通知',
      privacy: 'プライバシー',
      help: 'ヘルプ',
      about: 'について',
    };

    // 添加更多语言...
  }

  /**
   * 设置当前语言
   */
  setLanguage(language: Language): void {
    if (!this.translations[language]) {
      console.warn(`[I18n] Language not supported: ${language}`);
      language = this.defaultLanguage;
    }

    this.currentLanguage = language;
    console.log(`[I18n] Language set to: ${language}`);
  }

  /**
   * 获取当前语言
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * 翻译文本
   */
  t(key: string, params?: Record<string, any>): string {
    const keys = key.split('.');
    let translation: any = this.translations[this.currentLanguage];

    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        translation = undefined;
        break;
      }
    }

    if (!translation || typeof translation !== 'string') {
      // Fallback to default language
      translation = this.getFromDefault(key);
    }

    if (!translation) {
      // Fallback to key
      return key;
    }

    // 替换参数
    if (params) {
      for (const [param, value] of Object.entries(params)) {
        translation = translation.replace(`{${param}}`, String(value));
      }
    }

    return translation;
  }

  /**
   * 从默认语言获取
   */
  private getFromDefault(key: string): string {
    const keys = key.split('.');
    let translation: any = this.translations[this.defaultLanguage];

    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        return key;
      }
    }

    return translation || key;
  }

  /**
   * 添加翻译
   */
  addTranslations(language: Language, translations: Translation): void {
    this.translations[language] = {
      ...this.translations[language],
      ...translations,
    };
    console.log(`[I18n] Translations added for: ${language}`);
  }

  /**
   * 获取支持的语言
   */
  getSupportedLanguages(): Language[] {
    return Object.keys(this.translations) as Language[];
  }

  /**
   * 翻译整个对象
   */
  translateObject(obj: Record<string, any>, language?: Language): Record<string, any> {
    const lang = language || this.currentLanguage;
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && this.translations[lang][key]) {
        result[key] = this.t(key);
      } else if (typeof value === 'object') {
        result[key] = this.translateObject(value, language);
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}

/**
 * 创建多语言系统
 */
export function createI18n(config?: I18nConfig): I18n {
  return new I18n(config);
}

export default I18n;
