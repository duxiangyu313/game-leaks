import Link from "next/link";
import { BookOpen, Sparkles, User, Image, Zap, FileText, Plus, Edit3 } from "lucide-react";
import CrosshairIcon from "@/components/game/CrosshairIcon";

interface WikiTabProps {
  gameId: string;
  wiki: any;
}

export default function WikiTab({ gameId, wiki }: WikiTabProps) {
  if (!wiki) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
        <p className="text-[#64748B] mb-4">暂无百科信息</p>
        <Link href={`/games/wiki/edit?id=${gameId}`} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-[#06B6D4] text-white rounded-xl hover:bg-[#0891B2] transition-all">
          <Plus className="w-4 h-4" />创建百科
        </Link>
      </div>
    );
  }

  const parseJSON = (val: any) => {
    try { return typeof val === "string" ? JSON.parse(val) : val; } catch { return null; }
  };

  return (
    <div className="space-y-8">
      {wiki.background && (
        <div>
          <h3 className="text-lg font-bold text-[#F1F5F9] mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#06B6D4]" />游戏背景</h3>
          <p className="text-[#94A3B8] leading-relaxed whitespace-pre-line">{wiki.background}</p>
        </div>
      )}
      {wiki.worldview && (
        <div>
          <h3 className="text-lg font-bold text-[#F1F5F9] mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#F5A623]" />世界观</h3>
          <p className="text-[#94A3B8] leading-relaxed whitespace-pre-line">{wiki.worldview}</p>
        </div>
      )}
      <WikiSection title="角色介绍" icon={<User className="w-5 h-5 text-[#10B981]" />} data={parseJSON(wiki.characters)} renderItem={(c: any) => ({ name: c.name, desc: c.desc })} />
      <WikiSection title="武器装备" icon={<CrosshairIcon className="w-5 h-5 text-[#E94560]" />} data={parseJSON(wiki.weapons)} renderItem={(w: any) => ({ name: w.name, desc: w.desc, badge: w.type })} />
      <WikiSection title="地图区域" icon={<Image className="w-5 h-5 text-[#8B5CF6]" />} data={parseJSON(wiki.maps)} renderItem={(m: any) => ({ name: m.name, desc: m.desc })} />
      {wiki.developer_notes && (
        <div>
          <h3 className="text-lg font-bold text-[#F1F5F9] mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-[#F59E0B]" />开发秘闻</h3>
          <p className="text-[#94A3B8] leading-relaxed whitespace-pre-line">{wiki.developer_notes}</p>
        </div>
      )}
      <div className="text-center pt-4 border-t border-[rgba(30,41,59,0.3)]">
        <Link href={`/games/wiki/edit?id=${gameId}`} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-[#06B6D4]/10 text-[#06B6D4] rounded-xl hover:bg-[#06B6D4]/20 transition-all">
          <Edit3 className="w-4 h-4" />编辑百科（管理员审核后发布）
        </Link>
      </div>
    </div>
  );
}

function WikiSection({ title, icon, data, renderItem }: {
  title: string; icon: React.ReactNode; data: any[] | null;
  renderItem: (item: any) => { name: string; desc: string; badge?: string };
}) {
  if (!data || data.length === 0) return null;
  return (
    <div>
      <h3 className="text-lg font-bold text-[#F1F5F9] mb-4 flex items-center gap-2">{icon}{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item: any, i: number) => {
          const { name, desc, badge } = renderItem(item);
          return (
            <div key={i} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-[#F1F5F9]">{name}</h4>
                {badge && <span className="text-[10px] px-2 py-0.5 rounded bg-[#1E293B] text-[#64748B]">{badge}</span>}
              </div>
              <p className="text-sm text-[#94A3B8]">{desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
