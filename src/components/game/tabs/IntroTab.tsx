interface IntroTabProps {
  game: any;
}

export default function IntroTab({ game }: IntroTabProps) {
  return (
    <div className="text-[#c4bfb6] leading-relaxed text-[17px] space-y-4 max-w-none">
      {game.description?.split("\n").map((line: string, i: number) => {
        if (line.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-[#F1F5F9] mt-10 mb-4 pl-3 border-l-3 border-[#06B6D4]">{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={i} className="text-xl font-semibold text-[#F1F5F9] mt-8 mb-3">{line.slice(4)}</h3>;
        if (line.startsWith("- **")) {
          const [label, ...rest] = line.slice(2).split("：");
          return <div key={i} className="flex gap-2"><span className="text-[#F1F5F9] font-semibold shrink-0">{label.replace(/\*\*/g, "")}：</span><span className="text-[#94A3B8]">{rest.join("：")}</span></div>;
        }
        if (line.startsWith("- ")) return <li key={i} className="ml-4 text-[#94A3B8]">{line.slice(2)}</li>;
        if (line.trim() === "") return <br key={i} />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}
