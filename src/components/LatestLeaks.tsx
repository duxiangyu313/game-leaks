"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Flame, Eye, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Leak } from "@/types";

const MOCK: Leak[] = [
  { id: "1", title: "网易《归唐》开发团队超200人", summary: "内部消息称归唐项目规模远超预期，雷火倾注全力打造网易第一款真正意义上的买断制3A", content: "", source: "内部渠道", credibility: "likely", gameId: "1", gameName: "归唐", images: [], publishedAt: "2026-06-01", authorId: "1", viewCount: 12800, commentCount: 326 },
  { id: "2", title: "腾讯蛇夫座第二项目曝光", summary: "继湮灭之潮后，腾讯蛇夫座的第二款3A项目浮出水面，据悉为现代军事战术射击题材", content: "", source: "招聘信息", credibility: "likely", gameId: "2", gameName: "蛇夫座新作", images: [], publishedAt: "2026-05-31", authorId: "2", viewCount: 9500, commentCount: 218 },
  { id: "3", title: "《影之刃零》收藏版定价泄露", summary: "网传影之刃零将推出三版本：标准版298元、豪华版398元、收藏版698元", content: "", source: "电商平台", credibility: "rumor", gameId: "3", gameName: "影之刃零", images: [], publishedAt: "2026-05-30", authorId: "3", viewCount: 7600, commentCount: 187 },
  { id: "4", title: "游戏科学第三项目代号'山海'", summary: "继黑神话悟空和钟馗之后，游戏科学第三个3A项目曝光，以西游记+山海经为世界观基底", content: "", source: "招聘信息", credibility: "likely", gameId: "4", gameName: "黑神话系列", images: [], publishedAt: "2026-05-29", authorId: "1", viewCount: 15200, commentCount: 412 },
];

export default function LatestLeaks() {
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("leaks")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setLeaks(data.map((l: any) => ({ ...l, gameId: l.id, publishedAt: l.published_at, viewCount: l.view_count, commentCount: l.comment_count || 0, gameName: l.game_name })));
        } else {
          setLeaks(MOCK);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <section>
      <div className="flex items-center gap-3 mb-8"><div className="w-6 h-6 rounded bg-[#1E293B]/40 animate-pulse" /><div className="w-32 h-7 rounded bg-[#1E293B]/40 animate-pulse" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-36 rounded-xl bg-[#1E293B]/20 animate-pulse" />)}
      </div>
    </section>
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Flame className="w-6 h-6 text-[#F59E0B]" />
          <h2 className="text-2xl font-bold text-[#F1F5F9]">最新爆料</h2>
          <span className="px-2 py-0.5 text-xs font-semibold bg-[#F59E0B]/15 text-[#F59E0B] rounded-full animate-pulse">LIVE</span>
        </div>
        <Link href="/leaks" className="flex items-center gap-1.5 text-sm text-[#06B6D4] hover:text-[#22D3EE] transition-colors">全部爆料 <ArrowRight className="w-4 h-4" /></Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leaks.map((leak, i) => (
          <motion.article key={leak.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card p-6 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${leak.credibility === "confirmed" ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20" : leak.credibility === "likely" ? "bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/20" : "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20"}`}>
                {leak.credibility === "confirmed" ? "已确认" : leak.credibility === "likely" ? "高可信" : "传闻"}
              </span>
              <span className="text-xs text-[#64748B] flex items-center gap-1"><Eye className="w-3 h-3" /> {leak.viewCount?.toLocaleString()}</span>
            </div>
            {leak.gameName && <span className="text-xs text-[#06B6D4] font-medium">{leak.gameName}</span>}
            <h3 className="text-lg font-semibold text-[#F1F5F9] mt-1 mb-2 group-hover:text-[#06B6D4] transition-colors">{leak.title}</h3>
            <p className="text-sm text-[#94A3B8] line-clamp-2 mb-3">{leak.summary}</p>
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {leak.publishedAt}</span>
              <span>💬 {leak.commentCount || 0} 评论</span>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
