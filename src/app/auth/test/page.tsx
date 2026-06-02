"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AuthTestPage() {
  const [email, setEmail] = useState("1852779947@qq.com");
  const [password, setPassword] = useState("yuyu1852779947");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setResult("开始...");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setResult(error ? "失败: " + error.message : "成功! 用户: " + data.user?.email);
    } catch (e: any) {
      setResult("异常: " + (e.message || String(e)));
    }
    setLoading(false);
  };

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-md mx-auto px-4">
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">Auth 调试</h2>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 mb-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 mb-4 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
          <button onClick={testLogin} disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-all">
            {loading ? "测试中..." : "测试登录"}
          </button>
          {result && (
            <div className={`mt-4 p-3 rounded-xl text-sm ${result.startsWith("成功") ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
