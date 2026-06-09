import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "爆料专区",
  description: "国产3A游戏最新爆料汇总 — 影之刃零延期、归唐SGF实机、湮灭之潮试玩。追踪国产大作传闻与官方确认消息。",
};

export default function LeaksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
