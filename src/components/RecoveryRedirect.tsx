"use client";

import { useEffect } from "react";

export default function RecoveryRedirect() {
  useEffect(() => {
    const s = window.location.search;
    const h = window.location.hash;
    if (s.includes("type=recovery") || h.includes("type=recovery")) {
      window.location.replace("/auth/" + (s || h.replace(/^#/, "?")));
    }
  }, []);
  return null;
}
