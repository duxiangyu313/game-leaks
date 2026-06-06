interface ScoresTabProps {
  game: any;
  reviews: any[];
}

export default function ScoresTab({ game, reviews }: ScoresTabProps) {
  const avgRating = reviews.length > 0
    ? (reviews.reduce((a: number, b: any) => a + (b.rating || 0), 0) / reviews.length).toFixed(1)
    : "-";

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-6 text-center">
          <h4 className="text-xs text-[#64748B] mb-3">🎮 媒体评分</h4>
          <div className="text-4xl font-black text-[#F1F5F9]">{game.rating || "-"}</div>
          <div className="text-xs text-[#64748B] mt-1">/ 10</div>
        </div>
        <div className="glass-card p-6 text-center">
          <h4 className="text-xs text-[#64748B] mb-3">👥 玩家评分</h4>
          <div className="text-4xl font-black text-[#F5A623]">{avgRating}</div>
          <div className="text-xs text-[#64748B] mt-1">{reviews.length} 条评测</div>
        </div>
        <div className="glass-card p-6 text-center">
          <h4 className="text-xs text-[#64748B] mb-3">✍️ 编辑评分</h4>
          <div className="text-4xl font-black text-[#06B6D4]">{game.rating || "-"}</div>
          <div className="text-xs text-[#64748B] mt-1">国游爆料编辑部</div>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="glass-card p-5">
          <h4 className="text-sm font-semibold text-[#F1F5F9] mb-4">评分分布</h4>
          <div className="space-y-2">
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(score => {
              const count = reviews.filter((r: any) => r.rating === score).length;
              const pct = (count / reviews.length) * 100;
              return (
                <div key={score} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-right text-[#64748B]">{score}分</span>
                  <div className="flex-1 h-3 bg-[#1E293B] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${score >= 8 ? "bg-[#10B981]" : score >= 5 ? "bg-[#F59E0B]" : "bg-[#EF4444]"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-[#64748B]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
