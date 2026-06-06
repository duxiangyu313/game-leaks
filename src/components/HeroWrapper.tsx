"use client";

import { motion } from "framer-motion";
import HeroCarousel from "@/components/HeroCarousel";

export default function HeroWrapper() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="cyber-hologram"
    >
      <HeroCarousel />
    </motion.div>
  );
}
