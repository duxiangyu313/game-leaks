import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服务条款 · 国游爆料用户使用协议",
  description: "国游爆料平台服务条款与用户使用协议，详细说明账号注册与使用规范、会员订阅服务规则、内容使用授权范围、用户行为准则、平台免责条款与争议解决方式。使用国游爆料网站及相关服务前，请仔细阅读并理解本条款的全部内容。",
  alternates: { canonical: "/terms/" },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
