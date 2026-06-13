"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Plus, Pencil, Trash2, Search, X, Save, Loader2, CheckSquare,
  Square, BarChart3
} from "lucide-react";
import type { GameProgress } from "@/types";

const STAGES = ["概念阶段", "原型开发", "Alpha测试", "Beta测试", "压盘阶段", "已发售"] as const;

export default function AdminGameProgressPage() {
  const [records, setRecords] = useState<GameProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("全部");
  const [sortBy, setSortBy] = useState<string>("updated");

  // 表单
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", cover_url: "", developer: "", publisher: "", genre: "",
    development_stage: "概念阶段", estimated_release_date: "", team_size: 0,
    credibility_score: 5, public_info: "", diamond_info: "", gold_info: "",
    risk_assessment: "", tags: "", is_featured: false,
  });

  // 批量操作
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatch, setShowBatch] = useState(false);
  const [batchStage, setBatchStage] = useState("概念阶段");

  // 加载数据
  const loadData = () => {
    setLoading(true);
    supabase
      .from("game_progress")
      .select("*")
      .order("last_updated", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setRecords(data as GameProgress[]);
        setLoading(false);
      });
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, []);

  // 筛选
  const filtered = useMemo(() => {
    let result = [...records];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.name?.toLowerCase().includes(q) || r.developer?.toLowerCase().includes(q)
      );
    }
    if (stageFilter !== "全部") {
      result = result.filter((r) => r.development_stage === stageFilter);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case "name": return (a.name || "").localeCompare(b.name || "");
        case "credibility": return (b.credibility_score || 0) - (a.credibility_score || 0);
        default: return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
      }
    });
    return result;
  }, [records, search, stageFilter, sortBy]);

  // 打开新增表单
  const openAdd = () => {
    setEditingId(null);
    setForm({
      name: "", cover_url: "", developer: "", publisher: "", genre: "",
      development_stage: "概念阶段", estimated_release_date: "", team_size: 0,
      credibility_score: 5, public_info: "", diamond_info: "", gold_info: "",
      risk_assessment: "", tags: "", is_featured: false,
    });
    setShowForm(true);
  };

  // 打开编辑表单
  const openEdit = (r: GameProgress) => {
    setEditingId(r.id);
    setForm({
      name: r.name, cover_url: r.cover_url || "", developer: r.developer || "",
      publisher: r.publisher || "", genre: r.genre || "",
      development_stage: r.development_stage, estimated_release_date: r.estimated_release_date || "",
      team_size: r.team_size || 0, credibility_score: r.credibility_score,
      public_info: r.public_info || "", diamond_info: r.diamond_info || "", gold_info: r.gold_info,
      risk_assessment: r.risk_assessment, tags: (r.tags || []).join(", "),
      is_featured: r.is_featured,
    });
    setShowForm(true);
  };

  // 保存
  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      cover_url: form.cover_url || null,
      developer: form.developer || null,
      publisher: form.publisher || null,
      genre: form.genre || null,
      development_stage: form.development_stage,
      estimated_release_date: form.estimated_release_date || null,
      team_size: form.team_size || null,
      credibility_score: form.credibility_score,
      public_info: form.public_info,
      diamond_info: form.diamond_info,
      gold_info: form.gold_info,
      risk_assessment: form.risk_assessment,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_featured: form.is_featured,
      last_updated: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingId) {
        await supabase.from("game_progress").update(payload).eq("id", editingId);
      } else {
        await supabase.from("game_progress").insert(payload);
      }
      setShowForm(false);
      loadData();
    } catch {
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  // 删除
  const handleDelete = async (r: GameProgress) => {
    if (!confirm(`确定删除「${r.name}」吗？此操作不可撤销。`)) return;
    await supabase.from("game_progress").delete().eq("id", r.id);
    loadData();
  };

  // 批量更新阶段
  const handleBatchUpdate = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定将 ${selectedIds.size} 个游戏的开发阶段更新为「${batchStage}」吗？`)) return;
    await supabase
      .from("game_progress")
      .update({ development_stage: batchStage, last_updated: new Date().toISOString() })
      .in("id", Array.from(selectedIds));
    setSelectedIds(new Set());
    loadData();
  };

  // 全选/取消
  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#06B6D4]" />
            游戏进度管理
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            管理 {records.length} 个游戏的开发进度数据
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBatch(!showBatch)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors duration-200 ${
              showBatch
                ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                : "bg-[#1E293B]/40 text-[#94A3B8] border border-[#1E293B] hover:border-[#334155]"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            批量操作
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-[#06B6D4] text-white hover:bg-[#0891B2] transition-colors duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            添加进度
          </button>
        </div>
      </div>

      {/* 批量操作面板 */}
      {showBatch && (
        <div className="glass-card p-4 flex items-center gap-4 flex-wrap">
          <span className="text-xs text-[#64748B]">
            已选 {selectedIds.size}/{filtered.length}
          </span>
          <select
            value={batchStage}
            onChange={(e) => setBatchStage(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9]"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleBatchUpdate}
            disabled={selectedIds.size === 0}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 hover:bg-[#F59E0B]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            批量更新阶段
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-[#64748B] hover:text-[#94A3B8]"
            >
              取消选择
            </button>
          )}
        </div>
      )}

      {/* 搜索/筛选 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[360px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="搜索名称或开发商..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0F172A]/60 border border-[#1E293B] text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#06B6D4]/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1">
              <X className="w-3.5 h-3.5 text-[#64748B]" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-[#64748B]">阶段:</span>
          {["全部", ...STAGES].map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                stageFilter === s
                  ? "bg-[#06B6D4]/20 text-[#06B6D4]"
                  : "bg-[#1E293B]/30 text-[#94A3B8] hover:text-[#F1F5F9]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs px-2 py-1.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9]"
        >
          <option value="updated">最近更新</option>
          <option value="name">名称</option>
          <option value="credibility">可信度</option>
        </select>
      </div>

      {/* 加载态 */}
      {loading && (
        <div className="glass-card overflow-hidden animate-pulse">
          <div className="h-12 bg-[#1E293B]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-[#0F172A]/50 border-t border-[#1E293B]/30" />
          ))}
        </div>
      )}

      {/* 表格 */}
      {!loading && (
        <div className="glass-card overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] text-[#64748B] uppercase tracking-wider bg-[#0F172A]/40">
                {showBatch && (
                  <th className="p-3 w-10">
                    <button onClick={toggleAll} className="p-0.5 hover:text-[#F1F5F9] transition-colors">
                      {selectedIds.size === filtered.length && filtered.length > 0
                        ? <CheckSquare className="w-4 h-4 text-[#06B6D4]" />
                        : <Square className="w-4 h-4" />
                      }
                    </button>
                  </th>
                )}
                <th className="p-3 text-left">名称</th>
                <th className="p-3 text-left hidden md:table-cell">开发商</th>
                <th className="p-3 text-left">开发阶段</th>
                <th className="p-3 text-left hidden lg:table-cell">预计发售</th>
                <th className="p-3 text-center hidden lg:table-cell">可信度</th>
                <th className="p-3 text-center hidden lg:table-cell">特色</th>
                <th className="p-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[#1E293B]/30 hover:bg-[#1E293B]/20 transition-colors"
                >
                  {showBatch && (
                    <td className="p-3">
                      <button onClick={() => toggleOne(r.id)} className="p-0.5 hover:text-[#F1F5F9] transition-colors">
                        {selectedIds.has(r.id)
                          ? <CheckSquare className="w-4 h-4 text-[#06B6D4]" />
                          : <Square className="w-4 h-4 text-[#475569]" />
                        }
                      </button>
                    </td>
                  )}
                  <td className="p-3">
                    <span className="font-semibold text-[#F1F5F9] truncate block max-w-[180px]">
                      {r.name}
                    </span>
                  </td>
                  <td className="p-3 text-[#94A3B8] hidden md:table-cell">
                    {r.developer || "-"}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                      r.development_stage === "已发售"
                        ? "bg-[#10B981]/80 text-white"
                        : "bg-[#1E293B] text-[#94A3B8] border border-[#1E293B]"
                    }`}>
                      {r.development_stage}
                    </span>
                  </td>
                  <td className="p-3 text-[#94A3B8] hidden lg:table-cell text-xs whitespace-nowrap">
                    {r.estimated_release_date || "-"}
                  </td>
                  <td className="p-3 text-center hidden lg:table-cell">
                    <span className="text-xs tabular-nums text-[#94A3B8]">{r.credibility_score}/10</span>
                  </td>
                  <td className="p-3 text-center hidden lg:table-cell">
                    {r.is_featured && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B]">
                        精选
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(r)}
                        className="p-1.5 rounded hover:bg-[#06B6D4]/10 text-[#64748B] hover:text-[#06B6D4] transition-colors"
                        title="编辑"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r)}
                        className="p-1.5 rounded hover:bg-[#EF4444]/10 text-[#64748B] hover:text-[#EF4444] transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={showBatch ? 8 : 7} className="p-8 text-center text-[#64748B]">
                    没有找到匹配的记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========== 表单弹窗 ========== */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative glass-card p-6 max-w-2xl w-full mx-4 z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#F1F5F9]">
                {editingId ? "编辑游戏进度" : "添加游戏进度"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded hover:bg-[#1E293B] text-[#64748B] hover:text-[#F1F5F9] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#64748B] uppercase tracking-wider">游戏名称 *</label>
                  <input
                    type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-sm text-[#F1F5F9] focus:outline-none focus:border-[#06B6D4]/50"
                    placeholder="归唐"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#64748B] uppercase tracking-wider">开发商</label>
                  <input
                    type="text" value={form.developer}
                    onChange={(e) => setForm({ ...form, developer: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-sm text-[#F1F5F9] focus:outline-none focus:border-[#06B6D4]/50"
                    placeholder="网易雷火·临安24"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#64748B] uppercase tracking-wider">发行商</label>
                  <input
                    type="text" value={form.publisher}
                    onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-sm text-[#F1F5F9] focus:outline-none focus:border-[#06B6D4]/50"
                    placeholder="网易游戏"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#64748B] uppercase tracking-wider">游戏类型</label>
                  <input
                    type="text" value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-sm text-[#F1F5F9] focus:outline-none focus:border-[#06B6D4]/50"
                    placeholder="动作冒险"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#64748B] uppercase tracking-wider">开发阶段</label>
                  <select
                    value={form.development_stage}
                    onChange={(e) => setForm({ ...form, development_stage: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-sm text-[#F1F5F9] focus:outline-none focus:border-[#06B6D4]/50"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#64748B] uppercase tracking-wider">预计发售日期</label>
                  <input
                    type="text" value={form.estimated_release_date}
                    onChange={(e) => setForm({ ...form, estimated_release_date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-sm text-[#F1F5F9] focus:outline-none focus:border-[#06B6D4]/50"
                    placeholder="2027 Q3"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#64748B] uppercase tracking-wider">团队规模</label>
                  <input
                    type="number" value={form.team_size || ""}
                    onChange={(e) => setForm({ ...form, team_size: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-sm text-[#F1F5F9] focus:outline-none focus:border-[#06B6D4]/50"
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#64748B] uppercase tracking-wider">可信度评分 (1-10)</label>
                  <input
                    type="number" min={1} max={10} value={form.credibility_score}
                    onChange={(e) => setForm({ ...form, credibility_score: Math.min(10, Math.max(1, parseInt(e.target.value) || 5)) })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-sm text-[#F1F5F9] focus:outline-none focus:border-[#06B6D4]/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#64748B] uppercase tracking-wider">封面图 URL</label>
                  <input
                    type="text" value={form.cover_url}
                    onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-sm text-[#F1F5F9] focus:outline-none focus:border-[#06B6D4]/50"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#64748B] uppercase tracking-wider">标签（逗号分隔）</label>
                  <input
                    type="text" value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-sm text-[#F1F5F9] focus:outline-none focus:border-[#06B6D4]/50"
                    placeholder="开放世界, UE5, 腾讯"
                  />
                </div>
              </div>

              {/* 精选 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#06B6D4]"
                />
                <span className="text-xs text-[#94A3B8]">首页精选展示</span>
              </label>

              {/* 富文本区域 */}
              {[
                { key: "public_info", label: "公开信息" },
                { key: "diamond_info", label: "钻石会员信息" },
                { key: "gold_info", label: "黄金会员信息" },
                { key: "risk_assessment", label: "风险评估" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-[10px] text-[#64748B] uppercase tracking-wider">{label}</label>
                  <textarea
                    value={String((form as Record<string, unknown>)[key] || "")}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    rows={4}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-sm text-[#F1F5F9] focus:outline-none focus:border-[#06B6D4]/50 resize-vertical font-mono"
                    placeholder="支持 Markdown 格式..."
                  />
                </div>
              ))}
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-[#1E293B]">
              <button
                onClick={() => setShowForm(false)}
                className="text-xs px-4 py-2 rounded-lg bg-[#1E293B] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name || saving}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-[#06B6D4] text-white hover:bg-[#0891B2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
