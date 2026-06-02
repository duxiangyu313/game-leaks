"use client";

import { useState } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import MemberBadge from "./MemberBadge";
import type { MembershipTier } from "@/types";

interface Props {
  articleId: string;
  paragraphIndex: number;
}

/** 行内评论 — 段落级评论 */
export default function InlineComment({ articleId, paragraphIndex }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSubmitting(true);
    await supabase.from("post_comments").insert({
      article_id: articleId,
      user_id: user.id,
      content: comment.trim(),
      paragraph_index: paragraphIndex,
    });
    setComment("");
    setSubmitting(false);
    setIsOpen(false);
  };

  return (
    <span className="inline-comment-trigger-container">
      {/* 触发按钮 */}
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs text-[#64748B] hover:text-[#06B6D4] hover:bg-[#1E293B]/60 transition-all ml-1 align-middle"
        title="对此段评论"
      >
        <MessageCircle className="w-3.5 h-3.5" />
      </button>

      {/* 评论面板 */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 mt-2 glass-card p-3 z-20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="对此段内容发表看法..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-xs placeholder-[#64748B] outline-none resize-none mb-2"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#64748B]">段落 {paragraphIndex + 1}</span>
            <button
              onClick={handleSubmit}
              disabled={submitting || !comment.trim()}
              className="flex items-center gap-1 px-3 py-1 bg-[#06B6D4] text-white text-xs font-medium rounded-lg hover:bg-[#0891B2] disabled:opacity-50 transition-all"
            >
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              发送
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
