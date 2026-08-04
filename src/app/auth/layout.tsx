import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录注册 · 国游爆料会员账号中心",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
