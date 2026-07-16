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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function check() {
      try {
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "认证失败");
      } finally {
        setLoading(false);
      }
    }
    check();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080A0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F5A623] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#080A0D] flex flex-col items-center justify-center gap-4">
        <p className="text-[#EF4444] text-lg font-semibold">认证失败</p>
        <p className="text-[#94A3B8] text-sm">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
          className="px-4 py-2 bg-[#F5A623] text-white rounded-lg text-sm font-medium"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ user: adminUser, loading }}>
      {adminUser ? children : null}
    </AdminContext.Provider>
  );
}
