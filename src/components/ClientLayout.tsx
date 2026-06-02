"use client";

import ProgressBar from "./ProgressBar";
import BackToTop from "./BackToTop";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProgressBar />
      {children}
      <BackToTop />
    </>
  );
}
