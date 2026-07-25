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

export type ArticleCategory = 'review' | 'preview' | 'analysis' | 'interview' | 'opinion' | 'leak' | 'news' | 'video' | 'misc';
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
  contentLevel?: ContentLevel;
  isUgc?: boolean;
  creatorId?: string;
  revenueSplit?: number;
  canDeleteAfter?: string;
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
export type ContentLevel = 'free' | 'gold' | 'diamond';
export type PayoutMethod = 'alipay' | 'wechat';

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  avatar?: string;
  membership: MembershipTier;
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'inactive' | 'trialing';
  subscriptionEndDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  joinedAt: string;
  bookmarks: string[];
  following: string[];
  referralCode?: string;
  referrerId?: string;
  revenueBalance?: number;
  totalEarned?: number;
  banned?: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  stripeSessionId?: string;
  alipayTradeNo?: string;
  amount: number;
  currency: string;
  tier: MembershipTier;
  billingCycle: 'monthly' | 'yearly';
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  paymentMethod: 'stripe' | 'alipay' | 'wechat';
  relatedReferralId?: string;
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
  gold_info: string;
  diamond_info?: string;
  risk_assessment: string;
  tags: string[];
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

// ═══ UGC 系统类型 ═══
export interface UgcSubmission {
  id: string; userId: string; title: string; content: string;
  coverImage?: string; category: ArticleCategory; contentLevel: ContentLevel;
  gameName?: string; gameId?: string; tags: string[];
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  reviewerId?: string; reviewNote?: string; revenueSplit?: number;
  submittedAt: string; reviewedAt?: string;
}
export interface UgcContent {
  id: string; submissionId?: string; userId: string; title: string; content: string;
  coverImage?: string; category: string; contentLevel: ContentLevel;
  gameName?: string; gameId?: string; tags: string[];
  viewCount: number; likeCount: number; commentCount: number;
  publishedAt: string; canDeleteAfter?: string;
}
export interface RevenueRecord {
  id: string; contentId: string; contentType: 'ugc' | 'article' | 'leak';
  creatorId: string; amount: number; revenueType: 'ad_share' | 'subscription_share' | 'bonus';
  settlementMonth?: string; settlementStatus: 'pending' | 'settled' | 'withdrawn';
  settlementSplit?: number; notes?: string; createdAt: string;
}
export interface WithdrawalRequest {
  id: string; userId: string; amount: number; method: PayoutMethod;
  accountInfo: string; realName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  adminId?: string; adminNote?: string; processedAt?: string; createdAt: string;
}
export interface ReferralRecord {
  id: string; referrerId: string; invitedUserId?: string; referralCode: string;
  rewardDays: number; rewardApplied: boolean; invitedAt: string; rewardExpiresAt?: string;
}
export interface PlatformSetting {
  key: string; value: Record<string, unknown>; updatedAt: string;
}

// ═══ CJ2026 云逛展陪伴团类型 ═══
export interface Cj2026Purchase {
  id: string;
  email: string;
  amount: number;
  payment_method: 'stripe' | 'alipay';
  status: 'pending' | 'confirmed' | 'refunded';
  stripe_session_id?: string;
  alipay_transaction_id?: string;
  notes?: string;
  created_at: string;
  confirmed_at?: string;
  confirmed_by?: string;
}

export interface Cj2026Rating {
  id: string;
  game_name: string;
  game_slug: string;
  developer?: string;
  publisher?: string;
  genre?: string;
  cover_url?: string;
  graphics: number;
  gameplay: number;
  innovation: number;
  completeness: number;
  hype: number;
  overall_score: number;
  recommendation: 'must_play' | 'worth_playing' | 'wait_and_see' | 'skip';
  summary?: string;
  review?: string;
  trial_available: boolean;
  trial_duration?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Cj2026DailyBriefing {
  id: string;
  day: number;
  date: string;
  title: string;
  highlights: Cj2026Highlight[];
  summary?: string;
  is_published: boolean;
  publish_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Cj2026Highlight {
  title: string;
  description: string;
  image_url: string;
  game_slug?: string;
  importance: 'high' | 'medium' | 'low';
}
