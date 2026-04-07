/**
 * 情感分析增强模块 v2.6.0
 * 
 * 改进的情感识别和响应建议
 */

export type EmotionType = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral';

export interface EmotionResult {
  /** 主要情绪 */
  primary: EmotionType;
  /** 情绪强度 (0-1) */
  intensity: number;
  /** 所有情绪评分 */
  scores: Record<EmotionType, number>;
  /** 响应建议 */
  suggestions: string[];
  /** 识别的关键词 */
  keywords: string[];
}

/**
 * 情感分析器 v2.6.0
 */
export class EmotionAnalyzer {
  private readonly emotions: Record<EmotionType, {
    keywords: string[];
    emojis: string[];
    intensity: number;
  }>;

  constructor() {
    this.emotions = {
      joy: {
        keywords: ['开心', '高兴', '快乐', 'happy', 'joy', 'glad', 'pleased', 'excited', 'wonderful', 'great'],
        emojis: ['😂', '😊', '😄', '😁', '😆', '😍', '🥰', '😘', '😚', '😙', '🤗', '😃', '😸', '😹', '💕', '❤️', '🎉', '👏'],
        intensity: 1.0,
      },
      sadness: {
        keywords: ['难过', '伤心', '悲伤', 'sad', 'cry', 'depressed', 'upset', 'lonely', 'miss', 'grief'],
        emojis: ['😢', '😭', '😿', '💔', '😞', '😟', '😠', '🙁', '☹️'],
        intensity: 0.9,
      },
      anger: {
        keywords: ['生气', '愤怒', 'angry', 'mad', 'furious', 'hate', 'annoyed', 'frustrated'],
        emojis: ['😡', '🤬', '😠', '👿', '💢'],
        intensity: 0.95,
      },
      fear: {
        keywords: ['害怕', '恐惧', 'fear', 'scared', 'afraid', 'terrified', 'nervous', 'anxious', 'worry'],
        emojis: ['😨', '😱', '😰', '😟', '😖', '🙀'],
        intensity: 0.85,
      },
      surprise: {
        keywords: ['惊讶', '惊奇', 'surprise', 'wow', 'amazed', 'shocked', 'astonished', 'unexpected'],
        emojis: ['😱', '😲', '😮', '😯', '😳', '🤩', '😻'],
        intensity: 0.8,
      },
      disgust: {
        keywords: ['恶心', '厌恶', 'disgust', 'gross', 'dislike', 'hate', 'eww', 'yuck'],
        emojis: ['🤢', '🤮', '👎', '💩', '😒'],
        intensity: 0.9,
      },
      neutral: {
        keywords: ['你好', 'hello', 'hi', '请问', 'what', 'how', 'when', 'where', 'why', 'who'],
        emojis: ['🙂', '😐', '😶', '🤔'],
        intensity: 0.5,
      },
    };
  }

  /**
   * 分析文本情绪
   */
  analyze(text: string): EmotionResult {
    const scores: Record<EmotionType, number> = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
      neutral: 0,
    };

    const keywords: string[] = [];
    const textLower = text.toLowerCase();

    // 关键词匹配
    for (const [emotion, data] of Object.entries(this.emotions)) {
      for (const keyword of data.keywords) {
        if (textLower.includes(keyword.toLowerCase())) {
          scores[emotion as EmotionType] += data.intensity;
          keywords.push(keyword);
        }
      }
    }

    // Emoji 匹配
    for (const char of text) {
      for (const [emotion, data] of Object.entries(this.emotions)) {
        if (data.emojis.includes(char)) {
          scores[emotion as EmotionType] += data.intensity;
        }
      }
    }

    // 找到主要情绪
    let primary: EmotionType = 'neutral';
    let maxScore = scores.neutral;

    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        primary = emotion as EmotionType;
      }
    }

    // 计算强度
    const intensity = Math.min(1, maxScore / 2);

    // 生成响应建议
    const suggestions = this.generateSuggestions(primary, intensity);

    return {
      primary,
      intensity,
      scores: scores as Record<EmotionType, number>,
      suggestions,
      keywords,
    };
  }

  /**
   * 生成响应建议
   */
  private generateSuggestions(emotion: EmotionType, intensity: number): string[] {
    const suggestions: Record<EmotionType, string[]> = {
      joy: [
        '太为你高兴了！😊',
        '分享你的喜悦！',
        '继续保持好心情！',
      ],
      sadness: [
        '一切都会好起来的。🌈',
        '我在这里陪着你。',
        '想聊聊发生了什么吗？',
      ],
      anger: [
        '深呼吸，冷静一下。',
        '理解你的感受。',
        '需要我帮忙吗？',
      ],
      fear: [
        '别担心，会没事的。',
        '勇敢面对！',
        '我在这里支持你。',
      ],
      surprise: [
        '真的很令人惊讶！',
        '难以置信！',
        '太神奇了！',
      ],
      disgust: [
        '确实让人不舒服。',
        '理解你的感受。',
        '远离这些负面事物。',
      ],
      neutral: [
        '有什么我可以帮你的吗？',
        '请继续说。',
        '我在听。',
      ],
    };

    // 根据强度选择建议数量
    const count = intensity > 0.8 ? 3 : intensity > 0.5 ? 2 : 1;
    return suggestions[emotion].slice(0, count);
  }
}

/**
 * 创建情感分析器
 */
export function createEmotionAnalyzer(): EmotionAnalyzer {
  return new EmotionAnalyzer();
}

export default EmotionAnalyzer;
