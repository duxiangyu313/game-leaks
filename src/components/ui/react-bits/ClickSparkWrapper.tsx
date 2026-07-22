"use client";

import dynamic from "next/dynamic";

const ClickSpark = dynamic(() => import("./ClickSpark"), { ssr: false });

export default function ClickSparkWrapper() {
  return (
    <ClickSpark
      sparkColor="#F5A623"
      sparkSize={12}
      sparkRadius={20}
      sparkCount={10}
      duration={500}
    />
  );
}
