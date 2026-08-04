import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "广告投放 · 国游爆料国产3A游戏精准触达",
  description: "国游爆料广告与商务合作方案，面向国产游戏厂商、发行商与相关品牌，提供全站曝光、深度软文、评测合作、社区活动等多种广告形式。平台用户为关注黑神话悟空、影之刃零、归唐等国产3A大作的精准游戏玩家群体，欢迎联系洽谈合作。",
  alternates: { canonical: "/advertise/" },
};

export default function AdvertiseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
