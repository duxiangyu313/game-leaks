"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Timer } from "lucide-react";
import type { Game } from "@/types";

const UPCOMING: Game[] = [
  {
    id: "3", title: "影之刃零", englishTitle: "Phantom Blade Zero",
    cover: "", developer: "灵游坊", publisher: "灵游坊",
    genre: ["动作RPG", "武侠"], platforms: ["PC", "PS5"],
    releaseDate: "2026-09-09", status: "announced",
    description: "暗黑武侠功夫朋克，主角生命仅剩66天", hypeScore: 95,
    createdAt: "", updatedAt: "",
  },
  {
    id: "5", title: "黑神话：钟馗",
    cover: "", developer: "游戏科学", publisher: "游戏科学",
    genre: ["动作RPG", "神话"], platforms: ["PC", "PS5"],
    releaseDate: "2027", status: "in-dev",
    description: "游戏科学第二款3A，UE5捉鬼宇宙", hypeScore: 92,
    createdAt: "", updatedAt: "",
  },
  {
    id: "6", title: "望月",
    cover: "", developer: "月灵工作室", publisher: "独立",
    genre: ["开放世界", "魂系"], platforms: ["PC"],
    releaseDate: "2026年Q4", status: "in-dev",
    description: "老广都市风开放世界，月灵协战+五行克制", hypeScore: 78,
    createdAt: "", updatedAt: "",
  },
  {
    id: "7", title: "燕云十六声",
    cover: "", developer: "网易", publisher: "网易",
    genre: ["开放世界", "武侠"], platforms: ["PC", "移动端"],
    releaseDate: "2026", status: "in-dev",
    description: "网易开放世界武侠，五代十国历史背景", hypeScore: 72,
    createdAt: "", updatedAt: "",
  },
];

export default function UpcomingGames() {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-[#10B981]" />
          <h2 className="text-2xl font-bold text-[#F1F5F9]">即将发售</h2>
        </div>
        <Link href="/games?filter=upcoming" className="text-sm text-[#06B6D4] hover:text-[#22D3EE] transition-colors">
          全部 →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {UPCOMING.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={`/games/${game.id}`} className="glass-card block p-5 group h-full relative overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#10B981]/30 to-transparent group-hover:via-[#10B981]/60 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#10B981] font-medium flex items-center gap-1">
                  <Timer className="w-3 h-3" /> {game.releaseDate || "待定"}
                </span>
              </div>
              <h3 className="font-semibold text-[#F1F5F9] group-hover:text-[#06B6D4] transition-colors">
                {game.title}
              </h3>
              <p className="text-xs text-[#64748B] mt-1">{game.developer}</p>
              <p className="text-sm text-[#94A3B8] mt-3 line-clamp-2">{game.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {game.genre.slice(0, 2).map((g) => (
                  <span key={g} className="text-[10px] text-[#06B6D4] bg-[#06B6D4]/8 px-2 py-0.5 rounded-full">
                    {g}
                  </span>
                ))}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
