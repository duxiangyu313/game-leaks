import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "支付页面 · ChinaJoy 2026 国游爆料活动支付",
  robots: { index: false, follow: false },
};

export default function Cj2026PayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
