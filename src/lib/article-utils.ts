/**
 * 文章工具函数
 * 阅读时间计算、字数统计、目录生成、摘要提取
 */

import type { TocEntry } from "@/types";

/** 中英文混合阅读时间估算（中文 ~400字/分钟，英文 ~200词/分钟） */
export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  const stripped = stripMarkdown(content);
  const chineseChars = (stripped.match(/[一-鿿]/g) || []).length;
  const englishWords = (stripped.match(/[a-zA-Z]+/g) || []).length;
  const minutes = chineseChars / 400 + englishWords / 200;
  return Math.max(1, Math.ceil(minutes));
}

/** 统计字数（中文按字，英文按词） */
export function calculateWordCount(content: string): number {
  if (!content) return 0;
  const stripped = stripMarkdown(content);
  const chineseChars = (stripped.match(/[一-鿿]/g) || []).length;
  const englishWords = (stripped.match(/[a-zA-Z]+/g) || []).length;
  return chineseChars + englishWords;
}

/** 去掉 Markdown 标记，提取纯文本 */
export function stripMarkdown(content: string): string {
  return content
    .replace(/#{1,6}\s/g, "")
    .replace(/\*{1,3}(.+?)\*{1,3}/g, "$1")
    .replace(/_{1,3}(.+?)_{1,3}/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/>\s/g, "")
    .replace(/[-*+]\s/g, "")
    .replace(/\d+\.\s/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\|\s?[-:]+\s?\|/g, "")
    .replace(/:::/g, "")
    .replace(/\|\|/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/** 从 Markdown 内容生成目录 */
export function generateTOC(content: string): TocEntry[] {
  if (!content) return [];
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const entries: TocEntry[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = match[2].trim();
    const id = slugify(text);
    entries.push({ id, text, level });
  }

  return entries;
}

/** 生成 slug ID */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/** 从内容生成摘要 */
export function generateExcerpt(content: string, maxLength = 160): string {
  if (!content) return "";
  const stripped = stripMarkdown(content);
  const firstParagraph = stripped.split(/\n\s*\n/)[0] || stripped.split("\n")[0] || "";
  if (firstParagraph.length <= maxLength) return firstParagraph;
  return firstParagraph.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

/** 从内容提取所有图片 URL */
export function extractImages(content: string): string[] {
  if (!content) return [];
  const images: string[] = [];
  // Markdown 图片: ![alt](url)
  const mdRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = mdRegex.exec(content)) !== null) {
    images.push(match[1]);
  }
  // HTML 图片: <img src="url">
  const htmlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlRegex.exec(content)) !== null) {
    images.push(match[1]);
  }
  return images;
}

/** 格式化日期 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/** 格式化相对时间（如 "3天前"、"2小时前"） */
export function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return formatDate(dateStr);
}
