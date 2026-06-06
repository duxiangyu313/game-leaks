"use client";

import { supabase } from "@/lib/supabase/client";
import { useCachedQuery } from "@/lib/data-cache";
import { Play, Clock } from "lucide-react";
import Link from "next/link";

export default function VideoSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: videos, loading } = useCachedQuery<any[]>(
    "videos",
    () => supabase
      .from("articles")
      .select("*")
      .eq("category", "video")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data }) => data || []),
    [],
    "videos"
  );

  if (loading || videos.length === 0) return null;

  return (
    <section className="py-16 bg-[#0B1120]/50 border-t border-b border-[rgba(30,41,59,0.3)]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Play className="w-6 h-6 text-[#E94560]" />
          <h2 className="text-2xl font-bold text-[#F1F5F9]">往期视频</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {videos.map((v) => {
            const bvMatch = v.title?.match(/BV[a-zA-Z0-9]+/) || v.content?.match(/BV[a-zA-Z0-9]+/);
            const bvid = bvMatch ? bvMatch[0] : null;
            const href = bvid ? `https://www.bilibili.com/video/${bvid}` : `/articles/detail?id=${v.id}`;
            const isExternal = !!bvid;
            return (
              <Link key={v.id} href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined} className="glass-card block p-4 group hover:border-[#E94560]/20 transition-all">
                <div className="w-full aspect-video rounded-lg bg-[#1E293B] mb-3 flex items-center justify-center border border-[rgba(30,41,59,0.4)] group-hover:border-[#E94560]/20 transition-all relative overflow-hidden">
                  <Play className="w-8 h-8 text-[#E94560] group-hover:scale-110 transition-transform" />
                  {bvid && <span className="absolute bottom-2 right-2 text-[10px] text-[#64748B] bg-[#0F172A]/80 px-2 py-0.5 rounded">{bvid}</span>}
                </div>
                <h3 className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#E94560] transition-colors line-clamp-2">
                  {v.title}
                </h3>
                <p className="text-xs text-[#64748B] mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(v.created_at).toLocaleDateString("zh-CN")}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
