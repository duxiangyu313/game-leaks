"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Play, Clock } from "lucide-react";
import Link from "next/link";

export default function VideoSection() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("articles")
      .select("*")
      .eq("category", "video")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setVideos(data || []);
        setLoading(false);
      });
  }, []);

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
            // Extract BV from iframe
            const bvMatch = v.content?.match(/bvid=(BV[a-zA-Z0-9]+)/);
            const bvid = bvMatch ? bvMatch[1] : null;
            return (
              <Link key={v.id} href={`/analysis`} className="glass-card block p-4 group hover:border-[#E94560]/20 transition-all">
                <div className="w-full aspect-video rounded-lg bg-[#1E293B] mb-3 flex items-center justify-center border border-[rgba(30,41,59,0.4)] group-hover:border-[#E94560]/20 transition-all relative overflow-hidden">
                  <Play className="w-8 h-8 text-[#E94560] group-hover:scale-110 transition-transform" />
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
