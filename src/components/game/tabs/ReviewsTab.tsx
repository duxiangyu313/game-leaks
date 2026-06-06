import { Award, Edit3 } from "lucide-react";
import ReviewForm from "@/components/game/ReviewForm";

interface ReviewsTabProps {
  gameId: string;
  reviews: any[];
  userReview: any | null;
  gameStatus: string;
  onReviewSuccess: (review: any) => void;
}

export default function ReviewsTab({ gameId, reviews, userReview, gameStatus, onReviewSuccess }: ReviewsTabProps) {
  return (
    <div>
      {!userReview && gameStatus === "released" && (
        <div className="glass-card p-5 mb-6">
          <h4 className="text-sm font-semibold text-[#F1F5F9] mb-3 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#06B6D4]" />撰写评测
          </h4>
          <ReviewForm gameId={gameId} onSuccess={onReviewSuccess} />
        </div>
      )}
      {reviews.length === 0 ? (
        <p className="text-[#64748B] text-center py-12">暂无玩家评测</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any) => (
            <div key={r.id} className={`glass-card p-5 ${r.is_featured ? "border-l-2 border-l-[#F5A623]" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#F1F5F9]">{r.user_id?.slice(0, 8)}</span>
                  {r.is_featured && (
                    <span className="text-[10px] bg-[#F5A623]/15 text-[#F5A623] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3" />编辑推荐
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black text-[#F5A623]">{r.rating}</span>
                  <span className="text-xs text-[#64748B]">/10</span>
                </div>
              </div>
              {r.title && <h5 className="font-semibold text-[#F1F5F9] mb-2">{r.title}</h5>}
              <p className="text-sm text-[#94A3B8] whitespace-pre-line">{r.content}</p>
              {r.pros && (
                <div className="mt-3 flex gap-3 text-xs">
                  <span className="text-[#10B981]">👍 {(r.pros || "").split(",").slice(0, 3).join(" · ")}</span>
                  {r.cons && <span className="text-[#EF4444]">👎 {(r.cons || "").split(",").slice(0, 3).join(" · ")}</span>}
                </div>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-[#64748B]">
                {r.playtime_hours && <span>🕐 {r.playtime_hours}h</span>}
                <span>{new Date(r.created_at).toLocaleDateString("zh-CN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
