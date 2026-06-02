import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "国游爆料 · 国产3A游戏资讯平台",
  description: "国产3A游戏最新爆料、深度解析、游戏评测。追踪黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作动态。",
  keywords: "国产3A,游戏爆料,黑神话悟空,影之刃零,归唐,湮灭之潮,国产游戏",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
