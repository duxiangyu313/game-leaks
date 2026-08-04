import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "版权声明 · 国游爆料内容版权与转载规范",
  description: "国游爆料版权声明，说明本站原创文章、评测、独家爆料与游戏截图素材的知识产权归属，转载与合作授权方式，以及玩家社区投稿内容的使用许可。未经授权请勿擅自复制、传播本站内容，商务转载与合作请联系国游爆料团队。",
  alternates: { canonical: "/copyright/" },
};

export default function CopyrightLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
