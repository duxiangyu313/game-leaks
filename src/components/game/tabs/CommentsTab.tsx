"use client";

import { useState } from "react";
import { Star, Loader2, Send } from "lucide-react";

interface CommentsTabProps {
  comments: any[];
  onComment: (text: string, rating: number) => Promise<any>;
}

export default function CommentsTab({ comments, onComment }: CommentsTabProps) {
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(commentText, commentRating);
    setCommentText("");
    setSubmitting(false);
  };

  return (
    <div>
      <div className="glass-card p-4 mb-6">
        <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="写下你的评论..." rows={3}
          className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] placeholder-[#64748B] text-sm outline-none resize-y mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setCommentRating(s)}>
                <Star className={`w-4 h-4 ${s <= commentRating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#64748B]"}`} />
              </button>
            ))}
          </div>
          <button onClick={handleSubmit} disabled={submitting || !commentText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-xl hover:bg-[#0891B2] disabled:opacity-50 transition-all">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 发布
          </button>
        </div>
      </div>
      {comments.length === 0 && <p className="text-[#64748B] text-center py-8">暂无评论，来写第一条</p>}
      {comments.length > 0 && (
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#F1F5F9]">{c.user_id?.slice(0, 8)}</span>
                <span className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3 h-3 ${s <= (c.rating || 5) ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#64748B]"}`} />)}
                </span>
              </div>
              <p className="text-sm text-[#94A3B8]">{c.content}</p>
              <p className="text-xs text-[#64748B] mt-2">{new Date(c.created_at).toLocaleDateString("zh-CN")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
