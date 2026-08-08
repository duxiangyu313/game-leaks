"use client";

import { useEffect, useState } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import { Play, Search, Clock } from "lucide-react";

// 静态回退数据（Supabase 不可用时使用，与首页 VideoSection 保持一致）
const MOCK_VIDEOS = [
  { id: "v8", title: "第8期 · 归唐实机深度解析——我看了五遍才发现这游戏不对劲", content: 'BV1dTEu6PE5d', created_at: "2026-06-09T00:00:00Z", required_tier: "free" },
  { id: "v7", title: "第7期 · 归唐SGF首曝——国产3A登上世界舞台", content: 'BV1i37D6UE6H', created_at: "2026-06-09T00:00:00Z", required_tier: "free" },
  { id: "v6", title: "第6期 · 影之刃零跳票到10月——灵游坊在赌什么？", content: 'BV1EwEF62Evi', created_at: "2026-06-09T00:00:00Z", required_tier: "free" },
  { id: "v5", title: "第5期 · 湮灭之潮——中国人做的亚瑟王游戏，老外先疯了", content: 'BV1v3Vd6JEgw', created_at: "2026-06-09T00:00:00Z", required_tier: "free" },
  { id: "v4", title: "第4期 · 归唐——网易憋了一年的牌，终于要亮了", content: 'BV1DWV56FEX7', created_at: "2026-06-09T00:00:00Z", required_tier: "free" },
  { id: "v3", title: "第3期 · 48小时三国杀——国产3A赛道突然拥挤", content: 'BV1bnVH6LEtX', created_at: "2026-06-09T00:00:00Z", required_tier: "free" },
  { id: "v2", title: "第2期 · 影之刃零深度前瞻——只剩66天的杀手", content: 'BV1gXG16mE9E', created_at: "2026-06-09T00:00:00Z", required_tier: "free" },
  { id: "v1", title: "第1期 · 2026国产3A全景展望——中国游戏的新纪元", content: 'BV1qTG76yEUH', created_at: "2026-06-09T00:00:00Z", required_tier: "free" },
];

export default function VideosPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [videos, setVideos] = useState<any[]>(MOCK_VIDEOS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      supabase.from("articles").select("*").eq("category", "video").eq("status", "published").order("created_at", { ascending: false }),
      supabase.from("ugc_content").select("*").eq("category", "video").order("published_at", { ascending: false }),
    ]).then(([{ data: articles }, { data: ugcVideos }]) => {
      const all = [...(articles || []), ...((ugcVideos || []).map((v: any) => ({ ...v, created_at: v.published_at })))];
      if (all.length > 0) {
        all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setVideos(all);
      }
      // 如果 Supabase 返回空，保留 MOCK_VIDEOS（初始状态已有）
      setLoading(false);
    }).catch(() => {
      setLoading(false); // 出错时保留 MOCK_VIDEOS
    });
  }, []);

  const filtered = videos.filter(v => v.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-2"><Play className="w-7 h-7 text-[#E94560]" /><h1 className="text-3xl font-bold text-[#F1F5F9]">视频专区</h1></div>
        <p className="text-[#94A3B8] mb-8">国游爆料原创视频内容 · {videos.length} 期</p>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E293B]/60 border border-[rgba(30,41,59,0.6)] mb-8 max-w-sm">
          <Search className="w-4 h-4 text-[#64748B]" />
          <input type="text" placeholder="搜索视频..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none flex-1" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="h-56 rounded-xl bg-[#1E293B]/20 animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(v => {
              const bvMatch = v.title?.match(/BV[a-zA-Z0-9]+/) || v.content?.match(/BV[a-zA-Z0-9]+/);
              const bvid = bvMatch ? bvMatch[0] : null;
              const href = bvid ? `https://www.bilibili.com/video/${bvid}` : `/articles/${v.id}`;
              const isExternal = !!bvid;
              return (
                <LinkNoPrefetch key={v.id} href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined} className="glass-card block group hover:border-[#E94560]/20 transition-all">
                  <div className="aspect-video rounded-xl bg-[#1E293B] mb-3 flex items-center justify-center border border-[rgba(30,41,59,0.4)] group-hover:border-[#E94560]/20 transition-all relative overflow-hidden">
                    <Play className="w-10 h-10 text-[#E94560] group-hover:scale-110 transition-transform" />
                    {bvMatch && <span className="absolute bottom-2 right-2 text-[10px] text-[#64748B] bg-[#0F172A]/80 px-2 py-0.5 rounded">{bvMatch[1]}</span>}
                  </div>
                  <h3 className="font-bold text-[#F1F5F9] group-hover:text-[#E94560] transition-colors line-clamp-2">{v.title}</h3>
                  <p className="text-xs text-[#64748B] mt-2 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(v.created_at).toLocaleDateString("zh-CN")}</p>
                  {v.required_tier !== "free" && v.required_tier !== "public" && (
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B]">
                      {v.required_tier === "gold" ? "黄金" : "钻石"}可见
                    </span>
                  )}
                </LinkNoPrefetch>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
