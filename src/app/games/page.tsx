"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, Search, Star } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("games").select("*").order("hype_score", { ascending: false }).then(({ data }) => {
      setGames(data || []); setLoading(false);
    });
  }, []);

  const filtered = games.filter(g => g.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2"><Gamepad2 className="w-7 h-7 text-[#06B6D4]" /><h1 className="text-3xl font-bold text-[#F1F5F9]">游戏库</h1></div>
            <p className="text-[#94A3B8]">国产3A游戏完整数据库 · {games.length} 款</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E293B]/60 border border-[rgba(30,41,59,0.6)]">
            <Search className="w-4 h-4 text-[#64748B]" />
            <input type="text" placeholder="搜索游戏..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none w-48" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-64 rounded-xl bg-[#1E293B]/20 animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((game, i) => (
              <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                <Link href={`/games/detail?id=${game.id}`} className="glass-card block p-4 group h-full hover:border-[#06B6D4]/20">
                  <div className="w-full h-36 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] mb-3 flex items-center justify-center text-5xl border border-[rgba(30,41,59,0.4)] group-hover:border-[#06B6D4]/20 transition-all">
                    {game.title?.charAt(0)}
                  </div>
                  <h3 className="font-bold text-[#F1F5F9] group-hover:text-[#06B6D4] transition-colors">{game.title}</h3>
                  <p className="text-xs text-[#64748B] mt-1">{game.developer}</p>
                  {game.rating && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-[#F59E0B]"><Star className="w-3 h-3 fill-[#F59E0B]" />{game.rating}</span>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#1E293B] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] rounded-full" style={{ width: `${game.hype_score || 50}%` }} />
                    </div>
                    <span className="text-[10px] text-[#64748B]">{game.hype_score || 50}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {game.platforms?.map((p: string) => <span key={p} className="text-[10px] text-[#64748B] bg-[#1E293B] px-2 py-0.5 rounded">{p}</span>)}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
