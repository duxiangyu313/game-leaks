import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "订阅成功 · 国游爆料会员开通成功页面",
  robots: { index: false, follow: false },
};

export default function MemberSuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
