"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Save, Eye, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { uploadToR2 } from "@/lib/cloudflare/r2";

const TIERS = [
  { value: "free", label: "免费可见" },
  { value: "silver", label: "白银及以上" },
  { value: "gold", label: "黄金及以上" },
  { value: "diamond", label: "仅钻石" },
];

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("analysis");
  const [requiredTier, setRequiredTier] = useState("free");
  const [coverUrl, setCoverUrl] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadToR2(file);
      setCoverUrl(result.url);
      // 在正文中插入图片
      setContent((prev) => prev + `\n\n![${file.name}](${result.url})\n`);
    } catch (err) {
      alert("上传失败");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!title.trim()) return alert("请输入标题");
    setSaving(true);
    const { error } = await supabase.from("articles").insert({
      title, content, category, required_tier: requiredTier,
      cover_image: coverUrl, tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status: "published", author_id: (await supabase.auth.getUser()).data.user?.id,
    });
    if (error) { alert("保存失败: " + error.message); setSaving(false); return; }
    // 记录操作日志
    await supabase.from("admin_logs").insert({
      action: "create_article", detail: title, user_id: (await supabase.auth.getUser()).data.user?.id,
    });
    router.push("/admin/articles");
  };

  const markdownPreview = `# ${title || "文章标题"}\n\n${content || "开始输入内容..."}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles" className="text-[#64748B] hover:text-[#F1F5F9]"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">新建文章</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPreview(!preview)} className="flex items-center gap-2 px-4 py-2 text-sm border border-[rgba(30,41,59,0.6)] text-[#94A3B8] rounded-xl hover:text-[#F1F5F9] transition-all">
            <Eye className="w-4 h-4" /> {preview ? "编辑" : "预览"}
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-semibold rounded-xl hover:bg-[#0891B2] transition-all disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="文章标题" className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-lg font-bold placeholder-[#64748B] outline-none focus:border-[#06B6D4]/40"
          />

          {preview ? (
            <div className="min-h-[400px] p-6 rounded-xl bg-[#1E293B]/20 border border-[rgba(30,41,59,0.4)] text-[#F1F5F9] prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: markdownPreview.replace(/\n/g, "<br>") }} />
          ) : (
            <textarea
              value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Markdown 格式编辑..."
              rows={20}
              className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#06B6D4]/40 font-mono text-sm resize-y"
            />
          )}

          {/* Upload bar */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1E293B]/40 border border-dashed border-[rgba(30,41,59,0.6)] rounded-xl text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#06B6D4]/30 cursor-pointer transition-all">
              <Upload className="w-4 h-4" /> {uploading ? "上传中..." : "上传图片"}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
            {coverUrl && <span className="text-xs text-[#10B981]">封面已上传 ✓</span>}
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">发布设置</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#64748B] mb-1 block">分类</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none">
                  <option value="analysis">深度分析</option>
                  <option value="review">评测</option>
                  <option value="preview">前瞻</option>
                  <option value="interview">访谈</option>
                  <option value="opinion">观点</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#64748B] mb-1 block">可见权限</label>
                <select value={requiredTier} onChange={(e) => setRequiredTier(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none">
                  {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#64748B] mb-1 block">标签 (逗号分隔)</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                  placeholder="国产3A, 评测" className="w-full px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none placeholder-[#64748B]" />
              </div>
              <div>
                <label className="text-xs text-[#64748B] mb-1 block">封面图片URL</label>
                <input type="text" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..." className="w-full px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none placeholder-[#64748B]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
