"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

const AdminContext = createContext<{ user: AdminUser | null; loading: boolean }>({
  user: null,
  loading: true,
});

export const useAdmin = () => useContext(AdminContext);

/** 管理员邮箱白名单 — 只有这些邮箱可以登录后台 */
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

/**
 * 管理员认证守卫 — 包裹整个 /admin 路由
 * 验证用户已登录且邮箱在白名单中
 */
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/admin/login");
        return;
      }

      const email = session.user.email || "";
      const isAdmin = ADMIN_EMAILS.includes(email);

      if (!isAdmin) {
        await supabase.auth.signOut();
        router.push("/admin/login?error=unauthorized");
        return;
      }

      setAdminUser({
        id: session.user.id,
        email,
        role: "admin",
      });
      setLoading(false);
    }
    check();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin" />
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ user: adminUser, loading }}>
      {adminUser ? children : null}
    </AdminContext.Provider>
  );
}
