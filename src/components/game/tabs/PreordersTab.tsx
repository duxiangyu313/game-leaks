interface PreordersTabProps {
  preorders: any[];
}

const editionLabel: Record<string, string> = {
  standard: "标准版", deluxe: "豪华版", collectors: "收藏版",
};

export default function PreordersTab({ preorders }: PreordersTabProps) {
  if (preorders.length === 0) {
    return <p className="text-[#64748B] text-center py-12">暂无预购信息</p>;
  }

  return (
    <div className="space-y-3">
      {preorders.map((po: any) => (
        <div key={po.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 rounded bg-[#1E293B] text-[#64748B]">{po.platform}</span>
            <div>
              <h4 className="font-semibold text-[#F1F5F9] text-sm">{editionLabel[po.edition] || po.edition}</h4>
              <p className="text-xs text-[#94A3B8]">{po.bonus}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-[#F5A623]">¥{po.price}</span>
            {po.purchase_link && (
              <a href={po.purchase_link} target="_blank" rel="noopener" className="px-3 py-1.5 text-xs bg-[#06B6D4] text-white rounded-lg hover:bg-[#0891B2]">购买</a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
