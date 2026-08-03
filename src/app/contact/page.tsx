import type { Metadata } from "next";
import { Mail, MessageCircle, Send, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "联系我们 - 国游爆料国产3A游戏资讯合作与玩家反馈通道",
  description: "联系国游爆料团队获取全方位的帮助与服务支持，包括账号登录与安全问题、会员等级与续费咨询、Stripe支付疑问、广告商务合作洽谈、国产3A游戏原创内容投稿、匿名爆料通道提交以及B站微博等社交媒体关注方式，我们一般会在二十四到四十八小时内邮件回复。",
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">联系我们</h1>
          <p className="text-sm text-[#64748B]">有疑问？想合作？欢迎随时联系</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* 客服支持 */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} className="text-[#06B6D4]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#F1F5F9]">客服支持</h2>
                <p className="text-sm text-[#94A3B8] mt-1">账号问题、会员咨询、支付疑问、功能反馈</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 ml-[52px]">
              <a href="mailto:support@guoyouwenduji.cc"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06B6D4] text-white text-sm font-medium hover:bg-[#0891B2] transition-all w-fit">
                <Mail size={16} /> support@guoyouwenduji.cc
              </a>
            </div>
          </div>

          {/* 广告合作 */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 flex items-center justify-center flex-shrink-0">
                <Users size={20} className="text-[#F5A623]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#F1F5F9]">广告合作</h2>
                <p className="text-sm text-[#94A3B8] mt-1">游戏厂商推广、硬件品牌合作、联合活动</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 ml-[52px]">
              <a href="mailto:ads@guoyouwenduji.cc"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5A623] text-[#1A1A2E] text-sm font-medium hover:bg-[#E89510] transition-all w-fit">
                <Mail size={16} /> ads@guoyouwenduji.cc
              </a>
              <a href="/advertise"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(30,41,59,0.6)] text-[#94A3B8] text-sm hover:text-[#F1F5F9] hover:border-[#475569] transition-all w-fit">
                了解合作形式 →
              </a>
            </div>
          </div>

          {/* 内容投稿 */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E94560]/10 flex items-center justify-center flex-shrink-0">
                <Send size={20} className="text-[#E94560]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#F1F5F9]">内容投稿 / 爆料</h2>
                <p className="text-sm text-[#94A3B8] mt-1">匿名爆料提交、行业消息投稿、原创文章投稿</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 ml-[52px]">
              <a href="mailto:tips@guoyouwenduji.cc"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E94560] text-white text-sm font-medium hover:bg-[#D03450] transition-all w-fit">
                <Mail size={16} /> tips@guoyouwenduji.cc
              </a>
              <a href="/submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(30,41,59,0.6)] text-[#94A3B8] text-sm hover:text-[#F1F5F9] hover:border-[#475569] transition-all w-fit">
                匿名提交 →
              </a>
            </div>
          </div>

          {/* 社交媒体 */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1E293B] flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#F1F5F9]">社交媒体</h2>
                <p className="text-sm text-[#94A3B8] mt-1">关注我们获取最新国产3A资讯</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 ml-[52px]">
              <a href="https://space.bilibili.com/3546857156380947" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FB7299]/10 text-[#FB7299] text-sm font-medium hover:bg-[#FB7299]/20 transition-all">
                B站：国游温度计
              </a>
              <a href="https://weibo.com/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E6162D]/10 text-[#E6162D] text-sm font-medium hover:bg-[#E6162D]/20 transition-all">
                微博：国游温度计
              </a>
            </div>
          </div>
        </div>

        {/* 尾部 */}
        <div className="mt-10 p-6 rounded-xl bg-[#1E293B]/30 border border-[rgba(30,41,59,0.4)] text-center">
          <p className="text-sm text-[#64748B]">
            一般邮件回复时间为 <span className="text-[#94A3B8]">24-48 小时</span>。周末和节假日可能稍有延迟。
          </p>
        </div>
      </div>
    </div>
  );
}
