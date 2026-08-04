import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策 · 国游爆料用户数据保护说明",
  description: "国游爆料隐私政策，说明我们如何收集、使用、存储与保护您的个人信息。涵盖账号注册信息、浏览数据、会员订阅与支付信息的使用范围，Cookie与本地存储说明，您的数据访问与删除权利，以及联系我们处理隐私相关问题的方式。",
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
