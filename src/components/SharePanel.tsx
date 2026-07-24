"use client";

import { useState, useRef, useEffect } from "react";
import { Link2, Download, FileText, X, Check } from "lucide-react";
import type { GameProgress } from "@/types";

interface SharePanelProps {
  game: GameProgress;
  onClose: () => void;
}

export default function SharePanel({ game, onClose }: SharePanelProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [generating, setGenerating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const shareUrl = `https://news.guoyouwenduji.cc/games/progress/detail?id=${game.id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const copyText = async () => {
    const text = `【${game.name}】开发进度：${game.development_stage} | 可信度 ${game.credibility_score}/10 | 关注国游温度计获取最新动态 ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // ignore
    }
  };

  const generateImage = async () => {
    setGenerating(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 背景：深色渐变
      const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
      gradient.addColorStop(0, "#1A1A2E");
      gradient.addColorStop(1, "#0F172A");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 630);

      // 封面图（如有）
      if (game.cover_url) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = game.cover_url!;
          });
          // 左侧 480px 放封面
          ctx.drawImage(img, 0, 0, 480, 630);
          // 渐变遮罩
          const mask = ctx.createLinearGradient(480, 0, 720, 0);
          mask.addColorStop(0, "rgba(15, 23, 42, 0)");
          mask.addColorStop(1, "rgba(15, 23, 42, 1)");
          ctx.fillStyle = mask;
          ctx.fillRect(480, 0, 240, 630);
        } catch {
          // 封面加载失败，跳过
        }
      }

      // 右侧文字区
      const textX = 540;

      // 游戏名
      ctx.fillStyle = "#F1F5F9";
      ctx.font = "bold 48px sans-serif";
      ctx.fillText(game.name.substring(0, 20), textX, 180);

      // 开发阶段
      ctx.fillStyle = "#06B6D4";
      ctx.font = "24px sans-serif";
      ctx.fillText(`开发阶段：${game.development_stage}`, textX, 240);

      // 可信度
      ctx.fillStyle = "#F59E0B";
      ctx.fillText(`可信度：${game.credibility_score}/10`, textX, 290);

      // 开发商
      if (game.developer) {
        ctx.fillStyle = "#94A3B8";
        ctx.font = "20px sans-serif";
        ctx.fillText(`开发商：${game.developer}`, textX, 340);
      }

      // 预计发售
      if (game.estimated_release_date) {
        ctx.fillStyle = "#94A3B8";
        ctx.fillText(`预计发售：${game.estimated_release_date}`, textX, 380);
      }

      // 网站水印
      ctx.fillStyle = "#E94560";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("国游温度计", textX, 540);
      ctx.fillStyle = "#64748B";
      ctx.font = "16px sans-serif";
      ctx.fillText("news.guoyouwenduji.cc", textX, 575);

      // 下载
      const link = document.createElement("a");
      link.download = `${game.name}-进度分享.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" style={{ zIndex: 9999 }}>
      <div
        ref={panelRef}
        className="glass-card p-6 max-w-md w-full mx-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-[#1E293B] transition-colors"
        >
          <X className="w-5 h-5 text-[#64748B]" />
        </button>

        <h3 className="text-lg font-bold text-[#F1F5F9] mb-1">分享游戏进度</h3>
        <p className="text-xs text-[#64748B] mb-5">{game.name}</p>

        <div className="space-y-3">
          {/* 复制链接 */}
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0F172A]/60 border border-[#1E293B] hover:border-[#06B6D4]/50 transition-colors text-left"
          >
            <Link2 className="w-5 h-5 text-[#06B6D4] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#F1F5F9]">复制链接</p>
              <p className="text-[10px] text-[#475569] truncate">{shareUrl}</p>
            </div>
            {copiedLink && <Check className="w-4 h-4 text-[#10B981] shrink-0" />}
          </button>

          {/* 生成分享图 */}
          <button
            onClick={generateImage}
            disabled={generating}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0F172A]/60 border border-[#1E293B] hover:border-[#06B6D4]/50 transition-colors text-left disabled:opacity-50"
          >
            <Download className="w-5 h-5 text-[#F5A623] shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-[#F1F5F9]">下载分享图</p>
              <p className="text-[10px] text-[#475569]">1200×630 PNG，适合社交平台</p>
            </div>
            {generating && (
              <div className="w-4 h-4 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin shrink-0" />
            )}
          </button>

          {/* 复制文案 */}
          <button
            onClick={copyText}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0F172A]/60 border border-[#1E293B] hover:border-[#06B6D4]/50 transition-colors text-left"
          >
            <FileText className="w-5 h-5 text-[#10B981] shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-[#F1F5F9]">复制分享文案</p>
              <p className="text-[10px] text-[#475569]">含游戏信息和链接，粘贴即用</p>
            </div>
            {copiedText && <Check className="w-4 h-4 text-[#10B981] shrink-0" />}
          </button>
        </div>
      </div>
    </div>
  );
}
