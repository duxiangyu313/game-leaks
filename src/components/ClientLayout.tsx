"use client";

import { useEffect } from "react";
import ProgressBar from "./ProgressBar";
import BackToTop from "./BackToTop";
import { preloadHomepageCache } from "@/lib/data-cache";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    preloadHomepageCache();
  }, []);

  return (
    <>
      <ProgressBar />
      {children}
      <BackToTop />
    </>
  );
}
