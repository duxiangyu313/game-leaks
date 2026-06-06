"use client";

import { useState, useCallback, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function GlitchEffect({ children, className = "" }: Props) {
  const [glitching, setGlitching] = useState(false);

  const handleClick = useCallback(() => {
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  }, []);

  return (
    <div
      className={`relative cursor-pointer select-none ${className}`}
      onClick={handleClick}
      style={glitching ? {
        animation: "cyber-glitch 0.2s ease",
      } : undefined}
    >
      {children}
      {glitching && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              animation: "cyber-glitch-red 0.2s ease",
              color: "rgba(233,69,96,0.5)",
              opacity: 0.3,
            }}
          >
            {children}
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              animation: "cyber-glitch-cyan 0.2s ease",
              color: "rgba(6,182,212,0.5)",
              opacity: 0.3,
              transform: "translate(2px, -1px)",
            }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}
