import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "订阅更新 · 第一时间获取国产3A游戏爆料",
  description: "订阅国游爆料更新通知，第一时间获取黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A大作的最新爆料、发售动态、深度评测与行业独家消息。支持邮件订阅与预购提醒，重要游戏事件不再错过，做最早知道国产大作动态的人。",
  alternates: { canonical: "/subscribe/" },
};

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
