"use client";

interface Props { tier: "gold" | "diamond"; className?: string }

export default function PremiumBadge({ tier, className = "" }: Props) {
  const styles = {
    gold:    { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.5)", text: "#FBBF24" },
    diamond: { bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.5)", text: "#60A5FA" },
    } as const;
  const s = styles[tier];
  return (
    <span className={`relative overflow-hidden rounded-full px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold ${className}`}
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      <span className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(90deg,transparent 0%,${s.text}22 50%,transparent 100%)`, animation: "cyber-scan 2s linear infinite" }} />
      <span className="relative z-10">🔒 {tier==="gold"?"黄金会员":"钻石会员"}</span>
    </span>
  );
}
