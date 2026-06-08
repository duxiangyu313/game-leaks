"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Settings, Loader2, Check } from "lucide-react";

export default function AccountSettings() {
  const [username, setUsername] = useState("");
  const [original, setOriginal] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("profiles").select("username").eq("id", user.id).single().then(({ data }) => {
        if (data?.username) {
          setUsername(data.username);
          setOriginal(data.username);
        }
      });
    });
  }, []);

  const handleSave = async () => {
    if (!username.trim()) { setError("用户名不能为空"); return; }
    setSaving(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: err } = await supabase.from("profiles").update({ username: username.trim() }).eq("id", user.id);
    if (err) {
      setError(err.message);
    } else {
      setOriginal(username.trim());
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-[#94A3B8] mb-1.5">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-[#0F172A] border border-[rgba(30,41,59,0.8)] rounded-lg text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#06B6D4] transition-all"
            placeholder="设置你的用户名"
          />
        </div>
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving || username === original}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#06B6D4] text-white rounded-lg hover:bg-[#0891B2] disabled:opacity-30 transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          {done ? "已保存" : "保存"}
        </button>
      </div>
    </div>
  );
}
