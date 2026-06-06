"use client";

import React, { useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { ExternalLink } from "lucide-react";
import ImageWithWatermark from "./ImageWithWatermark";
import InlineChart from "./InlineChart";
import { slugify, extractImages } from "@/lib/article-utils";
import { preprocessMarkdown } from "@/lib/markdown";

interface Props {
  content: string;
  canRead: boolean;
  onImageClick?: (src: string, index: number) => void;
}

interface ChartBlock {
  type: "bar" | "timeline" | "comparison";
  title?: string;
  data: { label: string; value: number; color?: string; max?: number }[];
}

function parseChartBlock(body: string): ChartBlock | null {
  // body: "bar title: xxx | a: 1 | b: 2"
  const parts = body.trim().split(/\s*\|\s*/);
  const first = parts[0].trim();
  const spaceIdx = first.indexOf(" ");
  let type: string;
  let restParts: string[];

  if (spaceIdx > 0) {
    type = first.substring(0, spaceIdx);
    // check if "title:" is part of first segment
    const afterType = first.substring(spaceIdx + 1).trim();
    if (afterType) restParts = [afterType, ...parts.slice(1)];
    else restParts = parts.slice(1);
  } else {
    type = first;
    restParts = parts.slice(1);
  }

  if (!["bar", "timeline", "comparison"].includes(type)) return null;

  const chartType = type as ChartBlock["type"];
  let title: string | undefined;
  const data: ChartBlock["data"] = [];

  for (const seg of restParts) {
    const s = seg.trim();
    if (!s) continue;
    if (s.startsWith("title:")) {
      title = s.replace("title:", "").trim();
    } else if (chartType === "comparison" && s.includes(";")) {
      const [label, v, m] = s.split(";");
      data.push({ label: label.trim(), value: Number(v) || 0, max: Number(m) || undefined });
    } else if (s.includes(":")) {
      const idx = s.indexOf(":");
      const label = s.substring(0, idx).trim();
      const v = s.substring(idx + 1).trim();
      data.push({ label, value: Number(v) || 0 });
    }
  }

  if (data.length === 0) return null;
  return { type: chartType, title, data };
}

export default function ArticleRenderer({ content, onImageClick }: Props) {
  const allImages = useMemo(() => extractImages(content || ""), [content]);

  // 把 :::chart 块从 markdown 中拆出来
  const blocks = useMemo(() => {
    const raw = content || "";
    const result: (string | ChartBlock)[] = [];
    const regex = /:::chart\s+([\s\S]*?):::/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(raw)) !== null) {
      // text before this chart block
      if (match.index > lastIdx) {
        result.push(raw.substring(lastIdx, match.index));
      }
      const parsed = parseChartBlock(match[1]);
      if (parsed) result.push(parsed);
      lastIdx = match.index + match[0].length;
    }
    // remaining text
    if (lastIdx < raw.length) {
      result.push(raw.substring(lastIdx));
    }
    return result.length > 0 ? result : [raw];
  }, [content]);

  const handleImageClick = useCallback(
    (src: string) => {
      if (!onImageClick) return;
      const idx = allImages.indexOf(src);
      onImageClick(src, idx >= 0 ? idx : 0);
    },
    [allImages, onImageClick]
  );

  const mdComponents = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h2: ({ children, ...props }: any) => {
      const text = extractTextContent(children);
      return <h2 id={slugify(text)} {...props}>{children}</h2>;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h3: ({ children, ...props }: any) => {
      const text = extractTextContent(children);
      return <h3 id={slugify(text)} {...props}>{children}</h3>;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    img: ({ src, alt }: any) => {
      if (!src) return null;
      return <ImageWithWatermark src={src as string} alt={alt || ""} onClick={() => handleImageClick(src as string)} />;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    a: ({ href, children }: any) => (
      <a href={href} target="_blank" rel="noopener noreferrer">{children}<ExternalLink className="w-3 h-3 inline ml-0.5" /></a>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blockquote: ({ children }: any) => <blockquote>{children}</blockquote>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      if (!match && !className) return <code {...props}>{children}</code>;
      const codeStr = String(children).replace(/\n$/, "");
      return (
        <SyntaxHighlighter style={atomOneDark} language={match?.[1] || "text"} PreTag="div"
          customStyle={{ background: "#1A2332", borderRadius: "12px", border: "1px solid rgba(30,41,59,0.8)", padding: "16px", fontSize: "14px" }}>
          {codeStr}
        </SyntaxHighlighter>
      );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p: ({ children }: any) => <p className="paragraph-hover-zone">{children}</p>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table: ({ children }: any) => <div className="overflow-x-auto"><table>{children}</table></div>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ul: ({ children }: any) => <ul>{children}</ul>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ol: ({ children }: any) => <ol>{children}</ol>,
    hr: () => <hr />,
  };

  return (
    <div className="article-content">
      {blocks.map((block, i) => {
        if (typeof block === "string") {
          const processed = preprocessMarkdown(block);
          return (
            <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={mdComponents}>
              {processed}
            </ReactMarkdown>
          );
        }
        return <InlineChart key={i} type={block.type} title={block.title} data={block.data} />;
      })}
    </div>
  );
}

function extractTextContent(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractTextContent).join("");
  if (React.isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = (children.props as any);
    if (props?.children) return extractTextContent(props.children);
  }
  return "";
}
