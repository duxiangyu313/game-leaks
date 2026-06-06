"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";

interface Props {
  src: string;
  alt: string;
  onClick?: () => void;
  className?: string;
}

/** 图片组件：CSS半透明水印 + 点击放大 */
export default function ImageWithWatermark({ src, alt, onClick, className = "" }: Props) {
  const watermark = useMemo(() => {
    // 生成水印文本：用户标识 + 日期
    const uid = "guoyouwenduji";
    const date = new Date().toLocaleDateString("zh-CN");
    return `${uid} | ${date}`;
  }, []);

  if (!src) return null;

  return (
    <span className="relative inline-block group max-w-full">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onClick={onClick}
        className={`rounded-xl max-w-full h-auto cursor-zoom-in ${className}`}
      />
      {/* CSS 水印叠加层 */}
      <span
        className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden opacity-[0.05] select-none"
        aria-hidden="true"
        style={{
          backgroundImage: `repeating-linear-gradient(-25deg, transparent, transparent 60px, currentColor 60px, currentColor 61px)`,
        }}
      >
        <span className="block w-full h-full" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          alignContent: "center",
          justifyItems: "center",
          transform: "rotate(-25deg) scale(1.2)",
        }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="text-white text-[11px] whitespace-nowrap px-2">{watermark}</span>
          ))}
        </span>
      </span>
      {/* 放大提示 */}
      <span className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm rounded-lg p-1.5 text-white/80">
        <Download className="w-4 h-4 rotate-90" />
      </span>
    </span>
  );
}
