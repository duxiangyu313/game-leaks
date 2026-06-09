import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "视频内容",
  description: "国游温度计视频内容 — 国产3A游戏资讯视频、实机演示、深度评测、行业观察。",
};

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
