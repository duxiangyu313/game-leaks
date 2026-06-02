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

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: 'review' | 'preview' | 'analysis' | 'interview' | 'opinion';
  gameId?: string;
  gameName?: string;
  authorId: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
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
