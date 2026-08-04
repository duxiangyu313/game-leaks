import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "加入我们 · 国游爆料创作者招募计划",
  description: "加入国游爆料创作者团队，与我们一起追踪黑神话悟空、影之刃零、归唐等国产3A大作。无论你是游戏资讯写手、深度评测作者、视频创作者还是行业内幕知情人，都能找到适合自己的创作方向，优质内容可享最高40%创作者分成与专属流量扶持。",
  alternates: { canonical: "/join/" },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
