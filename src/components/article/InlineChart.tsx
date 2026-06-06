"use client";

import { motion } from "framer-motion";

interface BarItem { label: string; value: number; color?: string; max?: number }

interface Props {
  type: "bar" | "timeline" | "comparison";
  title?: string;
  data: BarItem[];
  className?: string;
}

const COLORS = ["#06B6D4", "#F59E0B", "#E94560", "#10B981", "#8B5CF6", "#F97316"];

export default function InlineChart({ type, title, data, className = "" }: Props) {
  if (!data.length) return null;

  const maxVal = type === "bar" ? Math.max(...data.map(d => d.value), 1) : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`my-6 p-5 rounded-xl border border-[#1E293B] bg-[#0F172A]/80 ${className}`}
    >
      {title && (
        <h4 className="text-sm font-semibold text-[#94A3B8] mb-4 uppercase tracking-wider">{title}</h4>
      )}

      {type === "bar" && (
        <div className="space-y-3">
          {data.map((d, i) => {
            const pct = Math.round((d.value / maxVal) * 100);
            const color = d.color || COLORS[i % COLORS.length];
            return (
              <div key={d.label} className="flex items-center gap-3">
                <span className="w-24 text-xs text-[#94A3B8] text-right shrink-0 truncate">{d.label}</span>
                <div className="flex-1 h-7 bg-[#1E293B]/60 rounded relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded"
                    style={{ background: `linear-gradient(90deg, ${color}cc, ${color})` }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-white">{d.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {type === "comparison" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E293B]">
                <th className="text-left py-2 text-[#64748B] font-medium">对比项</th>
                {data.map((d, i) => (
                  <th key={i} className="text-right py-2 px-3 font-semibold" style={{ color: d.color || COLORS[i] }}>
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#1E293B]/30">
                <td className="py-2 text-[#94A3B8]">热度指数</td>
                {data.map((d, i) => (
                  <td key={i} className="text-right py-2 font-mono text-[#F1F5F9]">{d.value}</td>
                ))}
              </tr>
              <tr className="border-b border-[#1E293B]/30">
                <td className="py-2 text-[#94A3B8]">预估销量(万)</td>
                {data.map((d, i) => (
                  <td key={i} className="text-right py-2 font-mono text-[#F1F5F9]">{d.max || "—"}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {type === "timeline" && (
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-[#06B6D4]/30" />
          {data.map((d, i) => (
            <div key={d.label} className="relative mb-4 last:mb-0 pl-4">
              <div
                className="absolute left-[-21px] top-1.5 w-3 h-3 rounded-full border-2"
                style={{ background: d.color || COLORS[i % COLORS.length], borderColor: d.color || COLORS[i % COLORS.length] }}
              />
              <span className="text-xs text-[#64748B]">{d.label}</span>
              <span className="ml-2 text-sm text-[#F1F5F9]">{d.value > 0 ? `${d.value}` : ""}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
