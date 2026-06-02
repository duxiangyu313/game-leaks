"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, PenLine, Users, TrendingUp, Clock, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function AnalysisPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("articles").select("*").eq("status", "published").order("created_at", { ascending: false }).then(({ data }) => {
      setArticles(data || []); setLoading(false);
    });
  }, []);

  const cats = [
    { key: "preview", icon: TrendingUp, label: "前瞻", count: articles.filter(a => a.category === "preview").length, color: "text-[#F59E0B]" },
    { key: "analysis", icon: BookOpen, label: "分析", count: articles.filter(a => a.category === "analysis").length, color: "text-[#10B981]" },
    { key: "review", icon: PenLine, label: "评测", count: articles.filter(a => a.category === "review").length, color: "text-[#06B6D4]" },
    { key: "interview", icon: Users, label: "访谈", count: articles.filter(a => a.category === "interview").length, color: "text-[#22D3EE]" },
  ];

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-7 h-7 text-[#06B6D4]" />
          <h1 className="text-3xl font-bold text-[#F1F5F9]">深度解析</h1>
        </div>
        <p className="text-[#94A3B8] mb-10">专业评测与行业深度分析</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {cats.map(cat => (
            <div key={cat.key} className="glass-card p-5 text-center">
              <cat.icon className={`w-8 h-8 ${cat.color} mx-auto mb-3`} />
              <div className="text-lg font-semibold text-[#F1F5F9]">{cat.label}</div>
              <div className="text-xs text-[#64748B] mt-1">{cat.count} 篇</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-28 rounded-xl bg-[#1E293B]/20 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-4">
            {articles.map((a, i) => (
              <motion.article key={a.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="glass-card p-6 hover:border-[#06B6D4]/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#06B6D4]/10 text-[#06B6D4]">
                    {a.category === "preview" ? "前瞻" : a.category === "analysis" ? "分析" : a.category === "review" ? "评测" : a.category}
                  </span>
                  {a.required_tier !== "free" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B]">
                      {a.required_tier === "silver" ? "白银" : a.required_tier === "gold" ? "黄金" : "钻石"}可见
                    </span>
                  )}
                  <span className="text-xs text-[#64748B] flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{new Date(a.created_at).toLocaleDateString("zh-CN")}</span>
                </div>
                <Link href={`/articles/detail?id=${a.id}`}><h3 className="text-lg font-bold text-[#F1F5F9] mb-2 hover:text-[#06B6D4] transition-colors">{a.title}</h3></Link>
                <p className="text-sm text-[#94A3B8] line-clamp-2">{a.content?.slice(0, 150)}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {a.tags?.map((t: string) => <span key={t} className="text-[10px] text-[#64748B] bg-[#1E293B]/40 px-2 py-0.5 rounded">{t}</span>)}
                </div>
              </motion.article>
            ))}
            {articles.length === 0 && <div className="text-center py-16 text-[#64748B]">暂无文章</div>}
          </div>
        )}
      </div>
    </div>
  );
}
