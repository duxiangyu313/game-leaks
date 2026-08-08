import type { Metadata } from "next";
import LeakDetailClient from "./LeakDetailClient";
import { readSeoMeta, writeSeoMeta } from "../../../lib/seoMeta";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE = "https://news.guoyouwenduji.cc";
const HEADERS = SUPABASE_ANON
  ? { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
  : {};

type LeakMeta = { title: string; summary: string | null; images: string[] | null };
const metaCache = new Map<string, LeakMeta>();

async function fetchAllLeaks(): Promise<{ id: string }[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/leaks?select=id,title,summary,images&status=eq.published&limit=2000`,
      { headers: HEADERS, cache: "no-store", signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    const map: Record<string, LeakMeta> = {};
    for (const r of rows) {
      const m = { title: r.title, summary: r.summary, images: r.images };
      metaCache.set(r.id, m);
      map[r.id] = m;
    }
    writeSeoMeta("leaks", map);
    return (rows || []).map((r: { id: string }) => ({ id: r.id }));
  } catch {
    return [];
  }
}

async function fetchOneLeak(id: string): Promise<LeakMeta | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/leaks?select=id,title,summary,images&id=eq.${encodeURIComponent(id)}&limit=1`,
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
  return fetchAllLeaks();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const m =
    (readSeoMeta("leaks") as Record<string, LeakMeta>)[id] ||
    metaCache.get(id) ||
    (await fetchOneLeak(id));
  if (!m) {
    return {
      title: "国产3A游戏最新爆料 · 国游爆料",
      description: "国游爆料 — 黑神话悟空、影之刃零、归唐等国产3A游戏最新传闻与官方确认消息。",
    };
  }
  const cleanTitle = m.title.replace(/\s*·\s*国游爆料\s*$/, "").trim();
  let desc = m.summary || cleanTitle;
  // 过短的描述会触发 Bing "Meta descriptions too short"，用唯一标题前缀补齐，保持描述唯一
  if (desc.length < 70) desc = `${cleanTitle} —— 国游爆料持续追踪黑神话悟空、影之刃零、归唐等国产3A游戏的最新爆料、官方动态确认消息与深度背景解读，做有温度的国产游戏观察者。`;
  const url = `${BASE}/leaks/${id}`;
  return {
    // leaks/layout.tsx 的静态 metadata 切断了根 layout 的 title.template 继承，
    // 故这里手动拼品牌后缀，保证详情页标题带「· 国游爆料」
    title: `${cleanTitle} · 国游爆料`,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: `${cleanTitle} · 国游爆料`,
      description: desc,
      url,
      type: "article",
      images: m.images && m.images[0] ? [{ url: m.images[0] }] : [],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeakDetailClient id={id} />;
}
