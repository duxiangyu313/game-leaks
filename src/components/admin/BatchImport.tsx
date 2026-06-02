"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface ImportItem {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

interface Props {
  onImport?: (articles: ImportItem[]) => void;
}

/** 批量 Markdown 导入 */
export default function BatchImport({ onImport }: Props) {
  const [files, setFiles] = useState<ImportItem[]>([]);
  const [category, setCategory] = useState("analysis");
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const items: ImportItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const text = await file.text();
      // 第一行 # 标题 = 文章标题
      const lines = text.trim().split("\n");
      let title = file.name.replace(/\.md$/i, "");
      let content = text;

      const firstHeading = lines.find((l) => l.startsWith("# "));
      if (firstHeading) {
        title = firstHeading.replace(/^#\s+/, "").trim();
        content = text.replace(firstHeading + "\n", "").trim();
      }

      items.push({
        title,
        content,
        category: "analysis",
        tags: [],
      });
    }
    setFiles((prev) => [...prev, ...items]);
    // 重置 input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (files.length === 0) return;
    setImporting(true);
    setImported(0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("请先登录");
      setImporting(false);
      return;
    }

    for (const item of files) {
      await supabase.from("articles").insert({
        title: item.title,
        content: item.content,
        category,
        tags: item.tags,
        status: "draft",
        author_id: user.id,
      });
      setImported((n) => n + 1);
    }

    setImporting(false);
    onImport?.(files);

    // 延迟清空
    setTimeout(() => {
      setFiles([]);
      setImported(0);
    }, 1500);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
          批量导入
        </h4>
      </div>

      {/* 文件选择 */}
      <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-[rgba(30,41,59,0.4)] rounded-xl cursor-pointer hover:border-[#06B6D4]/30 hover:bg-[#06B6D4]/5 transition-all group">
        <Upload className="w-5 h-5 text-[#64748B] group-hover:text-[#06B6D4] transition-colors" />
        <span className="text-sm text-[#64748B] group-hover:text-[#94A3B8]">
          拖拽 .md 文件到此处或点击选择
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
      </label>

      {/* 已选文件列表 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-[#64748B]">
              已选择 {files.length} 个文件
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs px-2 py-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] outline-none"
            >
              <option value="analysis">深度分析</option>
              <option value="review">评测</option>
              <option value="preview">前瞻</option>
              <option value="leak">爆料</option>
              <option value="news">新闻</option>
              <option value="interview">访谈</option>
              <option value="opinion">观点</option>
            </select>
          </div>

          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded-lg bg-[#1E293B]/20 border border-[rgba(30,41,59,0.3)]"
            >
              <FileText className="w-4 h-4 text-[#64748B] shrink-0" />
              <span className="text-xs text-[#94A3B8] truncate flex-1">{f.title}</span>
              <button
                onClick={() => handleRemove(i)}
                className="p-0.5 text-[#64748B] hover:text-[#EF4444] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full py-2.5 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white text-sm font-semibold rounded-xl hover:shadow-[0_0_16px_rgba(6,182,212,0.15)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                导入中 ({imported}/{files.length})
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                导入 {files.length} 篇文章
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
