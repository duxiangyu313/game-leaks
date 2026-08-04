import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "支付成功 · ChinaJoy 2026 国游爆料活动",
  robots: { index: false, follow: false },
};

export default function Cj2026SuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
