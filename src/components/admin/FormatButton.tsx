"use client";

import { useState } from "react";
import { Wand2, Loader2, Check } from "lucide-react";
import { formatOneClick } from "@/lib/markdown";
import type { TemplateType } from "@/types";

interface Props {
  content: string;
  templateType: TemplateType;
  onFormatted: (formatted: string) => void;
}

/** "一键排版" 按钮 */
export default function FormatButton({ content, templateType, onFormatted }: Props) {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleFormat = async () => {
    if (!content.trim()) return;
    setProcessing(true);
    setDone(false);

    // 模拟异步（实际是同步操作，但保持UI反馈）
    await new Promise((r) => setTimeout(r, 400));
    const formatted = formatOneClick(content, templateType);
    onFormatted(formatted);

    setProcessing(false);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <button
      onClick={handleFormat}
      disabled={processing}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
        done
          ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
          : "bg-gradient-to-r from-[#06B6D4]/15 to-[#0891B2]/10 text-[#06B6D4] border border-[#06B6D4]/20 hover:border-[#06B6D4]/40 hover:shadow-[0_0_16px_rgba(6,182,212,0.1)]"
      }`}
    >
      {processing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : done ? (
        <Check className="w-4 h-4" />
      ) : (
        <Wand2 className="w-4 h-4" />
      )}
      {done ? "已格式化" : "一键排版"}
    </button>
  );
}
