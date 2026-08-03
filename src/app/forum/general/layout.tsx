import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "综合讨论区 · 国产3A游戏玩家交流社区",
  description: "国游爆料综合讨论区，玩家自由分享国产3A游戏资讯、行业动态、心得体会与最新话题。涵盖黑神话悟空、影之刃零、归唐、湮灭之潮等热门国产大作的全方位讨论与玩家互动交流。",
  alternates: {
    canonical: "/forum/general/",
  },
};

export default function ForumGeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
