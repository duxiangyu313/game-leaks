"use client";

import dynamic from "next/dynamic";

const SplashCursor = dynamic(() => import("./SplashCursor"), { ssr: false });

export default function SplashCursorWrapper() {
  return (
    <SplashCursor
      DENSITY_DISSIPATION={3.5}
      SPLAT_RADIUS={0.25}
      COLOR="#F5A623"
      BACK_COLOR={{ r: 10, g: 12, b: 16 }}
    />
  );
}
