"use client";

interface Props { tier: "gold" | "diamond" | "silver"; className?: string }

export default function PremiumBadge({ tier, className = "" }: Props) {
  const styles = {
    gold:    { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.5)", text: "#FBBF24" },
    diamond: { bg: "rgba(6,182,212,0.15)",  border: "rgba(6,182,212,0.5)", text: "#22D3EE" },
    silver:  { bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.4)", text: "#CBD5E1" },
  } as const;
  const s = styles[tier];
  return (
    <span className={`relative overflow-hidden rounded-full px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold ${className}`}
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      <span className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(90deg,transparent 0%,${s.text}22 50%,transparent 100%)`, animation: "cyber-scan 2s linear infinite" }} />
      <span className="relative z-10">🔒 {tier==="gold"?"黄金会员":tier==="diamond"?"钻石会员":"白银会员"}</span>
    </span>
  );
}
