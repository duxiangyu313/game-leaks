import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "用户协议 · 国游爆料社区用户行为规范",
  description: "国游爆料用户协议与社区行为规范，明确用户在平台发表内容、参与论坛讨论、使用会员服务时应遵守的规则。包括内容原创与转载规范、爆料信息真实性要求、社区发言守则、违规处理机制及账号使用责任，共同维护健康的国产3A游戏讨论社区。",
  alternates: { canonical: "/agreement/" },
};

export default function AgreementLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
