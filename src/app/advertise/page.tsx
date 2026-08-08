import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "广告合作 - 国游爆料国产3A游戏/黑神话悟空/影之刃零品牌推广",
  description: "国游爆料专注国产3A游戏领域，覆盖主机与PC硬核玩家群体。欢迎游戏厂商、硬件品牌、外设厂商洽谈图文推广、视频合作、游戏激活码派发、定制内容与活动赞助等多元化合作，精准触达国产游戏核心受众。",
  alternates: { canonical: "/advertise/" },
};

export default function Page() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#F1F5F9] mb-4">广告合作</h1>
        <p className="text-[#94A3B8] mb-8">
          国游爆料专注国产3A游戏领域，覆盖主机/PC硬核玩家群体。欢迎游戏厂商、硬件品牌洽谈广告合作。
        </p>

        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-3">合作形式</h2>
          <ul className="space-y-3 text-[#94A3B8]">
            <li className="flex items-start gap-2">
              <span className="text-[#06B6D4] mt-0.5">•</span>
              <span><strong className="text-[#F1F5F9]">图文推广</strong> — 首页 banner、文章内嵌、侧边栏推荐位</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#06B6D4] mt-0.5">•</span>
              <span><strong className="text-[#F1F5F9]">视频合作</strong> — 国游温度计视频节目品牌植入、口播推荐</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#06B6D4] mt-0.5">•</span>
              <span><strong className="text-[#F1F5F9]">游戏激活码派发</strong> — 平台内建激活码系统，精准触达目标玩家</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#06B6D4] mt-0.5">•</span>
              <span><strong className="text-[#F1F5F9]">定制内容</strong> — 深度评测、开发者访谈、专题策划</span>
            </li>
          </ul>
        </div>

        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-3">受众画像</h2>
          <ul className="space-y-2 text-[#94A3B8]">
            <li>• 核心 PC/主机玩家，18-35岁男性为主</li>
            <li>• 高消费力：已购买 2+ 款 3A 游戏的用户占比 80%+</li>
            <li>• 月均 PV 50万+，B站粉丝持续增长中</li>
          </ul>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-3">联系方式</h2>
          <p className="text-[#94A3B8]">
            请将合作需求发送至邮箱：<a href="mailto:1852779947@qq.com" className="text-[#06B6D4] hover:underline">1852779947@qq.com</a>
          </p>
          <p className="text-xs text-[#64748B] mt-2">我们会在 2 个工作日内回复。</p>
        </div>
      </div>
    </div>
  );
}
