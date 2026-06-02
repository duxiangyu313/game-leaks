"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Eye, Edit3 } from "lucide-react";

// 动态导入 @uiw/react-md-editor，减少初始包体积
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] rounded-xl bg-[#1E293B]/40 animate-pulse flex items-center justify-center">
        <span className="text-[#64748B] text-sm">加载编辑器中...</span>
      </div>
    ),
  }
);

interface Props {
  value: string;
  onChange: (value: string) => void;
  height?: number;
}

/**
 * Markdown 编辑器 — 封装 @uiw/react-md-editor
 * 深色主题，分屏编辑/预览
 */
export default function MarkdownEditor({ value, onChange, height = 500 }: Props) {
  const [preview, setPreview] = useState<"edit" | "live" | "preview">("live");

  return (
    <div className="markdown-editor-wrapper">
      {/* 简易工具栏切换按钮 */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setPreview("edit")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
            preview === "edit"
              ? "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30"
              : "bg-[#1E293B]/40 text-[#64748B] border border-transparent hover:text-[#94A3B8]"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" /> 编辑
        </button>
        <button
          onClick={() => setPreview("live")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
            preview === "live"
              ? "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30"
              : "bg-[#1E293B]/40 text-[#64748B] border border-transparent hover:text-[#94A3B8]"
          }`}
        >
          <Eye className="w-3.5 h-3.5" /> 分屏
        </button>
        <button
          onClick={() => setPreview("preview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
            preview === "preview"
              ? "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30"
              : "bg-[#1E293B]/40 text-[#64748B] border border-transparent hover:text-[#94A3B8]"
          }`}
        >
          <Eye className="w-3.5 h-3.5" /> 预览
        </button>
      </div>

      {/* 编辑器主体 */}
      <div data-color-mode="dark">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || "")}
          height={height}
          visibleDragbar={false}
          preview={preview}
          hideToolbar={false}
          textareaProps={{
            placeholder: "开始输入 Markdown 内容...",
          }}
        />
      </div>
    </div>
  );
}
