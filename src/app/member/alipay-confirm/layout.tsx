import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "支付确认 · 国游爆料会员支付宝支付确认页",
  robots: { index: false, follow: false },
};

export default function MemberAlipayConfirmLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
