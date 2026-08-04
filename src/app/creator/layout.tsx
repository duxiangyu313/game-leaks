import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "创作者中心 · 国游爆料内容创作与收益分成",
  description: "国游爆料创作者中心，为国产3A游戏内容创作者提供文章发布、独家爆料投稿、深度评测创作等变现机会。钻石会员可享最高40%创作者分成，优质内容获得官方流量扶持与推广资源，与平台共同打造有温度的国产游戏观察社区。",
  alternates: { canonical: "/creator/" },
};

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
