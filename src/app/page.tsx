import dynamic from "next/dynamic";
import LastUpdated from "@/components/LastUpdated";
import LiveSignal from "@/components/LiveSignal";
import EmailSubscribe from "@/components/EmailSubscribe";

// ClickSpark 点击火花 — 全局点击反馈
const ClickSparkWrapper = dynamic(() => import("@/components/ui/react-bits/ClickSparkWrapper"));

// PromoHero 宣传片 — 首次访问全屏动画（需客户端 wrapper）
const PromoHeroWrapper = dynamic(() => import("@/components/promo/PromoHeroWrapper"));

// Above-fold — dynamic for code splitting (framer-motion heavy)
const HeroWrapper = dynamic(() => import("@/components/HeroWrapper"), {
  loading: () => <div className="h-[420px] md:h-[520px] bg-[#0F172A] animate-pulse rounded-2xl" />,
});
const FreeTrialBanner = dynamic(() => import("@/components/FreeTrialBanner"));
const CjBanner = dynamic(() => import("@/components/CjBanner"));
const CyberParticles = dynamic(() => import("@/components/cyber/CyberParticles"));

// Above-fold lazy — reduces initial JS bundle
const HotTopics = dynamic(() => import("@/components/HotTopics"));
const LatestLeaks = dynamic(() => import("@/components/LatestLeaks"));
const HotGames = dynamic(() => import("@/components/HotGames"));
const UpcomingGames = dynamic(() => import("@/components/UpcomingGames"));
const FeaturedProgress = dynamic(() => import("@/components/FeaturedProgress"));

// Below-fold — lazy loaded for faster LCP
const HotDiscussions = dynamic(() => import("@/components/HotDiscussions"));
const VideoSection = dynamic(() => import("@/components/VideoSection"));
const StatsDashboard = dynamic(() => import("@/components/StatsDashboard"));
const MemberPromo = dynamic(() => import("@/components/MemberPromo"));
const MemberStatsBar = dynamic(() => import("@/components/MemberStatsBar"));

export default function Home() {
  return (
    <div className="pt-16 relative cyber-scanline-bg" suppressHydrationWarning>
      {/* SEO: 可见的 h1，Bing 会忽略 sr-only 隐藏标题 */}
      <h1 className="text-center text-xs md:text-sm text-[#94A3B8] font-normal tracking-wide mb-2 md:mb-3">
        国产3A游戏资讯平台 — 追踪黑神话悟空、影之刃零、归唐等大作最新动态
      </h1>
      {/* 宣传片 — 首次访问全屏动画 */}
      <PromoHeroWrapper />

      {/* 全息粒子背景 — 移动端禁用 */}
      <div className="fixed inset-0 pointer-events-none z-0 hidden md:block">
        <CyberParticles count={30} />
      </div>


      <div className="relative z-10">
        <FreeTrialBanner />
        <CjBanner />
        {/* 邮件订阅 — 首页顶部 */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-4 md:pt-6">
          <EmailSubscribe compact />
        </div>

        {/* 英雄区 — 首屏关键内容 */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-4 md:pt-6 relative">
          <HeroWrapper />
          <LiveSignal />
          {/* 点击火花效果 */}
          <div className="hidden md:block"><ClickSparkWrapper /></div>
        </div>

        {/* 首屏以上 */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-4 md:pt-6"><HotTopics /></div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-16"><LatestLeaks /></div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-16"><HotGames /></div>

        {/* 首屏以下 — lazy-section 触发 content-visibility: auto */}
        <div className="lazy-section max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-16"><UpcomingGames /></div>
        <div className="lazy-section max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-16"><FeaturedProgress /></div>
        <div className="lazy-section pt-8 md:pt-16"><HotDiscussions /></div>
        <div className="lazy-section pt-8 md:pt-16"><VideoSection /></div>
        <div className="lazy-section max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-16">
          <StatsDashboard />
          <div className="mt-4 flex justify-end"><LastUpdated /></div>
        </div>
        <div className="lazy-section max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-12">
          <MemberStatsBar />
        </div>
        <div className="lazy-section max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-12 md:pb-20"><MemberPromo /></div>
      </div>
    </div>
  );
}
