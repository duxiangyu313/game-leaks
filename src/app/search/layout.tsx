import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "全站搜索",
  description: "搜索国游爆料全部内容 — 游戏、爆料、文章、论坛帖子一键搜索。",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
