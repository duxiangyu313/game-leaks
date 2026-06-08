import dynamic from "next/dynamic";
import HeroWrapper from "@/components/HeroWrapper";
import FeaturedProgress from "@/components/FeaturedProgress";
import LastUpdated from "@/components/LastUpdated";
import LiveSignal from "@/components/LiveSignal";
import FreeTrialBanner from "@/components/FreeTrialBanner";
import EmailSubscribe from "@/components/EmailSubscribe";
import CyberParticles from "@/components/cyber/CyberParticles";

// Above-fold lazy — reduces initial JS bundle
const HotTopics = dynamic(() => import("@/components/HotTopics"));
const LatestLeaks = dynamic(() => import("@/components/LatestLeaks"));
const HotGames = dynamic(() => import("@/components/HotGames"));
const UpcomingGames = dynamic(() => import("@/components/UpcomingGames"));

// Below-fold — lazy loaded for faster LCP
const HotDiscussions = dynamic(() => import("@/components/HotDiscussions"));
const VideoSection = dynamic(() => import("@/components/VideoSection"));
const StatsDashboard = dynamic(() => import("@/components/StatsDashboard"));
const MemberPromo = dynamic(() => import("@/components/MemberPromo"));

export default function Home() {
  return (
    <div className="pt-16 relative cyber-scanline-bg">
      {/* 全息粒子背景 */}
      <div className="fixed inset-0 pointer-events-none z-0 hidden md:block">
        <CyberParticles count={50} />
      </div>

      <div className="relative z-10">
        <FreeTrialBanner />
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
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6 md:pt-12">
          <EmailSubscribe compact />
        </div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-12 md:pb-20"><MemberPromo /></div>
      </div>
    </div>
  );
}
