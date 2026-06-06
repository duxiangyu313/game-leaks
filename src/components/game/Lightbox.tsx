"use client";

interface LightboxProps {
  src: string | null;
  onClose: () => void;
}

export default function Lightbox({ src, onClose }: LightboxProps) {
  if (!src) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl cursor-pointer hover:text-[#06B6D4] transition-colors">&times;</button>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
      <img src={src} alt="截图" className="max-w-full max-h-[80vh] rounded-xl" />
    </div>
  );
}
