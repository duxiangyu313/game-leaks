import { Download, Plus, Star, Zap } from "lucide-react";

interface DlcTabProps {
  dlc: any[];
}

const statusLabel: Record<string, string> = {
  released: "已发布", upcoming: "即将发布", "in-dev": "开发中",
};

const typeLabel: Record<string, string> = {
  dlc: "DLC", expansion: "资料片", season_pass: "季票",
};

export default function DlcTab({ dlc }: DlcTabProps) {
  if (dlc.length === 0) {
    return <p className="text-[#64748B] text-center py-12">暂无DLC或更新内容</p>;
  }

  const iconMap: Record<string, React.ReactNode> = {
    dlc: <Download className="w-5 h-5 text-[#06B6D4]" />,
    expansion: <Plus className="w-5 h-5 text-[#F5A623]" />,
    season_pass: <Star className="w-5 h-5 text-[#F59E0B]" />,
  };

  const statusColor = (s: string) => {
    if (s === "released") return "bg-[#10B981]/10 text-[#10B981]";
    if (s === "upcoming") return "bg-[#06B6D4]/10 text-[#06B6D4]";
    if (s === "in-dev") return "bg-[#F59E0B]/10 text-[#F59E0B]";
    return "bg-[#1E293B] text-[#64748B]";
  };

  return (
    <div className="space-y-3">
      {dlc.map((d: any) => (
        <div key={d.id} className="glass-card p-4 flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            d.status === "released" ? "bg-[#10B981]/10" : d.status === "upcoming" ? "bg-[#06B6D4]/10" : "bg-[#1E293B]"
          }`}>
            {iconMap[d.dlc_type] || <Zap className="w-5 h-5 text-[#10B981]" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-[#F1F5F9]">{d.title}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor(d.status)}`}>
                {statusLabel[d.status] || "传闻"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1E293B] text-[#64748B]">
                {typeLabel[d.dlc_type] || "更新"}
              </span>
            </div>
            <p className="text-sm text-[#94A3B8]">{d.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B]">
              {d.release_date && <span>📅 {d.release_date}</span>}
              {d.price && <span>💰 {d.price}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
