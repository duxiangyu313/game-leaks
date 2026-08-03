import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "匿名爆料 - 国产3A游戏黑神话悟空/影之刃零/归唐内幕消息投稿",
  description: "在国游爆料匿名提交国产3A游戏内幕消息、行业爆料、独家线索或开发动态，整个提交过程采用安全保密机制，管理员团队将在收到线索后进行审核、核实与溯源，优质爆料可能被采纳为全网首发的深度报道、热点资讯或国游温度计视频选题内容，欢迎提供可验证的信息来源。",
  alternates: { canonical: "/submit/" },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
