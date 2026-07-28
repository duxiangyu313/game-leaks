import HeroCarousel from "@/components/HeroCarousel";

// 纯展示组件 — 移除了 framer-motion，改用 CSS animation
export default function HeroWrapper() {
  return (
    <div className="animate-fade-up">
      {/* SEO: 首页需要有 h1 标签告诉搜索引擎页面主题 */}
      <h1 className="sr-only">国游爆料 · 国产3A游戏资讯平台 — 追踪黑神话悟空、影之刃零、归唐等国产3A大作最新动态</h1>
      <HeroCarousel />
    </div>
  );
}
