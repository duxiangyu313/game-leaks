"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

/** 图片灯箱 — 支持轮播和键盘导航 */
export default function Lightbox({ images, initialIndex, isOpen, onClose }: Props) {
  const [current, setCurrent] = useState(initialIndex);

  // 键盘控制
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape": onClose(); break;
        case "ArrowLeft": setCurrent((c) => (c > 0 ? c - 1 : images.length - 1)); break;
        case "ArrowRight": setCurrent((c) => (c < images.length - 1 ? c + 1 : 0)); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="lightbox-backdrop"
        onClick={onClose}
      >
        {/* 关闭按钮 */}
        <button className="lightbox-close" onClick={onClose} aria-label="关闭">
          <X className="w-5 h-5" />
        </button>

        {/* 当前图片 */}
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="lightbox-image-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          <img src={images[current]} alt={`图片 ${current + 1}`} />
        </motion.div>

        {/* 左箭头 */}
        {images.length > 1 && (
          <button
            className="lightbox-nav lightbox-nav--prev"
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c > 0 ? c - 1 : images.length - 1)); }}
            aria-label="上一张"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* 右箭头 */}
        {images.length > 1 && (
          <button
            className="lightbox-nav lightbox-nav--next"
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c < images.length - 1 ? c + 1 : 0)); }}
            aria-label="下一张"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* 计数器 */}
        {images.length > 1 && (
          <div className="lightbox-counter">
            {current + 1} / {images.length}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
