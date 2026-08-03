import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "全站搜索 - 黑神话悟空/影之刃零/归唐/湮灭之潮国产3A游戏资讯",
  description: "在国游爆料全站搜索框中输入关键词，即可一键查找黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A游戏的最新爆料、深度分析文章、游戏库资料、视频评测内容以及论坛社区中的热门讨论、玩家观点与官方公告转载，快速定位你关心的国产游戏资讯，支持多维度筛选与排序。",
  alternates: { canonical: "/search/" },
  openGraph: {
    title: "全站搜索 - 黑神话悟空/影之刃零/归唐/湮灭之潮国产3A游戏资讯 · 国游爆料",
    description: "在国游爆料全站搜索框中输入关键词，即可一键查找黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A游戏的最新爆料、深度分析文章、游戏库资料、视频评测内容以及论坛社区中的热门讨论、玩家观点与官方公告转载，快速定位你关心的国产游戏资讯，支持多维度筛选与排序。",
    url: "https://news.guoyouwenduji.cc/search/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "全站搜索 - 黑神话悟空/影之刃零/归唐/湮灭之潮国产3A游戏资讯 · 国游爆料",
    description: "在国游爆料全站搜索框中输入关键词，即可一键查找黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A游戏的最新爆料、深度分析文章、游戏库资料、视频评测内容以及论坛社区中的热门讨论、玩家观点与官方公告转载，快速定位你关心的国产游戏资讯，支持多维度筛选与排序。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
