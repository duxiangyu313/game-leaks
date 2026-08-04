import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "帖子详情 · 国产3A游戏玩家讨论与攻略心得交流",
  description: "查看国游爆料玩家社区帖子详情，参与黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A游戏话题讨论。发表你的观点、回复其他玩家、分享游戏心得，与社区成员互动交流。",
  alternates: {
    canonical: "/forum/post/",
  },
};

export default function ForumPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
