import fs from "fs";
import path from "path";

// Turbopack 构建使用多 worker 线程（experimental.cpus），模块级 Map 无法跨 worker 共享。
// 因此 generateStaticParams 拉取全量元数据后写入此文件，generateMetadata 直接读文件，
// 避免每个页面再发网络请求（会被超时/限流打断，导致退回通用标题）。
export type SeoMetaType = "articles" | "leaks" | "games";

function fileFor(type: SeoMetaType): string {
  return path.join(process.cwd(), `.seo-meta-${type}.json`);
}

export function writeSeoMeta(type: SeoMetaType, map: Record<string, unknown>): void {
  try {
    fs.writeFileSync(fileFor(type), JSON.stringify(map));
  } catch {
    // 构建产物写入为尽力而为，失败不影响兜底逻辑
  }
}

export function readSeoMeta(type: SeoMetaType): Record<string, unknown> {
  try {
    return JSON.parse(fs.readFileSync(fileFor(type), "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}
