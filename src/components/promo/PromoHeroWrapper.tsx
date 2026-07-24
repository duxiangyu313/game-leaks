"use client";

import dynamic from "next/dynamic";

const PromoHero = dynamic(() => import("./PromoHero"), { ssr: false });

/** 客户端包装器 — 在 Server Component 中使用 ssr:false 的动态导入 */
export default function PromoHeroWrapper() {
  return <PromoHero />;
}
