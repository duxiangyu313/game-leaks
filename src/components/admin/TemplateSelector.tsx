"use client";

import { FileText, Flame, BookOpen, Newspaper, Layout } from "lucide-react";
import type { TemplateType } from "@/types";

interface Props {
  selected: string;
  onSelect: (templateType: TemplateType) => void;
}

const TEMPLATES: Array<{
  type: TemplateType;
  icon: typeof FileText;
  name: string;
  description: string;
  color: string;
}> = [
  {
    type: "leak",
    icon: Flame,
    name: "爆料模板",
    description: "核心要点 → 正文 → 可信度评估 → 关键总结",
    color: "text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/5",
  },
  {
    type: "review",
    icon: BookOpen,
    name: "评测模板",
    description: "游戏速览 → 正文 → 优缺点 → 总评",
    color: "text-[#06B6D4] border-[#06B6D4]/30 bg-[#06B6D4]/5",
  },
  {
    type: "analysis",
    icon: BookOpen,
    name: "分析模板",
    description: "摘要 → 正文 → 数据支撑 → 结论展望",
    color: "text-[#10B981] border-[#10B981]/30 bg-[#10B981]/5",
  },
  {
    type: "news",
    icon: Newspaper,
    name: "新闻模板",
    description: "TL;DR → 正文 → 背景",
    color: "text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/5",
  },
  {
    type: "standard",
    icon: Layout,
    name: "标准模板",
    description: "自由格式，无预设结构",
    color: "text-[#64748B] border-[#64748B]/30 bg-[#64748B]/5",
  },
];

/** 模板选择器 */
export default function TemplateSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
        选择模板
      </h4>
      <div className="grid grid-cols-1 gap-2">
        {TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          const isSelected = selected === tpl.type;

          return (
            <button
              key={tpl.type}
              onClick={() => onSelect(tpl.type)}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? `${tpl.color} border-current`
                  : "border-[rgba(30,41,59,0.4)] hover:border-[rgba(30,41,59,0.6)] bg-[#1E293B]/20"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${tpl.color.split(" ")[0]}`} />
              <div>
                <div className="text-sm font-semibold text-[#F1F5F9]">{tpl.name}</div>
                <div className="text-[10px] text-[#64748B] mt-0.5">{tpl.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
