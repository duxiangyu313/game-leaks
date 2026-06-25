import dynamic from "next/dynamic";
import LastUpdated from "@/components/LastUpdated";
import LiveSignal from "@/components/LiveSignal";
import EmailSubscribe from "@/components/EmailSubscribe";

// Above-fold — dynamic for code splitting (framer-motion heavy)
const HeroWrapper = dynamic(() => import("@/components/HeroWrapper"), {
  loading: () => <div className="h-[420px] md:h-[520px] bg-[#0F172A] animate-pulse rounded-2xl" />,
});
const FreeTrialBanner = dynamic(() => import("@/components/FreeTrialBanner"));
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
    <div className="pt-16 relative cyber-scanline-bg">
      {/* 全息粒子背景 */}
      <div className="fixed inset-0 pointer-events-none z-0 hidden md:block">
        <CyberParticles count={50} />
      </div>

      <div className="relative z-10">
        <FreeTrialBanner />
        {/* 邮件订阅 — 首页顶部 */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-4 md:pt-6">
          <EmailSubscribe compact />
        </div>

        {/* 英雄区 */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-4 md:pt-6">
          <HeroWrapper />
          <LiveSignal />
        </div>

        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-4 md:pt-6"><HotTopics /></div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-16"><LatestLeaks /></div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-16"><HotGames /></div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-16"><UpcomingGames /></div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-16"><FeaturedProgress /></div>
        <div className="pt-8 md:pt-16"><HotDiscussions /></div>
        <div className="pt-8 md:pt-16"><VideoSection /></div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-16">
          <StatsDashboard />
          <div className="mt-4 flex justify-end"><LastUpdated /></div>
        </div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-12">
          <MemberStatsBar />
        </div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-12 md:pb-20"><MemberPromo /></div>
      </div>
    </div>
  );
}
