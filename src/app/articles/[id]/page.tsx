import type { Metadata } from "next";
import ArticleDetailClient from "./ArticleDetailClient";
import { readSeoMeta, writeSeoMeta } from "../../../lib/seoMeta";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE = "https://news.guoyouwenduji.cc";
const HEADERS = SUPABASE_ANON
  ? { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
  : {};

// 模块级缓存：generateStaticParams 拉全量后填充，generateMetadata 直接读，避免重复查 Supabase 触发限流
type ArticleMeta = { title: string; excerpt: string | null; cover_image: string | null };
const metaCache = new Map<string, ArticleMeta>();

async function fetchAllArticles(): Promise<{ id: string }[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?select=id,title,excerpt,cover_image&status=eq.published&limit=2000`,
      { headers: HEADERS, cache: "no-store", signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    const map: Record<string, ArticleMeta> = {};
    for (const r of rows) {
      const m = { title: r.title, excerpt: r.excerpt, cover_image: r.cover_image };
      metaCache.set(r.id, m);
      map[r.id] = m;
    }
    writeSeoMeta("articles", map);
    return (rows || []).map((r: { id: string }) => ({ id: r.id }));
  } catch {
    return [];
  }
}

async function fetchOneArticle(id: string): Promise<ArticleMeta | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?select=id,title,excerpt,cover_image&id=eq.${encodeURIComponent(id)}&limit=1`,
      { headers: HEADERS, cache: "no-store", signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  return fetchAllArticles();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const m =
    (readSeoMeta("articles") as Record<string, ArticleMeta>)[id] ||
    metaCache.get(id) ||
    (await fetchOneArticle(id));
  if (!m) {
    return {
      title: "国产3A游戏深度解析评测爆料 · 国游爆料",
      description: "国游爆料 — 专注国产3A游戏的深度解析、评测与爆料。",
    };
  }
  const cleanTitle = m.title.replace(/\s*·\s*国游爆料\s*$/, "").trim();
  let desc = m.excerpt || cleanTitle;
  // 过短的描述会触发 Bing "Meta descriptions too short"，用唯一标题前缀补齐，保持描述唯一
  if (desc.length < 70) desc = `${cleanTitle} —— 国游爆料专注国产3A游戏的深度背景解析、专业评测与独家爆料，追踪黑神话悟空、影之刃零、归唐等大作的最新动态。`;
  const url = `${BASE}/articles/${id}`;
  return {
    title: cleanTitle,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: `${cleanTitle} · 国游爆料`,
      description: desc,
      url,
      type: "article",
      images: m.cover_image ? [{ url: m.cover_image }] : [],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArticleDetailClient id={id} />;
}
