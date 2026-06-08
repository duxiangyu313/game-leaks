import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { Play } from "lucide-react";

interface VideosTabProps {
  videos: any[];
}

export default function VideosTab({ videos }: VideosTabProps) {
  if (videos.length === 0) {
    return <p className="text-[#64748B] text-center py-12">暂无相关视频</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {videos.map((v: any) => (
        <LinkNoPrefetch key={v.id} href={`/articles/detail?id=${v.id}`} className="glass-card block p-4 group hover:border-[#E94560]/20 transition-all">
          <div className="w-full aspect-video rounded-lg bg-[#1E293B] mb-3 flex items-center justify-center border border-[rgba(30,41,59,0.4)] group-hover:border-[#E94560]/20">
            <Play className="w-8 h-8 text-[#E94560] group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#E94560] transition-colors line-clamp-2">{v.title}</h4>
          <p className="text-xs text-[#64748B] mt-2">{new Date(v.created_at).toLocaleDateString("zh-CN")}</p>
        </LinkNoPrefetch>
      ))}
    </div>
  );
}
