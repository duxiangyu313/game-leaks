"use client";

import { useEffect, useState, useRef } from "react";
import { List } from "lucide-react";
import type { TocEntry } from "@/types";

interface Props {
  items: TocEntry[];
  isPaid?: boolean;
}

/** 文章目录 — 桌面 sticky 侧栏 / 移动端折叠 */
export default function TableOfContents({ items, isPaid }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const headingsRef = useRef<Map<string, IntersectionObserver>>(new Map());

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    // 观察每个标题元素
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const activeClass = isPaid ? "toc-link--gold" : "";

  return (
    <>
      {/* 桌面端：sticky 侧栏 */}
      <nav className="hidden lg:block toc-sidebar w-56 shrink-0">
        <div className="flex items-center gap-2 mb-3 px-3">
          <List className="w-4 h-4 text-[#64748B]" />
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">目录</span>
        </div>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`toc-link toc-link--l${item.level} ${activeClass} ${activeId === item.id ? "active" : ""}`}
          >
            {item.text}
          </a>
        ))}
      </nav>

      {/* 移动端：折叠面板 */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
        >
          <List className="w-4 h-4" />
          <span>目录 ({items.length} 节)</span>
          <span className={`text-[10px] transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
        </button>
        {isOpen && (
          <nav className="mt-3 space-y-1">
            {items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                  setIsOpen(false);
                }}
                className={`block py-1 text-sm text-[#64748B] hover:text-[#F1F5F9] ${item.level === 3 ? "pl-4" : ""}`}
              >
                {item.text}
              </a>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
