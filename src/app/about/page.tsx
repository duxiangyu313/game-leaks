import type { Metadata } from "next";
import { Target, Eye, Gamepad2, MessageCircle, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "关于国游爆料 - 专注国产3A游戏/黑神话悟空/影之刃零资讯追踪",
  description: "国游爆料是专注国产3A游戏的资讯平台，做有温度的国产游戏观察者。黑神话悟空之后，国产3A正在爆发。我们追踪每一款值得关注的国产大作，提供深度解析、独家爆料、游戏评测与行业观察，记录国产游戏崛起的每一步。",
  alternates: { canonical: "/about/" },
};

const HIGHLIGHTS = [
  { icon: Target, label: "使命", text: "成为国产3A游戏最值得信赖的资讯与社区平台" },
  { icon: Eye, label: "视野", text: "覆盖黑神话悟空、影之刃零、归唐、湮灭之潮等全部国产3A大作" },
  { icon: TrendingUp, label: "数据", text: "实时追踪游戏开发进度、发售日期、行业趋势" },
  { icon: MessageCircle, label: "社区", text: "建设国内最活跃的国产3A玩家讨论社区" },
  { icon: Gamepad2, label: "态度", text: "专业但不冷漠，有趣但不低俗 — 做有温度的国产游戏观察者" },
];

export default function AboutPage() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* 页头 */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-3">关于国游爆料</h1>
          <p className="text-lg text-[#94A3B8] leading-relaxed">
            有温度的国产3A游戏观察者
          </p>
        </div>

        <div className="article-content space-y-8">
          <section className="glass-card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[#F1F5F9] mb-4">我们是谁</h2>
            <p className="text-[#94A3B8] leading-relaxed mb-3">
              国游爆料是国游温度计旗下的游戏资讯平台，专注于追踪国产3A大作的最新动态。
              2024年黑神话悟空横空出世，向世界证明了中国团队也能做出世界顶级的3A游戏。
              此后一年多，影之刃零、归唐、湮灭之潮、钟馗等一批国产3A接踵而至——国产游戏正在经历前所未有的爆发期。
            </p>
            <p className="text-[#94A3B8] leading-relaxed">
              我们相信国产游戏值得被更多人看见。国游爆料致力于用专业的深度解析、及时的资讯追踪和活跃的玩家社区，
              陪伴国产3A的成长之路。
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HIGHLIGHTS.map((item) => (
              <div key={item.label} className="glass-card p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={20} className="text-[#06B6D4]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F1F5F9] mb-1">{item.label}</h3>
                  <p className="text-sm text-[#94A3B8]">{item.text}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="glass-card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[#F1F5F9] mb-4">我们追踪什么</h2>
            <ul className="space-y-3 text-[#94A3B8]">
              <li className="flex items-start gap-2">
                <span className="text-[#06B6D4] mt-1">•</span>
                <span><strong className="text-[#F1F5F9]">游戏发售信息</strong> — 发售日确认/变动、定价、平台、预售信息</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06B6D4] mt-1">•</span>
                <span><strong className="text-[#F1F5F9]">开发进度追踪</strong> — 从官宣到发售的全生命周期跟踪</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06B6D4] mt-1">•</span>
                <span><strong className="text-[#F1F5F9]">独家爆料与传闻</strong> — 多渠道交叉验证，标注可信度等级</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06B6D4] mt-1">•</span>
                <span><strong className="text-[#F1F5F9]">深度评测与分析</strong> — 实机试玩体验、系统拆解、行业观察</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#06B6D4] mt-1">•</span>
                <span><strong className="text-[#F1F5F9]">游戏展会与活动</strong> — SGF、科隆、TGS、B站发布会等国内外展会报道</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
