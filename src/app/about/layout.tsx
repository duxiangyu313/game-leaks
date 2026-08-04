import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于我们 · 国游爆料团队介绍与内容理念",
  description: "了解国游爆料的创立初衷、内容理念与团队故事。我们专注国产3A游戏资讯，追踪黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作动态，以专业但不冷漠、有趣但不低俗的观察者视角，为玩家提供有温度的深度报道、独家爆料与行业分析。",
  alternates: { canonical: "/about/" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
