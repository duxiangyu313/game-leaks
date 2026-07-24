"use client";

import { motion } from "framer-motion";

interface PromoScene2Props {
  active: boolean;
}

interface GameCard {
  title: string;
  subtitle: string;
  gradient: string;
  glow: string;
}

const GAMES: GameCard[] = [
  {
    title: "黑神话:悟空",
    subtitle: "BLACK MYTH: WUKONG",
    gradient: "from-amber-500/30 via-orange-600/10 to-transparent",
    glow: "rgba(245, 166, 35, 0.4)",
  },
  {
    title: "影之刃零",
    subtitle: "BLADE OF NIGHT",
    gradient: "from-purple-500/30 via-fuchsia-600/10 to-transparent",
    glow: "rgba(192, 132, 252, 0.4)",
  },
  {
    title: "归唐",
    subtitle: "RETURN TO TANG",
    gradient: "from-rose-500/30 via-red-600/10 to-transparent",
    glow: "rgba(233, 69, 96, 0.4)",
  },
  {
    title: "遗忘之海",
    subtitle: "THE FORGOTTEN SEA",
    gradient: "from-cyan-500/30 via-sky-600/10 to-transparent",
    glow: "rgba(34, 211, 238, 0.4)",
  },
];

const STATS = [
  { value: 41, label: "GAMES", color: "text-cyan-300" },
  { value: 20, suffix: "+", label: "DEVELOPERS", color: "text-amber-300" },
  { value: 10, label: "CATEGORIES", color: "text-rose-300" },
];

/** 场景二：游戏库 — 4张游戏卡片 + 3个统计数字 */
export default function PromoScene2({ active }: PromoScene2Props) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* 标题 */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        className="mb-3 text-center text-2xl font-bold text-white sm:text-3xl"
      >
        追踪 <span className="text-cyan-300">37+</span> 款国产游戏
      </motion.h2>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={active ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-10 h-px w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
      />

      {/* 游戏卡片 */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.title}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={
              active
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 30, scale: 0.9 }
            }
            transition={{
              duration: 0.5,
              delay: 0.6 + i * 0.12,
              ease: "easeOut",
            }}
            whileHover={{ y: -6 }}
            className="relative h-44 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b p-4 backdrop-blur-sm"
            style={{
              backgroundImage: `linear-gradient(160deg, ${game.gradient.replace("from-", "").replace("via-", "").replace("to-transparent", "")})`,
              boxShadow: `0 0 20px ${game.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${game.gradient}`} />
            <div className="relative flex h-full flex-col justify-end">
              <p className="text-[10px] font-medium tracking-widest text-white/50">
                {game.subtitle}
              </p>
              <p className="mt-1 text-base font-bold text-white">{game.title}</p>
              <div className="mt-3 h-0.5 w-8 bg-white/30" />
            </div>
            {/* 边框发光 */}
            <div
              className="absolute inset-0 rounded-xl"
              style={{ boxShadow: `inset 0 0 30px ${game.glow}` }}
            />
          </motion.div>
        ))}
      </div>

      {/* 统计数字 */}
      <div className="mt-10 flex items-center gap-8 sm:gap-14">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={
              active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.6, delay: 1.2 + i * 0.2 }}
            className="text-center"
          >
            <div className={`text-3xl font-black sm:text-4xl ${stat.color}`}>
              {stat.value}
              {stat.suffix}
            </div>
            <div className="mt-1 text-[10px] font-medium tracking-[0.2em] text-white/40">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
