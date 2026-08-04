import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "订阅取消 · 国游爆料会员取消页面",
  robots: { index: false, follow: false },
};

export default function MemberCancelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
