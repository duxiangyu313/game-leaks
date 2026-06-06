"use client";

import {
  BookOpen, Award, FileText, Cpu, ShoppingCart,
  Star, DollarSign, Download, Play, Zap, Image, MessageSquare,
} from "lucide-react";
import IntroTab from "./tabs/IntroTab";
import ReviewsTab from "./tabs/ReviewsTab";
import WikiTab from "./tabs/WikiTab";
import RequirementsTab from "./tabs/RequirementsTab";
import PreordersTab from "./tabs/PreordersTab";
import ScoresTab from "./tabs/ScoresTab";
import PricesTab from "./tabs/PricesTab";
import DlcTab from "./tabs/DlcTab";
import VideosTab from "./tabs/VideosTab";
import LeaksTab from "./tabs/LeaksTab";
import GalleryTab from "./tabs/GalleryTab";
import CommentsTab from "./tabs/CommentsTab";

type Tab = "intro" | "requirements" | "reviews" | "preorders" | "scores" | "prices" | "dlc" | "videos" | "wiki" | "leaks" | "gallery" | "comments";

interface GameTabsProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  game: any;
  gameId: string;
  leaks: any[];
  comments: any[];
  reviews: any[];
  userReview: any | null;
  requirements: any;
  preorders: any[];
  prices: any[];
  dlc: any[];
  wiki: any;
  videos: any[];
  screenshots: { src: string; alt: string }[];
  onImageClick: (src: string) => void;
  onReviewSuccess: (review: any) => void;
  onComment: (text: string, rating: number) => Promise<any>;
}

const TAB_DEFS: { key: Tab; icon: React.ComponentType<any>; label: (ctx: { reviews: any[]; leaks: any[]; comments: any[] }) => string }[] = [
  { key: "intro", icon: BookOpen, label: () => "游戏介绍" },
  { key: "reviews", icon: Award, label: ctx => `玩家评测 (${ctx.reviews.length})` },
  { key: "wiki", icon: FileText, label: () => "游戏百科" },
  { key: "requirements", icon: Cpu, label: () => "配置要求" },
  { key: "preorders", icon: ShoppingCart, label: () => "预购信息" },
  { key: "scores", icon: Star, label: () => "评分专区" },
  { key: "prices", icon: DollarSign, label: () => "价格走势" },
  { key: "dlc", icon: Download, label: () => "DLC/更新" },
  { key: "videos", icon: Play, label: () => "相关视频" },
  { key: "leaks", icon: Zap, label: ctx => `爆料 (${ctx.leaks.length})` },
  { key: "gallery", icon: Image, label: () => "截图" },
  { key: "comments", icon: MessageSquare, label: ctx => `评论 (${ctx.comments.length})` },
];

export default function GameTabs({ tab, onTabChange, game, gameId, leaks, comments, reviews, userReview, requirements, preorders, prices, dlc, wiki, videos, screenshots, onImageClick, onReviewSuccess, onComment }: GameTabsProps) {
  const ctx = { reviews, leaks, comments };

  return (
    <div className="glass-card mb-6 overflow-x-auto">
      {/* Tab bar */}
      <div className="flex border-b border-[rgba(30,41,59,0.4)] min-w-max">
        {TAB_DEFS.map(t => (
          <button key={t.key} onClick={() => onTabChange(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs md:text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${tab === t.key ? "border-[#06B6D4] text-[#06B6D4]" : "border-transparent text-[#64748B] hover:text-[#F1F5F9]"}`}>
            <t.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />{t.label(ctx)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 md:p-6">
        {tab === "intro" && <IntroTab game={game} />}
        {tab === "reviews" && <ReviewsTab gameId={gameId} reviews={reviews} userReview={userReview} gameStatus={game.status} onReviewSuccess={onReviewSuccess} />}
        {tab === "wiki" && <WikiTab gameId={gameId} wiki={wiki} />}
        {tab === "requirements" && <RequirementsTab requirements={requirements} />}
        {tab === "preorders" && <PreordersTab preorders={preorders} />}
        {tab === "scores" && <ScoresTab game={game} reviews={reviews} />}
        {tab === "prices" && <PricesTab prices={prices} />}
        {tab === "dlc" && <DlcTab dlc={dlc} />}
        {tab === "videos" && <VideosTab videos={videos} />}
        {tab === "leaks" && <LeaksTab leaks={leaks} />}
        {tab === "gallery" && <GalleryTab screenshots={screenshots} onImageClick={onImageClick} />}
        {tab === "comments" && <CommentsTab comments={comments} onComment={onComment} />}
      </div>
    </div>
  );
}
