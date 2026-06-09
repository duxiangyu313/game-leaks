import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "匿名爆料",
  description: "匿名提交国产3A游戏爆料信息 — 安全、保密。你的消息可能成为独家新闻。",
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
