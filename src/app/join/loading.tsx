import { PenLine, Search, Video, Users, Mail } from "lucide-react";

const POSITIONS = [
  { icon: PenLine, title: "内容作者", type: "兼职 / 远程", desc: "撰写国产3A游戏深度分析、评测文章、行业观察。有游戏媒体或自媒体写作经验优先。需提供作品集。", color: "#06B6D4" },
  { icon: Search, title: "资讯编辑", type: "兼职 / 远程", desc: "追踪国产3A游戏最新资讯，挖掘海外爆料源，快速编译新闻稿。对游戏行业动态敏感，英语阅读能力好。", color: "#F5A623" },
  { icon: Video, title: "视频剪辑", type: "兼职 / 远程", desc: "配合国游温度计视频频道制作游戏资讯短视频。熟练使用剪映/PR，有游戏视频制作经验，懂B站/抖音风格。", color: "#E94560" },
  { icon: Users, title: "社群运营", type: "兼职 / 远程", desc: "管理QQ群/微信群/论坛社区，策划线上活动，维护社区氛围。有游戏社区运营经验，对国产3A有热情。", color: "#10B981" },
];

export default function JoinLoading() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">加入我们</h1>
          <p className="text-[#94A3B8]">国游温度计正在寻找热爱国产3A游戏的小伙伴。目前所有岗位均为兼职/远程协作，时间灵活。</p>
        </div>
        <div className="flex flex-col gap-4 mb-10">
          {POSITIONS.map((pos) => (
            <div key={pos.title} className="glass-card p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${pos.color}15` }}>
                  <pos.icon size={20} style={{ color: pos.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-[#F1F5F9]">{pos.title}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E293B] text-[#64748B]">{pos.type}</span>
                  </div>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{pos.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 rounded-xl bg-[#06B6D4]/5 border border-[#06B6D4]/20 text-center">
          <Mail size={24} className="text-[#06B6D4] mx-auto mb-3" />
          <p className="text-[#F1F5F9] font-medium mb-1">投递简历</p>
          <p className="text-sm text-[#94A3B8] mb-3">发送简历 + 作品集到 <a href="mailto:join@guoyouwenduji.cc" className="text-[#06B6D4] hover:underline">join@guoyouwenduji.cc</a></p>
          <p className="text-xs text-[#64748B]">邮件主题：【应聘】岗位名称 — 你的名字。3个工作日内回复。</p>
        </div>
      </div>
    </div>
  );
}
