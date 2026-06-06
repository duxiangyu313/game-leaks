"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/auth";
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

/**
 * 管理员认证守卫 — 包裹整个 /admin 路由
 * 通过 Supabase profiles.membership 判定（diamond = 管理员），不再暴露邮箱列表
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

      const admin = await isAdmin();
      if (!admin) {
        await supabase.auth.signOut();
        router.push("/admin/login?error=unauthorized");
        return;
      }

      setAdminUser({
        id: session.user.id,
        email: session.user.email || "",
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
