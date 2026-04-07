/**
 * ClawXAI Emotion Analysis
 * 
 * 情感分析模块 - 识别用户情绪并生成情感响应
 */

export type EmotionType = 
  | 'joy'       // 开心
  | 'sadness'   // 悲伤
  | 'anger'     // 愤怒
  | 'fear'      // 恐惧
  | 'surprise'  // 惊讶
  | 'disgust'   // 厌恶
  | 'neutral';  // 中性

export interface EmotionResult {
  /** 主要情绪 */
  primary: EmotionType;
  /** 情绪强度 (0-1) */
  intensity: number;
  /** 所有情绪得分 */
  scores: Record<EmotionType, number>;
  /** 情绪关键词 */
  keywords: string[];
}

/**
 * 情感关键词库
 */
const EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
  joy: ['开心', '高兴', '快乐', '幸福', '棒', '太好了', '哈哈', '嘻嘻', 'love', 'great', 'awesome', 'happy', '笑'],
  sadness: ['难过', '伤心', '悲伤', '哭', '痛苦', '失望', 'sad', 'depressed', 'unhappy', '悲'],
  anger: ['生气', '愤怒', '烦', '讨厌', '混蛋', 'fuck', 'angry', 'hate', 'annoyed', '气死'],
  fear: ['害怕', '恐惧', '担心', '紧张', 'scared', 'afraid', 'worried', 'nervous', '怕'],
  surprise: ['惊讶', '哇', '天啊', '真的吗', 'wow', 'omg', 'really', 'surprised', '惊', '啊'],
  disgust: ['恶心', '讨厌', '呸', 'disgust', 'gross', 'yuck', '呕', '恶'],
  neutral: ['你好', '谢谢', '再见', '请问', 'hello', 'thanks', 'bye', '在吗', '请问', '麻烦'],
};

/**
 * 情感分析器
 */
export class EmotionAnalyzer {
  /**
   * 分析文本情绪
   */
  analyze(text: string): EmotionResult {
    const lowerText = text.toLowerCase();
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

    // 计算每种情绪的得分
    for (const [emotion, words] of Object.entries(EMOTION_KEYWORDS)) {
      for (const word of words) {
        // 中文不需要单词边界，直接匹配
        const regex = new RegExp(word, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          scores[emotion as EmotionType] += matches.length;
          keywords.push(...matches.map(m => m.toLowerCase()));
        }
      }
    }

    // 添加标点符号分析
    if (text.includes('!') || text.includes('！')) scores.joy += 0.2;
    if (text.includes('...')) {
      // ... 可能表示犹豫或悲伤，但权重不要太高
      if (scores.sadness > 0) scores.sadness += 0.2;
      else scores.neutral += 0.1;
    }
    if (text.includes('???') || text.includes('？？？')) scores.surprise += 0.3;
    
    // Emoji 分析 - 更精确的匹配
    if (text.includes('😂') || text.includes('😄') || text.includes('😊') || text.includes('😁')) scores.joy += 2;
    if (text.includes('😢') || text.includes('😭') || text.includes('😞') || text.includes('😔')) scores.sadness += 2;
    if (text.includes('😡') || text.includes('😠') || text.includes('🤬')) scores.anger += 2;
    if (text.includes('😨') || text.includes('😰')) scores.fear += 1;
    if (text.includes('😱')) scores.surprise += 2;  // 😱 更倾向 surprise
    if (text.includes('😲') || text.includes('😮') || text.includes('🤯')) scores.surprise += 2;
    if (text.includes('🤢') || text.includes('🤮')) scores.disgust += 3;  // 🤢明确表示恶心
    if (text.includes('😤')) scores.anger += 1;

    // 归一化得分
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      for (const emotion of Object.keys(scores) as EmotionType[]) {
        scores[emotion] /= total;
      }
    }

    // 确定主要情绪
    let primary: EmotionType = 'neutral';
    let maxScore = 0;
    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        primary = emotion as EmotionType;
      }
    }

    // 如果所有得分都很低，标记为中性
    if (maxScore < 0.2 || (keywords.length === 0 && !text.match(/[!?.!?.\u{1F600}-\u{1F64F}]/u))) {
      primary = 'neutral';
      scores.neutral = 1;
      for (const emotion of Object.keys(scores).filter(e => e !== 'neutral') as EmotionType[]) {
        scores[emotion] = 0;
      }
    }

    // 去重关键词
    const uniqueKeywords = [...new Set(keywords)];

    return {
      primary,
      intensity: maxScore,
      scores,
      keywords: uniqueKeywords.slice(0, 5),
    };
  }

  /**
   * 根据情绪生成响应建议
   */
  getSuggestedResponse(emotion: EmotionType, intensity: number): string {
    const responses: Record<EmotionType, string[]> = {
      joy: [
        '太为你高兴了！😊',
        '这真是个好消息！🎉',
        '看到你这么开心我也很开心！✨',
      ],
      sadness: [
        '我理解你的感受，我在这里陪着你。💙',
        '想聊聊吗？我会认真听的。',
        '一切都会好起来的。🌈',
      ],
      anger: [
        '我理解你很生气。深呼吸一下？🧘',
        '想说说发生了什么吗？',
        '我在这里支持你。💪',
      ],
      fear: [
        '别担心，我们一起面对。💪',
        '深呼吸，一切都会好起来的。',
        '你不是一个人。💙',
      ],
      surprise: [
        '是不是很意外？😄',
        '生活总是充满惊喜！✨',
        '哈哈，我也很惊讶！',
      ],
      disgust: [
        '我理解你的感受。',
        '确实让人不舒服。',
        '想聊聊吗？',
      ],
      neutral: [
        '有什么我可以帮你的吗？',
        '我在听，请继续。',
        '好的，明白了。',
      ],
    };

    const options = responses[emotion];
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }

  /**
   * 获取情绪颜色
   */
  getColor(emotion: EmotionType): string {
    const colors: Record<EmotionType, string> = {
      joy: '#FFD700',      // 金色
      sadness: '#4169E1',  // 蓝色
      anger: '#FF4500',    // 橙红色
      fear: '#8B008B',     // 深紫色
      surprise: '#FF69B4', // 粉红色
      disgust: '#228B22',  // 绿色
      neutral: '#808080',  // 灰色
    };
    return colors[emotion];
  }
}

/**
 * 创建情感分析器实例
 */
export function createEmotionAnalyzer(): EmotionAnalyzer {
  return new EmotionAnalyzer();
}

export default createEmotionAnalyzer;
