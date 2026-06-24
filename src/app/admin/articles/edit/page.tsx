"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { uploadToR2 } from "@/lib/cloudflare/r2";
import { getDefaultTemplateType } from "@/lib/markdown";
import { generateExcerpt } from "@/lib/article-utils";
import type { MembershipTier } from "@/types";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import TemplateSelector from "@/components/admin/TemplateSelector";
import FormatButton from "@/components/admin/FormatButton";
import type { TemplateType } from "@/types";

const TIERS = [
  { value: "free", label: "免费可见" },

  { value: "gold", label: "黄金及以上" },
  { value: "diamond", label: "仅钻石" },
];

const CATEGORIES = [
  { value: "analysis", label: "深度分析" },
  { value: "review", label: "评测" },
  { value: "preview", label: "前瞻" },
  { value: "leak", label: "爆料" },
  { value: "news", label: "新闻" },
  { value: "interview", label: "访谈" },
  { value: "opinion", label: "观点" },
];

function EditForm() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("analysis");
  const [requiredTier, setRequiredTier] = useState<MembershipTier>("free");
  const [coverUrl, setCoverUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [tags, setTags] = useState("");
  const [templateType, setTemplateType] = useState<TemplateType>("standard");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) { router.push("/admin/articles"); return; }
    supabase.from("articles").select("*").eq("id", id!).single().then(({ data }) => {
      if (data) {
        setTitle(data.title || "");
        setContent(data.content || "");
        setCategory(data.category || "analysis");
        setRequiredTier(data.required_tier || "free");
        setCoverUrl(data.cover_image || "");
        setExcerpt(data.excerpt || "");
        setVideoUrl("");
        setTags((data.tags || []).join(", "));
        setTemplateType(getDefaultTemplateType(data.category ?? "analysis"));
      }
      setLoading(false);
    });
  }, [id, router]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadToR2(file);
      setCoverUrl(result.url);
      setContent((prev) => prev + `\n\n![${file.name}](${result.url})\n`);
    } catch {
      alert("上传失败");
    }
    setUploading(false);
  };

  const handleTemplateSelect = (type: TemplateType) => {
    setTemplateType(type);
  };

  const handleFormat = (formatted: string) => {
    setContent(formatted);
  };

  const handleSave = async () => {
    setSaving(true);
    const autoExcerpt = excerpt.trim() || generateExcerpt(content, 160);

    await supabase.from("articles").update({
      title: title.trim(),
      content,
      category,
      required_tier: requiredTier,
      cover_image: coverUrl,
      excerpt: autoExcerpt,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    }).eq("id", id!);

    await supabase.from("admin_logs").insert({
      action: "edit_article",
      detail: title,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });

    router.push("/admin/articles");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LinkNoPrefetch href="/admin/articles" className="text-[#64748B] hover:text-[#F1F5F9]">
            <ArrowLeft className="w-5 h-5" />
          </LinkNoPrefetch>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">编辑文章</h1>
        </div>
        <div className="flex gap-2">
          <FormatButton content={content} templateType={templateType} onFormatted={handleFormat} />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-semibold rounded-xl hover:bg-[#0891B2] disabled:opacity-50 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 主编辑区 */}
        <div className="lg:col-span-3 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-lg font-bold outline-none focus:border-[#06B6D4]/40"
          />

          <MarkdownEditor value={content} onChange={setContent} height={500} />

          {/* 上传 */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1E293B]/40 border border-dashed border-[rgba(30,41,59,0.6)] rounded-xl text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#06B6D4]/30 cursor-pointer transition-all">
              <Upload className="w-4 h-4" />
              {uploading ? "上传中..." : "上传图片"}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
            {coverUrl && <span className="text-xs text-[#10B981]">封面已设置</span>}
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <TemplateSelector selected={templateType} onSelect={handleTemplateSelect} />
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">发布设置</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#64748B] mb-1 block">分类</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#64748B] mb-1 block">可见权限</label>
                <select
                  value={requiredTier}
                  onChange={(e) => setRequiredTier(e.target.value as MembershipTier)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none"
                >
                  {TIERS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#64748B] mb-1 block">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="国产3A, 评测"
                  className="w-full px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none placeholder-[#64748B]"
                />
              </div>
              <div>
                <label className="text-xs text-[#64748B] mb-1 block">封面图片URL</label>
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none placeholder-[#64748B]"
                />
              </div>
              <div>
                <label className="text-xs text-[#64748B] mb-1 block">摘要</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="留空则自动生成"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none placeholder-[#64748B] resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#64748B] mb-1 block">视频链接（B站/YouTube）</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none placeholder-[#64748B]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditArticlePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" />
      </div>
    }>
      <EditForm />
    </Suspense>
  );
}
