"use client";

import { motion } from "framer-motion";
import HeroCarousel from "@/components/HeroCarousel";
import LatestLeaks from "@/components/LatestLeaks";
import HotGames from "@/components/HotGames";
import UpcomingGames from "@/components/UpcomingGames";
import MemberPromo from "@/components/MemberPromo";

export default function Home() {
  return (
    <div className="pt-16">
      {/* Hero Carousel */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <HeroCarousel />
        </motion.div>
      </div>

      {/* Latest Leaks */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-20">
        <LatestLeaks />
      </div>

      {/* Hot Games */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-16">
        <HotGames />
      </div>

      {/* Upcoming Games */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-16">
        <UpcomingGames />
      </div>

      {/* Member Promo */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-16 pb-20">
        <MemberPromo />
      </div>
    </div>
  );
}
