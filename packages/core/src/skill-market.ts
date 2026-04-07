/**
 * 技能市场 v3.0.0
 * 
 * 技能上传/下载/评分/执行
 */

export interface Skill {
  /** 技能 ID */
  id: string;
  /** 技能名称 */
  name: string;
  /** 技能描述 */
  description: string;
  /** 作者 */
  author: string;
  /** 版本 */
  version: string;
  /** 分类 */
  category: string;
  /** 标签 */
  tags: string[];
  /** 代码 */
  code: string;
  /** 依赖 */
  dependencies: string[];
  /** 权限 */
  permissions: string[];
  /** 下载量 */
  downloads: number;
  /** 评分 */
  rating: number;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

export interface SkillRuntime {
  /** 执行技能 */
  execute: (context: any) => Promise<any>;
  /** 验证权限 */
  validatePermissions: (permissions: string[]) => boolean;
}

/**
 * 技能市场
 */
export class SkillMarketplace {
  private skills: Map<string, Skill> = new Map();
  private ratings: Map<string, number[]> = new Map();

  /**
   * 上传技能
   */
  upload(skill: Skill): void {
    console.log(`[SkillMarketplace] Uploading skill: ${skill.name} v${skill.version}`);
    
    // 验证技能
    if (!this.validateSkill(skill)) {
      throw new Error('Invalid skill');
    }

    // 保存技能
    this.skills.set(skill.id, skill);
    this.ratings.set(skill.id, []);

    console.log(`[SkillMarketplace] Skill uploaded: ${skill.id}`);
  }

  /**
   * 下载技能
   */
  download(skillId: string): Skill | undefined {
    const skill = this.skills.get(skillId);
    if (skill) {
      skill.downloads++;
      console.log(`[SkillMarketplace] Skill downloaded: ${skillId}`);
    }
    return skill;
  }

  /**
   * 搜索技能
   */
  search(query: {
    keyword?: string;
    category?: string;
    tags?: string[];
    minRating?: number;
  }): Skill[] {
    let results = Array.from(this.skills.values());

    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      results = results.filter(
        s => s.name.toLowerCase().includes(keyword) ||
             s.description.toLowerCase().includes(keyword)
      );
    }

    if (query.category) {
      results = results.filter(s => s.category === query.category);
    }

    if (query.tags) {
      results = results.filter(s =>
        query.tags!.every(tag => s.tags.includes(tag))
      );
    }

    if (query.minRating !== undefined) {
      results = results.filter(s => this.getRating(s.id) >= query.minRating!);
    }

    return results;
  }

  /**
   * 评分
   */
  rate(skillId: string, rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const ratings = this.ratings.get(skillId) || [];
    ratings.push(rating);
    this.ratings.set(skillId, ratings);

    console.log(`[SkillMarketplace] Rated ${skillId}: ${rating}/5`);
  }

  /**
   * 获取评分
   */
  getRating(skillId: string): number {
    const ratings = this.ratings.get(skillId) || [];
    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }

  /**
   * 执行技能
   */
  async executeSkill(skillId: string, context: any): Promise<any> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error('Skill not found');
    }

    console.log(`[SkillMarketplace] Executing skill: ${skill.name}`);
    
    // 实际实现需要沙箱执行
    // 这里仅模拟
    return { success: true, result: 'Skill executed' };
  }

  /**
   * 验证技能
   */
  private validateSkill(skill: Skill): boolean {
    return !!(
      skill.id &&
      skill.name &&
      skill.description &&
      skill.author &&
      skill.version &&
      skill.code
    );
  }

  /**
   * 获取所有技能
   */
  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * 删除技能
   */
  deleteSkill(skillId: string): boolean {
    const deleted = this.skills.delete(skillId);
    this.ratings.delete(skillId);
    return deleted;
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalSkills: number;
    totalDownloads: number;
    averageRating: number;
  } {
    const skills = this.getAllSkills();
    const totalDownloads = skills.reduce((sum, s) => sum + s.downloads, 0);
    const ratings = Array.from(this.ratings.values()).flat();
    const averageRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    return {
      totalSkills: skills.length,
      totalDownloads,
      averageRating,
    };
  }
}

/**
 * 创建技能市场
 */
export function createSkillMarketplace(): SkillMarketplace {
  return new SkillMarketplace();
}

export default SkillMarketplace;
