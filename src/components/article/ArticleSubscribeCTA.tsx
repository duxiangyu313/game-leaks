"use client";

import EmailSubscribe from "@/components/EmailSubscribe";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";

/**
 * 文章页免费文末订阅 CTA — 免费转化层
 * 只在免费文章（!isPaid）且未命中付费墙时渲染，
 * 给未注册访客一个低门槛动作：订阅邮箱 或 免费注册账号。
 */
export default function ArticleSubscribeCTA() {
  return (
    <div className="mt-12 p-6 rounded-2xl border border-[#06B6D4]/20 bg-gradient-to-r from-[#06B6D4]/5 to-transparent">
      <h3 className="text-lg font-bold text-[#F1F5F9] mb-1">
        不想错过下一篇国产3A爆料？
      </h3>
      <p className="text-sm text-[#94A3B8] mb-4">
        订阅邮件，黑神话、影之刃零等新游发售、实机、预售第一时间提醒。
      </p>
      <EmailSubscribe compact />
      <div className="mt-4 text-xs text-[#64748B]">
        想要完整账号、收藏与互动？
        <LinkNoPrefetch href="/auth" className="text-[#06B6D4] hover:underline ml-1">
          免费注册 →
        </LinkNoPrefetch>
      </div>
    </div>
  );
}
