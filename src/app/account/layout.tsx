import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "账户设置 · 国游爆料会员资料与订阅管理",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
