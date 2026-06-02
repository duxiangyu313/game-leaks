"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, Star } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useCachedQuery } from "@/lib/data-cache";
import type { Game } from "@/types";

const MOCK: (Game & { rank: number })[] = [
  { id: "1", rank: 1, title: "黑神话：悟空", developer: "游戏科学", publisher: "游戏科学", genre: ["动作RPG","神话"], platforms: ["PC","PS5"], releaseDate: "2024-08-20", status: "released", description: "国产3A开山之作", rating: 9.5, hypeScore: 98, cover: "", createdAt: "", updatedAt: "" },
  { id: "2", rank: 2, title: "影之刃零", developer: "灵游坊", publisher: "灵游坊", genre: ["动作RPG","武侠"], platforms: ["PC","PS5"], releaseDate: "2026-09-09", status: "announced", description: "暗黑武侠功夫朋克", hypeScore: 95, cover: "", createdAt: "", updatedAt: "" },
  { id: "3", rank: 3, title: "湮灭之潮", developer: "蛇夫座·日蚀边缘", publisher: "腾讯", genre: ["动作ACT","奇幻"], platforms: ["PC","PS5","Xbox"], status: "in-dev", description: "亚瑟王题材高速ACT", hypeScore: 88, cover: "", createdAt: "", updatedAt: "" },
  { id: "4", rank: 4, title: "归唐", developer: "网易雷火·临安24", publisher: "网易", genre: ["动作冒险","历史"], platforms: ["PC","主机"], status: "in-dev", description: "网易首款自研买断制3A", hypeScore: 86, cover: "", createdAt: "", updatedAt: "" },
];

export default function HotGames() {
  const { data: games, loading } = useCachedQuery<(Game & { rank: number })[]>(
    "hotGames",
    () => supabase
      .from("games")
      .select("*")
      .neq("status", "delayed")
      .order("hype_score", { ascending: false })
      .limit(4)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          return data.map((g: any, i: number) => ({ ...g, rank: i + 1, hypeScore: g.hype_score, releaseDate: g.release_date }));
        }
        return MOCK;
      }),
    MOCK,
    "hotGames"
  );

  if (loading) return (
    <section>
      <div className="flex items-center gap-3 mb-8"><div className="w-6 h-6 rounded bg-[#1E293B]/40 animate-pulse" /><div className="w-32 h-7 rounded bg-[#1E293B]/40 animate-pulse" /></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-xl bg-[#1E293B]/20 animate-pulse" />)}
      </div>
    </section>
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-[#06B6D4]" />
          <h2 className="text-2xl font-bold text-[#F1F5F9]">热门游戏</h2>
        </div>
        <Link href="/games" className="text-sm text-[#06B6D4] hover:text-[#22D3EE]">全部游戏 →</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {games.map((game, i) => (
          <motion.div key={game.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
            <Link href={`/games/detail?id=${game.id}`} className="glass-card block p-4 group h-full">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-lg font-black ${game.rank === 1 ? "text-[#F59E0B]" : game.rank === 2 ? "text-[#94A3B8]" : game.rank === 3 ? "text-[#D97706]" : "text-[#64748B]"}`}>#{game.rank}</span>
                {game.rating && <span className="flex items-center gap-1 text-xs text-[#F59E0B]"><Star className="w-3 h-3 fill-[#F59E0B]" />{game.rating}</span>}
              </div>
              <div className="w-full h-32 rounded-lg bg-gradient-to-br from-[#1E293B] to-[#0F172A] mb-3 flex items-center justify-center text-4xl border border-[rgba(30,41,59,0.5)]">{game.title.charAt(0)}</div>
              <h3 className="font-semibold text-[#F1F5F9] group-hover:text-[#06B6D4] transition-colors text-sm">{game.title}</h3>
              <p className="text-xs text-[#64748B] mt-1">{game.developer}</p>
              <div className="flex items-center gap-2 mt-3">
                {game.platforms?.map((p: string) => <span key={p} className="text-[10px] text-[#64748B] bg-[#1E293B] px-2 py-0.5 rounded">{p}</span>)}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] rounded-full" style={{ width: `${game.hypeScore}%` }} />
                </div>
                <span className="text-[10px] text-[#64748B]">{game.hypeScore}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
