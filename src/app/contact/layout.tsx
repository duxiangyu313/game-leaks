import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "联系我们 · 国游爆料商务合作与问题反馈",
  description: "联系国游爆料团队：商务合作洽谈、广告投放咨询、内容授权、爆料线索提交、账号问题反馈与会员服务支持。我们专注国产3A游戏资讯，覆盖黑神话悟空、影之刃零、归唐等国产大作，欢迎游戏厂商、媒体同行与玩家通过各种渠道与我们取得联系。",
  alternates: { canonical: "/contact/" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
