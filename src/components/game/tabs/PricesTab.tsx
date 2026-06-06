import { DollarSign } from "lucide-react";

interface PricesTabProps {
  prices: any[];
}

export default function PricesTab({ prices }: PricesTabProps) {
  if (prices.length === 0) {
    return <p className="text-[#64748B] text-center py-12">暂无价格数据</p>;
  }

  const maxPrice = Math.max(...prices.map((p: any) => p.original_price || p.current_price || 0));

  // Group by platform+store
  const groups: Record<string, any[]> = {};
  prices.forEach((p: any) => {
    const key = `${p.platform} ${p.store}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  return (
    <div>
      <div className="glass-card p-5 mb-6">
        <h4 className="text-sm font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#10B981]" />历史价格趋势
        </h4>
        <div className="space-y-3">
          {Object.entries(groups).map(([key, items]: [string, any[]]) => {
            const latest = items[0];
            const lowest = items.reduce((min, p) => (p.current_price < min.current_price ? p : min), items[0]);
            return (
              <div key={key} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#F1F5F9]">{key}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#64748B]">当前 <strong className="text-[#F1F5F9] text-lg">¥{latest.current_price}</strong></span>
                    {latest.discount_percent > 0 && <span className="text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">-{latest.discount_percent}%</span>}
                  </div>
                </div>
                <div className="flex items-end gap-1 h-16">
                  {items.reverse().map((p: any, i: number) => {
                    const barH = maxPrice > 0 ? ((p.current_price || p.original_price) / maxPrice * 100) : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="w-full bg-[#06B6D4]/40 hover:bg-[#06B6D4]/70 rounded-t transition-all" style={{ height: `${Math.max(barH, 5)}%` }} />
                        <span className="text-[9px] text-[#64748B]">{p.recorded_at?.slice(5)}</span>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1E293B] text-[#F1F5F9] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">¥{p.current_price || p.original_price}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-[#64748B]">
                  <span>最低 ¥{lowest.current_price || lowest.original_price}</span>
                  <span>原价 ¥{items[items.length - 1]?.original_price || items[items.length - 1]?.current_price}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price table */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(30,41,59,0.4)] text-[#64748B] text-xs">
              <th className="text-left p-3">平台</th><th className="text-left p-3">商店</th><th className="text-right p-3">原价</th><th className="text-right p-3">现价</th><th className="text-right p-3">折扣</th><th className="text-right p-3">日期</th>
            </tr>
          </thead>
          <tbody>
            {prices.slice(0, 20).map((p: any) => (
              <tr key={p.id} className="border-b border-[rgba(30,41,59,0.15)]">
                <td className="p-3 text-[#F1F5F9]">{p.platform}</td>
                <td className="p-3 text-[#94A3B8]">{p.store}</td>
                <td className="p-3 text-right text-[#64748B]">¥{p.original_price}</td>
                <td className="p-3 text-right text-[#F1F5F9] font-semibold">¥{p.current_price}</td>
                <td className="p-3 text-right">{p.discount_percent > 0 ? <span className="text-[#10B981]">-{p.discount_percent}%</span> : <span className="text-[#64748B]">-</span>}</td>
                <td className="p-3 text-right text-[#64748B]">{p.recorded_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
