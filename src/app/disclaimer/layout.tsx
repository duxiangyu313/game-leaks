import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "免责声明 · 国游爆料内容信息来源说明",
  description: "国游爆料免责声明，说明本站爆料与传闻类内容的来源性质与可信度分级机制，明确未经证实信息可能存在的偏差，以及平台对第三方链接、用户生成内容与游戏厂商官方信息转载的免责范围。请以游戏官方发布信息为准。",
  alternates: { canonical: "/disclaimer/" },
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
