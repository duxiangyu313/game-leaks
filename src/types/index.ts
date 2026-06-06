/* ═══════════════════════════════════════════
   全局类型定义
   ═══════════════════════════════════════════ */

export interface Game {
  id: string;
  title: string;
  englishTitle?: string;
  cover: string;
  developer: string;
  publisher: string;
  genre: string[];
  platforms: string[];
  releaseDate?: string;
  status: 'announced' | 'in-dev' | 'beta' | 'released' | 'delayed';
  description: string;
  rating?: number;
  hypeScore: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface Leak {
  id: string;
  title: string;
  summary: string;
  content: string;
  source?: string;
  credibility: 'rumor' | 'likely' | 'confirmed';
  gameId?: string;
  gameName?: string;
  images: string[];
  publishedAt: string;
  authorId: string;
  viewCount: number;
  commentCount: number;
}

export type ArticleCategory = 'review' | 'preview' | 'analysis' | 'interview' | 'opinion' | 'leak' | 'news' | 'video';
export type TemplateType = 'leak' | 'review' | 'analysis' | 'news' | 'standard';

export interface Article {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  coverImage: string;
  category: ArticleCategory;
  templateType?: TemplateType;
  gameId?: string;
  gameName?: string;
  authorId: string;
  authorName?: string;
  publishedAt: string;
  readTime: number;
  wordCount?: number;
  tags: string[];
  requiredTier: MembershipTier;
  purchaseCount?: number;
  credibilityScore?: number;
  credibilityVotes?: CredibilityVote;
  videoUrl?: string;
  status: 'draft' | 'published' | 'scheduled';
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** 文章模板定义 */
export interface ArticleTemplateDef {
  type: TemplateType;
  sections: TemplateSection[];
  styles: TemplateStyles;
}

export interface TemplateSection {
  id: string;
  name: string;
  required: boolean;
  markdown: string;
}

export interface TemplateStyles {
  accentColor: string;
  heroStyle: 'large' | 'compact' | 'split';
  showTOC: boolean;
  showTakeaways: boolean;
  showHero: boolean;
}

/** 目录条目 */
export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

/** 互动计数 */
export interface InteractionCounts {
  likes: number;
  bookmarks: number;
  shares: number;
  comments: number;
  credibility_believe: number;
  credibility_skeptical: number;
}

/** 可信度投票 */
export interface CredibilityVote {
  believe: number;
  skeptical: number;
  userVote?: 'believe' | 'skeptical' | null;
}

/** 行内评论 */
export interface InlineComment {
  id: string;
  paragraphIndex: number;
  userId: string;
  username: string;
  membership: MembershipTier;
  content: string;
  createdAt: string;
}

export type MembershipTier = 'free' | 'silver' | 'gold' | 'diamond';

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  avatar?: string;
  membership: MembershipTier;
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'inactive';
  subscriptionEndDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  joinedAt: string;
  bookmarks: string[];
  following: string[];
}

export interface Payment {
  id: string;
  userId: string;
  stripeSessionId: string;
  amount: number;
  currency: string;
  tier: MembershipTier;
  billingCycle: 'monthly' | 'yearly';
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  createdAt: string;
}

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  tag?: string;
}

/** 文章互动记录 */
export interface ArticleInteraction {
  id: string;
  article_id: string;
  user_id: string;
  interaction_type: 'like' | 'bookmark' | 'share' | 'credibility_believe' | 'credibility_skeptical';
  created_at: string;
}

/** 游戏开发进度 */
export interface GameProgress {
  id: string;
  name: string;
  cover_url?: string;
  developer?: string;
  publisher?: string;
  genre?: string;
  development_stage: '概念阶段' | '原型开发' | 'Alpha测试' | 'Beta测试' | '压盘阶段' | '已发售';
  estimated_release_date?: string;
  team_size?: number;
  last_updated: string;
  credibility_score: number;
  public_info: string;
  silver_info: string;
  gold_info: string;
  risk_assessment: string;
  tags: string[];
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}
