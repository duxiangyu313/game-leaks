"use client";

import { motion } from "framer-motion";
import HeroCarousel from "@/components/HeroCarousel";
import HotTopics from "@/components/HotTopics";
import LatestLeaks from "@/components/LatestLeaks";
import HotGames from "@/components/HotGames";
import UpcomingGames from "@/components/UpcomingGames";
import VideoSection from "@/components/VideoSection";
import StatsDashboard from "@/components/StatsDashboard";
import MemberPromo from "@/components/MemberPromo";

export default function Home() {
  return (
    <div className="pt-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <HeroCarousel />
        </motion.div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-14"><HotTopics /></div>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-16"><LatestLeaks /></div>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-16"><HotGames /></div>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-16"><UpcomingGames /></div>
      <div className="pt-16"><VideoSection /></div>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-16"><StatsDashboard /></div>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-16 pb-20"><MemberPromo /></div>
    </div>
  );
}
