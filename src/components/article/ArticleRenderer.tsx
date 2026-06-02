"use client";

import React, { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { ExternalLink } from "lucide-react";
import ImageWithWatermark from "./ImageWithWatermark";
import VideoEmbed from "./VideoEmbed";
import { slugify, extractImages } from "@/lib/article-utils";
import { preprocessMarkdown } from "@/lib/markdown";

interface Props {
  content: string;
  canRead: boolean;
  onImageClick?: (src: string, index: number) => void;
}

/**
 * 富文本 Markdown 渲染器
 * react-markdown + remark-gfm + rehype-raw + 自定义组件映射
 */
export default function ArticleRenderer({ content, canRead, onImageClick }: Props) {
  const [allImages, setAllImages] = useState<string[]>([]);
  const [spoilerRevealed, setSpoilerRevealed] = useState<Record<number, boolean>>({});

  // 预处理内容
  const processedContent = preprocessMarkdown(content || "");

  // 收集所有图片
  useState(() => {
    setAllImages(extractImages(content || ""));
  });

  const handleImageClick = useCallback(
    (src: string) => {
      if (!onImageClick) return;
      const idx = allImages.indexOf(src);
      onImageClick(src, idx >= 0 ? idx : 0);
    },
    [allImages, onImageClick]
  );

  const toggleSpoiler = useCallback((idx: number) => {
    setSpoilerRevealed((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  return (
    <div className="article-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // 标题
          h2: ({ children, ...props }) => {
            const text = extractTextContent(children);
            const id = slugify(text);
            return (
              <h2 id={id} {...props}>
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = extractTextContent(children);
            const id = slugify(text);
            return (
              <h3 id={id} {...props}>
                {children}
              </h3>
            );
          },

          // 图片
          img: ({ src, alt }) => {
            if (!src) return null;
            const srcStr = src as string;
            return (
              <ImageWithWatermark
                src={srcStr}
                alt={alt || ""}
                onClick={() => handleImageClick(srcStr)}
              />
            );
          },

          // 链接
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
              <ExternalLink className="w-3 h-3 inline ml-0.5" />
            </a>
          ),

          // 引用块
          blockquote: ({ children }) => (
            <blockquote>{children}</blockquote>
          ),

          // 代码
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const codeStr = String(children).replace(/\n$/, "");

            // 行内代码
            if (!match && !className) {
              return <code {...props}>{children}</code>;
            }

            // 代码块
            return (
              <SyntaxHighlighter
                style={atomOneDark}
                language={match ? match[1] : "text"}
                PreTag="div"
                customStyle={{
                  background: "#1A2332",
                  borderRadius: "12px",
                  border: "1px solid rgba(30,41,59,0.8)",
                  padding: "16px",
                  fontSize: "14px",
                }}
              >
                {codeStr}
              </SyntaxHighlighter>
            );
          },

          // 段落
          p: ({ children }) => {
            // 检测自定义元素：spoiler-text
            return <p className="paragraph-hover-zone">{children}</p>;
          },

          // 表格
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table>{children}</table>
            </div>
          ),

          // 列表
          ul: ({ children }) => <ul>{children}</ul>,
          ol: ({ children }) => <ol>{children}</ol>,

          // 水平线
          hr: () => <hr />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

/** 从 React children 中提取纯文本 */
function extractTextContent(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractTextContent).join("");
  if (React.isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = children.props as any;
    if (props?.children) return extractTextContent(props.children);
  }
  return "";
}
