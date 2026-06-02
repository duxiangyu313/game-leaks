"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface Props {
  url: string;
  title?: string;
}

/** 视频嵌入：支持 B站 / YouTube */
export default function VideoEmbed({ url, title = "视频" }: Props) {
  const [loaded, setLoaded] = useState(false);

  if (!url) return null;

  const embedSrc = parseVideoUrl(url);
  if (!embedSrc) {
    return (
      <div className="glass-card p-4 text-center text-sm text-[#64748B]">
        不支持的视频链接：<a href={url} target="_blank" rel="noopener" className="text-[#06B6D4] underline">{url}</a>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[rgba(30,41,59,0.4)] my-6 bg-black">
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A2332] gap-3 z-10">
          <Play className="w-12 h-12 text-[#06B6D4]" />
          <span className="text-xs text-[#64748B]">{title}</span>
        </div>
      )}
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
        <iframe
          src={embedSrc}
          title={title}
          allowFullScreen
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
}

/** 解析视频URL，返回 iframe src */
function parseVideoUrl(url: string): string | null {
  // B站: bilibili.com/video/BVxxx 或 b23.tv
  const biliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
  if (biliMatch) {
    return `https://player.bilibili.com/player.html?bvid=${biliMatch[1]}&page=1&high_quality=1`;
  }
  // B站 BV号直接匹配
  const bvMatch = url.match(/^(BV[a-zA-Z0-9]{10})$/);
  if (bvMatch) {
    return `https://player.bilibili.com/player.html?bvid=${bvMatch[1]}&page=1&high_quality=1`;
  }

  // YouTube: youtube.com/watch?v=xxx 或 youtu.be/xxx
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // 已经是 iframe embed URL
  if (url.startsWith("https://player.bilibili.com/") || url.startsWith("https://www.youtube.com/embed/")) {
    return url;
  }

  return null;
}
