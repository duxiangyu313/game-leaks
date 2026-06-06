"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Save, Loader2, Check } from "lucide-react";

function WikiEditContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [game, setGame] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wiki, setWiki] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form fields
  const [background, setBackground] = useState("");
  const [worldview, setWorldview] = useState("");
  const [charactersJson, setCharactersJson] = useState("[]");
  const [weaponsJson, setWeaponsJson] = useState("[]");
  const [mapsJson, setMapsJson] = useState("[]");
  const [devNotes, setDevNotes] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("games").select("id,title").eq("id", id).single(),
      supabase.from("game_wiki").select("*").eq("game_id", id).single(),
    ]).then(([{ data: g }, { data: w }]) => {
      setGame(g);
      if (w) {
        setWiki(w);
        setBackground(w.background || "");
        setWorldview(w.worldview || "");
        setCharactersJson(typeof w.characters === "string" ? w.characters : JSON.stringify(w.characters || [], null, 2));
        setWeaponsJson(typeof w.weapons === "string" ? w.weapons : JSON.stringify(w.weapons || [], null, 2));
        setMapsJson(typeof w.maps === "string" ? w.maps : JSON.stringify(w.maps || [], null, 2));
        setDevNotes(w.developer_notes || "");
      }
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("请先登录"); return; }

    // Validate JSON fields
    try { JSON.parse(charactersJson); } catch { alert("角色数据JSON格式错误"); return; }
    try { JSON.parse(weaponsJson); } catch { alert("武器数据JSON格式错误"); return; }
    try { JSON.parse(mapsJson); } catch { alert("地图数据JSON格式错误"); return; }

    setSaving(true);
    const payload = {
      game_id: id,
      background, worldview,
      characters: charactersJson,
      weapons: weaponsJson,
      maps: mapsJson,
      developer_notes: devNotes,
      last_edited_by: user.id,
    };

    let error;
    if (wiki) {
      ({ error } = await supabase.from("game_wiki").update(payload).eq("game_id", id));
    } else {
      ({ error } = await supabase.from("game_wiki").insert(payload));
    }

    if (error) {
      alert("保存失败: " + error.message);
    } else {
      setSaved(true);
      setTimeout(() => router.push(`/games/detail?id=${id}`), 1500);
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="pt-20 pb-20 flex justify-center"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" /></div>
  );

  if (!game) return (
    <div className="pt-20 pb-20 text-center text-[#64748B]">游戏未找到</div>
  );

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/games/detail?id=${id}`} className="text-[#64748B] hover:text-[#F1F5F9]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">编辑百科 · {game.title}</h1>
        </div>

        {saved && (
          <div className="glass-card p-4 mb-6 flex items-center gap-2 text-[#10B981] border border-[#10B981]/20">
            <Check className="w-5 h-5" /> 百科已保存，正在跳转...
          </div>
        )}

        <div className="glass-card p-6 space-y-6">
          {/* Background */}
          <div>
            <label className="block text-sm font-semibold text-[#F1F5F9] mb-2">📖 游戏背景</label>
            <textarea value={background} onChange={e => setBackground(e.target.value)} rows={5}
              placeholder="介绍游戏的故事背景和历史设定..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none resize-y" />
          </div>

          {/* Worldview */}
          <div>
            <label className="block text-sm font-semibold text-[#F1F5F9] mb-2">🌍 世界观</label>
            <textarea value={worldview} onChange={e => setWorldview(e.target.value)} rows={5}
              placeholder="描述游戏的世界观设定..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none resize-y" />
          </div>

          {/* Characters */}
          <div>
            <label className="block text-sm font-semibold text-[#F1F5F9] mb-2">👤 角色介绍 (JSON)</label>
            <textarea value={charactersJson} onChange={e => setCharactersJson(e.target.value)} rows={8}
              placeholder='[{"name": "角色名", "desc": "角色描述", "image": ""}, ...]'
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-xs font-mono outline-none resize-y" />
            <p className="text-xs text-[#64748B] mt-1">JSON格式：数组，每项包含 name, desc, image 字段</p>
          </div>

          {/* Weapons */}
          <div>
            <label className="block text-sm font-semibold text-[#F1F5F9] mb-2">⚔️ 武器装备 (JSON)</label>
            <textarea value={weaponsJson} onChange={e => setWeaponsJson(e.target.value)} rows={6}
              placeholder='[{"name": "武器名", "type": "类型", "desc": "描述"}, ...]'
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-xs font-mono outline-none resize-y" />
            <p className="text-xs text-[#64748B] mt-1">JSON格式：数组，每项包含 name, type, desc 字段</p>
          </div>

          {/* Maps */}
          <div>
            <label className="block text-sm font-semibold text-[#F1F5F9] mb-2">🗺️ 地图区域 (JSON)</label>
            <textarea value={mapsJson} onChange={e => setMapsJson(e.target.value)} rows={6}
              placeholder='[{"name": "区域名", "desc": "描述"}, ...]'
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-xs font-mono outline-none resize-y" />
            <p className="text-xs text-[#64748B] mt-1">JSON格式：数组，每项包含 name, desc 字段</p>
          </div>

          {/* Dev Notes */}
          <div>
            <label className="block text-sm font-semibold text-[#F1F5F9] mb-2">📝 开发秘闻</label>
            <textarea value={devNotes} onChange={e => setDevNotes(e.target.value)} rows={4}
              placeholder="关于游戏开发的幕后故事、团队信息等..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none resize-y" />
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "保存中..." : "提交百科编辑"}
          </button>
          <p className="text-xs text-[#64748B] text-center">所有编辑需管理员审核后发布</p>
        </div>
      </div>
    </div>
  );
}

export default function WikiEditPage() {
  return <Suspense fallback={<div className="pt-20 pb-20 flex justify-center"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" /></div>}><WikiEditContent /></Suspense>;
}
