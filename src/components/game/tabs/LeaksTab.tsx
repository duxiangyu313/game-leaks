import LinkNoPrefetch from "@/components/LinkNoPrefetch";

interface LeaksTabProps {
  leaks: any[];
}

const credibilityLabel: Record<string, string> = {
  confirmed: "已确认", likely: "高可信",
};

const credibilityColor = (c: string) => {
  if (c === "confirmed") return "bg-[#10B981]/10 text-[#10B981]";
  if (c === "likely") return "bg-[#06B6D4]/10 text-[#06B6D4]";
  return "bg-[#F59E0B]/10 text-[#F59E0B]";
};

export default function LeaksTab({ leaks }: LeaksTabProps) {
  if (leaks.length === 0) {
    return <p className="text-[#64748B] text-center py-8">暂无相关爆料</p>;
  }

  return (
    <div className="space-y-4">
      {leaks.map(l => (
        <LinkNoPrefetch key={l.id} href={`/leaks/detail?id=${l.id}`} className="block active:scale-[0.98] transition-transform">
          <div className="glass-card p-5 cursor-pointer hover:border-[#06B6D4]/20 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${credibilityColor(l.credibility)}`}>
                {credibilityLabel[l.credibility] || "传闻"}
              </span>
              <span className="text-xs text-[#64748B]">{l.published_at}</span>
            </div>
            <h4 className="font-bold text-[#F1F5F9] mb-1">{l.title}</h4>
            <p className="text-sm text-[#94A3B8]">{l.summary}</p>
          </div>
        </LinkNoPrefetch>
      ))}
    </div>
  );
}
