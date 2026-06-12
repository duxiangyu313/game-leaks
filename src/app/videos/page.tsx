"use client";

import { useEffect, useState } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import { Play, Search, Clock } from "lucide-react";

export default function VideosPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("articles").select("*").eq("category", "video").eq("status", "published").order("created_at", { ascending: false }).then(({ data }) => {
      setVideos(data || []); setLoading(false);
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
              const href = bvid ? `https://www.bilibili.com/video/${bvid}` : `/articles/detail?id=${v.id}`;
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
