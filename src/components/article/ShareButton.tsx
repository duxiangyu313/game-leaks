"use client";

import { useState, useCallback } from "react";
import { Share2, Check } from "lucide-react";

interface Props {
  articleId: string;
  title: string;
}

/** 分享按钮 — 复制链接 + Web Share API */
export default function ShareButton({ articleId, title }: Props) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(async () => {
    const url = `${window.location.origin}/articles/${articleId}`;

    // 优先使用 Web Share API
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // 用户取消分享，走复制逻辑
      }
    }

    // 回退：复制到剪贴板
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 最后的回退
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [articleId, title]);

  return (
    <button
      onClick={handleClick}
      className="interaction-btn"
      title="分享"
    >
      {copied ? (
        <Check className="w-5 h-5 text-[#10B981]" />
      ) : (
        <Share2 className="w-5 h-5" />
      )}
      <span className="text-xs">{copied ? "已复制" : "分享"}</span>
    </button>
  );
}
