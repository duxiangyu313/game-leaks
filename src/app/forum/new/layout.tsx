import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "发布新帖 · 国产3A游戏玩家社区发帖分享与讨论交流",
  description: "在国游爆料玩家社区发布新帖，分享你对黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A游戏的见解与发现。支持攻略分享、提问互动、爆料讨论与组队招募等多种话题。",
  alternates: {
    canonical: "/forum/new/",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForumNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
