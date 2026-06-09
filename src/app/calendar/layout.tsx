import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "游戏日历",
  description: "国产3A游戏事件日历 — 发售日、测试、展会、直播等时间节点一目了然。",
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
