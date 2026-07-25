/**
 * CJ2026 云逛展陪伴团 — 工具函数
 */

// ── 价格日期切换 ──
export interface Cj2026Price {
  amount: number;
  label: string;
  isEarlyBird: boolean;
}

export function getPrice(): Cj2026Price {
  const now = new Date();
  const earlyBirdStart = new Date('2026-07-28T00:00:00+08:00');
  const cjStart = new Date('2026-07-31T00:00:00+08:00');
  const cjEnd = new Date('2026-08-04T00:00:00+08:00');

  if (now < earlyBirdStart) {
    return { amount: 9.9, label: '早鸟预售', isEarlyBird: true };
  } else if (now < cjStart) {
    return { amount: 9.9, label: '早鸟特惠', isEarlyBird: true };
  } else if (now < cjEnd) {
    return { amount: 19.9, label: 'CJ 正价', isEarlyBird: false };
  } else {
    return { amount: 14.9, label: '回放期', isEarlyBird: false };
  }
}

// ── 早鸟截止倒计时 ──
export function getEarlyBirdEnd(): Date {
  return new Date('2026-07-31T00:00:00+08:00');
}

// ── CJ 开幕倒计时 ──
export function getCjStart(): Date {
  return new Date('2026-07-31T09:00:00+08:00');
}

// ── localStorage 键 ──
const STORAGE_KEY = 'cj2026_access';

export interface Cj2026Access {
  email: string;
  unlockedAt: string;
  paymentMethod: 'stripe' | 'alipay';
}

export function getLocalAccess(): Cj2026Access | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Cj2026Access;
  } catch {
    return null;
  }
}

export function setLocalAccess(access: Cj2026Access): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(access));
}

export function clearLocalAccess(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// ── 日期格式化 ──
export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ── 推荐等级映射 ──
export const RECOMMENDATION_MAP: Record<string, { label: string; color: string; bg: string }> = {
  must_play: { label: '必玩', color: '#E94560', bg: 'bg-[#E94560]/15 text-[#E94560]' },
  worth_playing: { label: '值得玩', color: '#F5A623', bg: 'bg-[#F5A623]/15 text-[#F5A623]' },
  wait_and_see: { label: '观望', color: '#64748B', bg: 'bg-[#64748B]/15 text-[#64748B]' },
  skip: { label: '跳过', color: '#475569', bg: 'bg-[#475569]/15 text-[#475569]' },
};
