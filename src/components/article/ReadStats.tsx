"use client";

import { Clock, FileText } from "lucide-react";

interface Props {
  wordCount?: number;
  readTime: number;
}

/** 文章阅读时长 + 字数展示 */
export default function ReadStats({ wordCount, readTime }: Props) {
  return (
    <span className="inline-flex items-center gap-3 text-xs text-[#64748B]">
      <span className="flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" />
        {readTime} 分钟阅读
      </span>
      {wordCount != null && wordCount > 0 && (
        <span className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          {wordCount.toLocaleString()} 字
        </span>
      )}
    </span>
  );
}
