import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "免费试用 · 体验国游爆料会员专属内容",
  description: "免费试用国游爆料会员服务，体验黄金与钻石会员的专属权益：深度解析全文阅读、独家攻略、高清原画下载、全网独家爆料与开发者访谈。按需选择适合自己的会员档位，随时订阅随时取消，畅享国产3A游戏第一手资讯。",
  alternates: { canonical: "/trial/" },
};

export default function TrialLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
