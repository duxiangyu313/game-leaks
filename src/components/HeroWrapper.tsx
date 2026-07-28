import HeroCarousel from "@/components/HeroCarousel";

// 纯展示组件 — 移除了 framer-motion，改用 CSS animation
export default function HeroWrapper() {
  return (
    <div className="animate-fade-up">
      <HeroCarousel />
    </div>
  );
}
