import type { Metadata } from "next";
import GameDetailClient from "./GameDetailClient";
import { readSeoMeta, writeSeoMeta } from "../../../lib/seoMeta";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE = "https://news.guoyouwenduji.cc";
const HEADERS = SUPABASE_ANON
  ? { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
  : {};

type GameMeta = { title: string; description: string | null; developer: string | null };
const metaCache = new Map<string, GameMeta>();

async function fetchAllGames(): Promise<{ id: string }[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/games?select=id,title,description,developer&limit=2000`,
      { headers: HEADERS, cache: "no-store", signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    const map: Record<string, GameMeta> = {};
    for (const r of rows) {
      const m = { title: r.title, description: r.description, developer: r.developer };
      metaCache.set(r.id, m);
      map[r.id] = m;
    }
    writeSeoMeta("games", map);
    return (rows || []).map((r: { id: string }) => ({ id: r.id }));
  } catch {
    return [];
  }
}

async function fetchOneGame(id: string): Promise<GameMeta | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/games?select=id,title,description,developer&id=eq.${encodeURIComponent(id)}&limit=1`,
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
  return fetchAllGames();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const m =
    (readSeoMeta("games") as Record<string, GameMeta>)[id] ||
    metaCache.get(id) ||
    (await fetchOneGame(id));
  if (!m) {
    return {
      title: "国产3A游戏库 · 国游爆料",
      description: "国游爆料游戏库 — 黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A游戏介绍、评测与攻略。",
    };
  }
  const cleanTitle = m.title.replace(/\s*·\s*国游爆料\s*$/, "").trim();
  let desc =
    m.description ||
    `${cleanTitle} — ${m.developer || "国产游戏"}，最新动态、评测、攻略与玩家社区。`;
  // 过短的描述会触发 Bing "Meta descriptions too short"，用唯一标题前缀补齐，保持描述唯一
  if (desc.length < 70) desc = `${cleanTitle} —— 国游爆料游戏库为您收录黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声、百面千相等国产3A游戏的详细介绍、实机评测、通关攻略与玩家社区讨论。`;
  const url = `${BASE}/games/${id}`;
  return {
    // games/layout.tsx 的静态 metadata 切断了根 layout 的 title.template 继承，
    // 故这里手动拼品牌后缀，保证详情页标题带「· 国游爆料」
    title: `${cleanTitle} · 国游爆料`,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: `${cleanTitle} · 国游爆料`,
      description: desc,
      url,
      type: "website",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GameDetailClient id={id} />;
}
