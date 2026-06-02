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

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  avatar?: string;
  wechatId?: string;
  role: 'user' | 'vip' | 'admin';
  joinedAt: string;
  bookmarks: string[];
  following: string[];
}

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  tag?: string;
}
