import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "激活码领取",
  description: "国游爆料会员专属 — 国产3A游戏激活码、测试资格、福利兑换。",
};

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
