"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Clock, Shield, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { formatDate } from "@/lib/article-utils";
import type { Leak } from "@/types";

const MOCK: Record<string, Leak> = {
  "1": { id:"1",title:"网易《归唐》开发团队超200人",summary:"内部消息称归唐项目规模远超预期，雷火倾注全力打造网易第一款真正意义上的买断制3A",content:"据内部消息人士透露，网易雷火事业群旗下临安24工作室的《归唐》项目开发团队已超过200人。这是网易历史上第一款自研买断制3A单机游戏，项目级别被定为S级。\n\n团队核心成员来自育碧、EA、卡普空等国际大厂，拥有丰富的3A开发经验。项目制作人胡志鹏为网易集团执行副总裁，足见网易对此项目的重视程度。\n\n目前游戏已进入后期打磨阶段，将于2026年夏日游戏节上展示12分钟实机演示。",source:"内部渠道",credibility:"likely",gameId:"1",gameName:"归唐",images:[],publishedAt:"2026-06-01",authorId:"1",viewCount:12800,commentCount:326 },
  "2": { id:"2",title:"腾讯蛇夫座第二项目曝光",summary:"继湮灭之潮后，腾讯蛇夫座的第二款3A项目浮出水面，据悉为现代军事战术射击题材",content:"通过招聘信息交叉验证，腾讯蛇夫座工作室正在招募具有军事战术射击经验的开发者，暗示其第二个3A项目方向。\n\n蛇夫座工作室此前以《湮灭之潮》获得广泛关注，该作为亚瑟王传说题材的动作游戏。第二个项目转向现代军事题材，显示腾讯在3A领域的多元化布局。\n\n目前该项目尚处于早期预研阶段，预计2-3年内不会有公开消息。",source:"招聘信息",credibility:"likely",gameId:"2",gameName:"蛇夫座新作",images:[],publishedAt:"2026-05-31",authorId:"2",viewCount:9500,commentCount:218 },
  "3": { id:"3",title:"《影之刃零》收藏版定价泄露",summary:"网传影之刃零将推出三版本：标准版298元、豪华版398元、收藏版698元",content:"据电商平台泄露信息，影之刃零将推出三个版本：\n\n- 标准版 298元：游戏本体\n- 豪华版 398元：游戏本体 + 数字艺术集 + 原声带\n- 收藏版 698元：豪华版内容 + 主角灵魂雨手办 + 铁盒包装\n\n制作人梁其伟已辟谣称\"太贵了\"，暗示收藏版定价可能不会达到698元。正式售价将在夏季预购开启时公布。",source:"电商平台",credibility:"rumor",gameId:"3",gameName:"影之刃零",images:[],publishedAt:"2026-05-30",authorId:"3",viewCount:7600,commentCount:187 },
  "4": { id:"4",title:"游戏科学第三项目代号'山海'",summary:"继黑神话悟空和钟馗之后，游戏科学第三个3A项目曝光，以西游记+山海经为世界观基底",content:"多方招聘信息显示，游戏科学正在招募开放世界相关人才，第三个3A项目代号'山海'已进入早期预研阶段。\n\n该项目将以《西游记》和《山海经》为世界观基底，打造一个融合中国神话的开放世界游戏。目前团队规模约30人，处于概念设计和原型验证阶段。\n\n冯骥此前表示\"西游不会到此为止\"，暗示黑神话系列将继续扩展。但第三个项目是否为黑神话系列正统续作，目前尚未确认。",source:"招聘信息",credibility:"likely",gameId:"4",gameName:"黑神话系列",images:[],publishedAt:"2026-05-29",authorId:"1",viewCount:15200,commentCount:412 },
};

export default function LeakDetailPage() {
  return (
    <Suspense fallback={<div className="pt-24 pb-20"><div className="max-w-3xl mx-auto px-4"><div className="animate-pulse space-y-4"><div className="h-8 w-64 bg-[#1E293B]/40 rounded" /><div className="h-64 bg-[#1E293B]/20 rounded-2xl" /></div></div></div>}>
      <LeakDetailContent />
    </Suspense>
  );
}

function LeakDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [leak, setLeak] = useState<Leak | null>(null);
  const [loading, setLoading] = useState(true);

  // ── SEO: 客户端更新 document.title ──
  useEffect(() => {
    if (!leak) return;
    document.title = `${leak.title} · 国游爆料`;
  }, [leak]);

  useEffect(() => {
    if (!id) return;
    supabase.from("leaks").select("*").eq("id", id).single()
      .then(({ data, error }) => {
        if (!error && data) {
          setLeak({ ...data, gameId: data.game_id, publishedAt: data.published_at, viewCount: data.view_count, commentCount: data.comment_count || 0, gameName: data.game_name } as Leak);
        } else {
          setLeak(MOCK[id] || null);
        }
        setLoading(false);
      });
  }, [id]);

  // Handle no id before loading check to avoid synchronous setState in effect
  if (!id) {
    return (
      <div className="pt-24 pb-20">
        <div className="max-w-lg mx-auto px-4 text-center">
          <AlertTriangle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-3">未找到此爆料</h1>
          <LinkNoPrefetch href="/leaks" className="text-[#06B6D4] hover:underline">返回爆料列表</LinkNoPrefetch>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-[#1E293B]/40 rounded" />
            <div className="h-64 bg-[#1E293B]/20 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!leak) {
    return (
      <div className="pt-24 pb-20">
        <div className="max-w-lg mx-auto px-4 text-center">
          <AlertTriangle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-3">未找到此爆料</h1>
          <LinkNoPrefetch href="/leaks" className="text-[#06B6D4] hover:underline">返回爆料列表</LinkNoPrefetch>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <LinkNoPrefetch href="/leaks" className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回爆料列表
        </LinkNoPrefetch>

        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              leak.credibility === "confirmed" ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20" :
              leak.credibility === "likely" ? "bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/20" :
              "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20"
            }`}>
              {leak.credibility === "confirmed" ? "已确认" : leak.credibility === "likely" ? "高可信" : "传闻"}
            </span>
            {leak.credibility !== "confirmed" && (
              <span className="text-xs text-[#F59E0B] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 传闻，未经证实</span>
            )}
          </div>

          <h1 className="text-3xl font-black text-[#F1F5F9] mb-4">{leak.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B] mb-8 pb-8 border-b border-[#1E293B]/40">
            {leak.gameName && (
              <LinkNoPrefetch href={`/games/detail?id=${leak.gameId}`} className="text-[#06B6D4] hover:underline font-medium">{leak.gameName}</LinkNoPrefetch>
            )}
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatDate(leak.publishedAt)}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {leak.viewCount?.toLocaleString()} 阅读</span>
            {leak.source && <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> 来源：{leak.source}</span>}
          </div>

          <div className="prose prose-invert max-w-none">
            {(leak.content || leak.summary).split("\n").filter(Boolean).map((p, i) => (
              <p key={i} className="text-[#CBD5E1] leading-relaxed mb-4">{p}</p>
            ))}
          </div>
        </motion.article>
      </div>
    </div>
  );
}
