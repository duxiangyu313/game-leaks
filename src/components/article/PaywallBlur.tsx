"use client";

import React, { useRef } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { Lock, Crown } from "lucide-react";
import type { MembershipTier } from "@/types";
import { getVisibilityLabel, getUpgradeTier } from "@/lib/auth";

interface Props {
  children: React.ReactNode;
  /** 开始模糊的位置（百分比，0-100） */
  blurStartPct?: number;
  membershipLevel: MembershipTier;
  requiredTier: MembershipTier;
  articleId: string;
}

/**
 * 付费墙渐进模糊
 * 非会员：前 N% 清晰 → N%-N+15% 渐进模糊 → N+15%+ 全模糊
 * 会员：无模糊
 */
export default function PaywallBlur({
  children,
  blurStartPct = 20,
  membershipLevel,
  requiredTier,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 派生值：会员等级是否足够阅读
  const rank: Record<string, number> = { free: 0, silver: 1, gold: 2, diamond: 3 };
  const canRead = (rank[membershipLevel] || 0) >= (rank[requiredTier] || 0);

  // 会员直接渲染全部内容
  if (canRead) return <>{children}</>;

  const visibilityLabel = getVisibilityLabel(requiredTier);
  const upgradeTier = getUpgradeTier(membershipLevel, requiredTier) || requiredTier;
  const upgradeLabel = getVisibilityLabel(upgradeTier);

  return (
    <div ref={containerRef} className="paywall-blur-container">
      {/* 全部内容，但非会员区域模糊 */}
      <div className="relative">
        {React.Children.map(children, (child, index) => {
          // 估算每个子元素所占比例
          const totalChildren = React.Children.count(children);
          const childPct = ((index + 1) / totalChildren) * 100;

          if (childPct <= blurStartPct) {
            // 清晰区域
            return <div key={index}>{child}</div>;
          }

          // 渐进模糊：越靠后越模糊
          const progress = Math.min(1, (childPct - blurStartPct) / 15);
          const blurPx = Math.round(progress * 12);

          return (
            <div
              key={index}
              className="paywall-blur-zone"
              style={{ "--blur-px": `${blurPx}px` } as React.CSSProperties}
            >
              {child}
            </div>
          );
        })}
      </div>

      {/* 渐变遮罩 + CTA */}
      <div className="paywall-gradient-overlay paywall-gradient-overlay--top" />
      <div className="paywall-cta">
        <Lock className="w-12 h-12 text-[#F59E0B] mx-auto mb-3" />
        <p className="text-lg font-bold text-[#F1F5F9] mb-1">
          此内容仅{visibilityLabel}可见
        </p>
        <p className="text-sm text-[#94A3B8] mb-5">
          你当前的会员等级：{membershipLevel === "free" ? "普通用户" : getVisibilityLabel(membershipLevel)}
        </p>
        <LinkNoPrefetch
          href="/member"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:shadow-[0_0_24px_rgba(245,158,11,0.25)] transition-all"
        >
          <Crown className="w-4 h-4" />
          升级到{upgradeLabel}
        </LinkNoPrefetch>
      </div>
    </div>
  );
}
