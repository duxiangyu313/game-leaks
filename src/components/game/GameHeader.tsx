import { Star } from "lucide-react";

const statusLabel: Record<string, string> = {
  announced: "已公布", "in-dev": "开发中", beta: "测试中", released: "已发售", delayed: "延期",
};

interface GameHeaderProps {
  game: any;
}

export default function GameHeader({ game }: GameHeaderProps) {
  return (
    <div className="glass-card p-6 md:p-10 mb-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center text-6xl border border-[rgba(30,41,59,0.5)] shrink-0">
          {game.title?.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black text-[#F1F5F9]">{game.title}</h1>
            <span className={`px-3 py-1 text-xs rounded-full ${
              game.status === "released" ? "bg-[#10B981]/20 text-[#10B981]" :
              game.status === "announced" ? "bg-[#06B6D4]/20 text-[#06B6D4]" :
              "bg-[#F59E0B]/20 text-[#F59E0B]"
            }`}>{statusLabel[game.status] || game.status}</span>
          </div>
          {game.english_title && <p className="text-[#64748B] text-sm mb-3">{game.english_title}</p>}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#94A3B8] mb-3">
            <span>开发商: <strong className="text-[#F1F5F9]">{game.developer}</strong></span>
            <span>发行商: <strong className="text-[#F1F5F9]">{game.publisher}</strong></span>
            {game.release_date && <span>发售日: <strong className="text-[#F59E0B]">{game.release_date}</strong></span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {game.genre?.map((g: string) => (
              <span key={g} className="px-3 py-1 text-xs rounded-full bg-[#1E293B] text-[#94A3B8]">{g}</span>
            ))}
            {game.platforms?.map((p: string) => (
              <span key={p} className="px-3 py-1 text-xs rounded-full bg-[#06B6D4]/10 text-[#06B6D4]">{p}</span>
            ))}
          </div>
          {game.rating && (
            <div className="flex items-center gap-1 mt-3 text-[#F59E0B]">
              <Star className="w-4 h-4 fill-[#F59E0B]" />
              <span className="font-bold">{game.rating}</span>
              <span className="text-xs text-[#64748B] ml-1">/ 10</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
