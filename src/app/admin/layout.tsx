"use client";

import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "@/components/admin/AdminAuth";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 登录页不需要认证守卫，否则未登录用户永远看不到登录表单
  if (pathname?.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  return (
    <AdminAuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthProvider>
  );
}
