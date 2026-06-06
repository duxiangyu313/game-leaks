"use client";

import { TrendingUp, ThumbsDown, Minus, Clock } from "lucide-react";

interface GameProgressCardProps {
  status: string;
  hypeVotes: number;
  midVotes: number;
  disappointVotes: number;
  userVote: string | null;
  onVote: (type: string) => void;
}

const stagePercent: Record<string, number> = {
  announced: 25, "in-dev": 55, beta: 80, released: 100, delayed: 40,
};

export default function GameProgressCard({
  status, hypeVotes, midVotes, disappointVotes, userVote, onVote,
}: GameProgressCardProps) {
  const stage = stagePercent[status] || 30;
  const totalVotes = hypeVotes + midVotes + disappointVotes;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Progress */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#06B6D4]" /> 开发进度
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-4 bg-[#1E293B] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] rounded-full transition-all" style={{ width: `${stage}%` }} />
          </div>
          <span className="text-2xl font-black text-[#F1F5F9]">{stage}%</span>
        </div>
        <div className="flex justify-between text-xs text-[#64748B]">
          <span className={stage >= 25 ? "text-[#06B6D4]" : ""}>概念</span>
          <span className={stage >= 40 ? "text-[#06B6D4]" : ""}>原型</span>
          <span className={stage >= 55 ? "text-[#06B6D4]" : ""}>Alpha</span>
          <span className={stage >= 80 ? "text-[#06B6D4]" : ""}>Beta</span>
          <span className={stage >= 100 ? "text-[#10B981]" : ""}>发售</span>
        </div>
      </div>

      {/* Vote */}
      <div className="glass-card p-6 text-center">
        <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">你的态度</h3>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => onVote("hype")} disabled={!!userVote}
            className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${
              userVote === "hype" ? "bg-[#10B981]/20 border-2 border-[#10B981]" :
              userVote ? "opacity-40 bg-[#1E293B]/40" :
              "bg-[#1E293B]/40 hover:bg-[#10B981]/10 border-2 border-transparent hover:border-[#10B981]/30"
            }`}>
            <TrendingUp className={`w-6 h-6 ${userVote === "hype" ? "text-[#10B981]" : "text-[#64748B]"}`} />
            <span className="text-xl font-black text-[#F1F5F9]">{hypeVotes}</span>
            <span className="text-[10px] text-[#64748B]">期待</span>
          </button>
          <button onClick={() => onVote("neutral")} disabled={!!userVote}
            className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${
              userVote === "neutral" ? "bg-[#F59E0B]/20 border-2 border-[#F59E0B]" :
              userVote ? "opacity-40 bg-[#1E293B]/40" :
              "bg-[#1E293B]/40 hover:bg-[#F59E0B]/10 border-2 border-transparent hover:border-[#F59E0B]/30"
            }`}>
            <Minus className={`w-6 h-6 ${userVote === "neutral" ? "text-[#F59E0B]" : "text-[#64748B]"}`} />
            <span className="text-xl font-black text-[#F1F5F9]">{midVotes}</span>
            <span className="text-[10px] text-[#64748B]">一般</span>
          </button>
          <button onClick={() => onVote("disappoint")} disabled={!!userVote}
            className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${
              userVote === "disappoint" ? "bg-[#EF4444]/20 border-2 border-[#EF4444]" :
              userVote ? "opacity-40 bg-[#1E293B]/40" :
              "bg-[#1E293B]/40 hover:bg-[#EF4444]/10 border-2 border-transparent hover:border-[#EF4444]/30"
            }`}>
            <ThumbsDown className={`w-6 h-6 ${userVote === "disappoint" ? "text-[#EF4444]" : "text-[#64748B]"}`} />
            <span className="text-xl font-black text-[#F1F5F9]">{disappointVotes}</span>
            <span className="text-[10px] text-[#64748B]">不期待</span>
          </button>
        </div>
        {totalVotes > 0 && (
          <div className="mt-4 flex items-center justify-center gap-3 text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#10B981]" /><span className="text-[#64748B]">{Math.round(hypeVotes / totalVotes * 100)}%</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#F59E0B]" /><span className="text-[#64748B]">{Math.round(midVotes / totalVotes * 100)}%</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#EF4444]" /><span className="text-[#64748B]">{Math.round(disappointVotes / totalVotes * 100)}%</span></div>
            <span className="text-[#64748B] ml-2">共 {totalVotes} 票</span>
          </div>
        )}
      </div>
    </div>
  );
}
