"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { uploadToR2 } from "@/lib/cloudflare/r2";

function EditForm() {
  const router = useRouter(); const params = useSearchParams(); const id = params.get("id");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState(""); const [englishTitle, setEnglishTitle] = useState("");
  const [developer, setDeveloper] = useState(""); const [publisher, setPublisher] = useState("");
  const [genre, setGenre] = useState(""); const [platforms, setPlatforms] = useState("");
  const [releaseDate, setReleaseDate] = useState(""); const [status, setStatus] = useState("in-dev");
  const [description, setDescription] = useState(""); const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false); const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) { router.push("/admin/games"); return; }
    supabase.from("games").select("*").eq("id", id).single().then(({ data }) => {
      if (data) { setTitle(data.title); setEnglishTitle(data.english_title||""); setDeveloper(data.developer||""); setPublisher(data.publisher||""); setGenre((data.genre||[]).join(",")); setPlatforms((data.platforms||[]).join(",")); setReleaseDate(data.release_date||""); setStatus(data.status); setDescription(data.description||""); setCoverUrl(data.cover||""); }
      setLoading(false);
    });
  }, [id, router]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const r = await uploadToR2(file); setCoverUrl(r.url); } catch { alert("上传失败"); }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("games").update({ title, english_title: englishTitle, developer, publisher, genre: genre.split(",").map(s=>s.trim()).filter(Boolean), platforms: platforms.split(",").map(s=>s.trim()).filter(Boolean), release_date: releaseDate, status, description, cover: coverUrl }).eq("id", id);
    setSaving(false); router.push("/admin/games");
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin"/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><LinkNoPrefetch href="/admin/games" className="text-[#64748B] hover:text-[#F1F5F9]"><ArrowLeft className="w-5 h-5"/></LinkNoPrefetch><h1 className="text-2xl font-bold text-[#F1F5F9]">编辑游戏</h1></div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-semibold rounded-xl disabled:opacity-50">{saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>} 保存</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-[#64748B]">游戏名称</label><input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none"/></div>
            <div><label className="text-xs text-[#64748B]">英文名</label><input type="text" value={englishTitle} onChange={e=>setEnglishTitle(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none"/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-[#64748B]">开发商</label><input type="text" value={developer} onChange={e=>setDeveloper(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none"/></div>
            <div><label className="text-xs text-[#64748B]">发行商</label><input type="text" value={publisher} onChange={e=>setPublisher(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none"/></div>
          </div>
          <div><label className="text-xs text-[#64748B]">发售日期</label><input type="text" value={releaseDate} onChange={e=>setReleaseDate(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none"/></div>
          <div><label className="text-xs text-[#64748B]">简介</label><textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none resize-y"/></div>
        </div>
        <div className="glass-card p-6 space-y-4">
          <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-[rgba(30,41,59,0.6)] rounded-xl cursor-pointer hover:border-[#06B6D4]/30">
            <Upload className={`w-8 h-8 ${coverUrl?'text-[#10B981]':'text-[#64748B]'}`}/>
            <span className="text-sm text-[#64748B]">{uploading?'上传中...':coverUrl?'更换封面':'上传封面'}</span>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden"/>
          </label>
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          {coverUrl && <img src={coverUrl} alt="封面" loading="lazy" className="w-full rounded-xl"/>}
        </div>
      </div>
    </div>
  );
}

export default function EditGamePage() {
  return <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin"/></div>}><EditForm/></Suspense>;
}
