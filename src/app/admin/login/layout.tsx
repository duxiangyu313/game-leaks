import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理员登录 · 国游爆料后台",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
