"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { uploadToR2 } from "@/lib/cloudflare/r2";

export default function NewGamePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [englishTitle, setEnglishTitle] = useState("");
  const [developer, setDeveloper] = useState("");
  const [publisher, setPublisher] = useState("");
  const [genre, setGenre] = useState("");
  const [platforms, setPlatforms] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [status, setStatus] = useState("in-dev");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const r = await uploadToR2(file); setCoverUrl(r.url); } catch { alert("上传失败"); }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!title.trim()) return alert("请输入游戏名称");
    setSaving(true);
    await supabase.from("games").insert({
      title, english_title: englishTitle, developer, publisher,
      genre: genre.split(",").map(s=>s.trim()).filter(Boolean),
      platforms: platforms.split(",").map(s=>s.trim()).filter(Boolean),
      release_date: releaseDate || null, status, description, cover: coverUrl,
    });
    setSaving(false); router.push("/admin/games");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/games" className="text-[#64748B] hover:text-[#F1F5F9]"><ArrowLeft className="w-5 h-5"/></Link>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">添加游戏</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-semibold rounded-xl disabled:opacity-50">
          {saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>} 保存
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#64748B]">游戏名称 *</label>
              <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-[#64748B]">英文名</label>
              <input type="text" value={englishTitle} onChange={e=>setEnglishTitle(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#64748B]">开发商</label>
              <input type="text" value={developer} onChange={e=>setDeveloper(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-[#64748B]">发行商</label>
              <input type="text" value={publisher} onChange={e=>setPublisher(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#64748B]">类型 (逗号分隔)</label>
            <input type="text" value={genre} onChange={e=>setGenre(e.target.value)} placeholder="动作RPG, 开放世界" className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs text-[#64748B]">平台 (逗号分隔)</label>
            <input type="text" value={platforms} onChange={e=>setPlatforms(e.target.value)} placeholder="PC, PS5" className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#64748B]">发售日期</label>
              <input type="text" value={releaseDate} onChange={e=>setReleaseDate(e.target.value)} placeholder="2026-09-09" className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-[#64748B]">状态</label>
              <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none">
                <option value="announced">已公布</option><option value="in-dev">开发中</option><option value="beta">测试中</option><option value="released">已发售</option><option value="delayed">延期</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-[#64748B]">简介</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none resize-y" />
          </div>
        </div>
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#F1F5F9]">封面图</h3>
          <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-[rgba(30,41,59,0.6)] rounded-xl cursor-pointer hover:border-[#06B6D4]/30 transition-all">
            <Upload className={`w-8 h-8 ${coverUrl?'text-[#10B981]':'text-[#64748B]'}`} />
            <span className="text-sm text-[#64748B]">{uploading?'上传中...':coverUrl?'已上传':'点击上传封面图'}</span>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          {coverUrl && <img src={coverUrl} alt="封面预览" loading="lazy" className="w-full rounded-xl" />}
        </div>
      </div>
    </div>
  );
}
