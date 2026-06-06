import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface RelatedGamesProps {
  games: any[];
}

export default function RelatedGames({ games }: RelatedGamesProps) {
  if (games.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="text-lg font-bold text-[#F1F5F9] mb-4 flex items-center gap-2">
        <ExternalLink className="w-5 h-5 text-[#06B6D4]" />相关游戏推荐
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {games.map(r => (
          <Link key={r.id} href={`/games/detail?id=${r.id}`} className="glass-card block p-4 group hover:border-[#06B6D4]/20 transition-all">
            <div className="w-full h-24 rounded-lg bg-gradient-to-br from-[#1E293B] to-[#0F172A] mb-2 flex items-center justify-center text-3xl">{r.title?.charAt(0)}</div>
            <h4 className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#06B6D4] truncate">{r.title}</h4>
            <p className="text-xs text-[#64748B]">{r.developer}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
