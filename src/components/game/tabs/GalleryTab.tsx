interface GalleryTabProps {
  screenshots: { src: string; alt: string }[];
  onImageClick: (src: string) => void;
}

export default function GalleryTab({ screenshots, onImageClick }: GalleryTabProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {screenshots.map((img, i) => (
        <div key={i} className="glass-card overflow-hidden cursor-pointer hover:border-[#06B6D4]/30 transition-all" onClick={() => onImageClick(img.src)}>
          <div className="aspect-video bg-[#1E293B] flex items-center justify-center text-[#64748B] text-sm">{img.alt}</div>
        </div>
      ))}
    </div>
  );
}
