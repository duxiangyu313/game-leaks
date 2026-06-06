/**
 * Markdown 处理工具
 * 预处理、一键排版、模板结构生成
 */

import type { TemplateType } from "@/types";

/** Markdown 预处理：转化自定义语法为标准 Markdown */
export function preprocessMarkdown(content: string): string {
  if (!content) return "";

  let processed = content;

  // :::callout{type="info|warning|success|danger"} ... ::: → 标准引用块+标记
  processed = processed.replace(
    /:::callout\{type="(\w+)"\}\s*\n([\s\S]*?):::/g,
    (_: string, type: string, body: string) => {
      const emoji: Record<string, string> = {
        info: "ℹ️",
        warning: "⚠️",
        success: "✅",
        danger: "🚫",
      };
      return `> ${emoji[type] || "📌"} **${type.toUpperCase()}**\n>\n> ${body.trim().replace(/\n/g, "\n> ")}`;
    }
  );

  // ||spoiler text|| → 点击揭示
  processed = processed.replace(
    /\|\|(.+?)\|\|/g,
    '<span class="spoiler-text cursor-pointer hover:bg-[#F59E0B]/10 px-1 rounded" onclick="this.classList.toggle(\'spoiler-revealed\')">$1</span>'
  );

  // :::chart 块由 ArticleRenderer 直接在 React 端解析渲染（InlineChart），
  // 这里不做预处理，保留原始 :::chart 语法供 ArticleRenderer 的 block splitter 使用
  return processed;
}

/** 根据模板类型生成默认 Markdown 结构 */
export function generateTemplateMarkdown(templateType: TemplateType): string {
  const templates: Record<TemplateType, string> = {
    leak: `## 核心要点
<!-- 用2-3句话概括这条爆料的核心信息 -->

## 正文
<!-- 详细展开爆料内容 -->

## 可信度评估
- **消息来源**:
- **交叉验证**:
- **可信度评级**: ★★★☆☆

## 关键总结
<!-- 3-5条核心takeaway -->
`,
    review: `## 游戏速览
- **开发商**:
- **平台**:
- **发售日期**:
- **评分**: /10

## 正文
<!-- 评测详细内容 -->

## 优缺点
### 优点
-

### 缺点
-

## 总评
<!-- 一句话总结推荐意见 -->
`,
    analysis: `## 摘要
<!-- 一句话核心观点 -->

## 正文
<!-- 详细分析 -->

## 数据与事实
<!-- 支撑数据 -->

## 结论与展望
`,
    news: `## TL;DR
<!-- 一句话速览 -->

## 正文
<!-- 新闻详细内容 -->

## 背景
<!-- 相关背景信息 -->
`,
    standard: `## 正文
<!-- 开始输入内容 -->
`,
  };

  return templates[templateType] || templates.standard;
}

/** 一键格式化：规则式将纯文本转为结构化 Markdown */
export function formatOneClick(content: string, templateType: TemplateType): string {
  if (!content.trim()) return generateTemplateMarkdown(templateType);

  let formatted = content;

  // 1. 把全大写英文短行（无中文）识别为标题
  formatted = formatted.replace(/^([A-Z][A-Z\s]{3,40})$/gm, "## $1");

  // 2. 把 "一二三四五六七八九十、"/"1."/"一）" 开头的行为列表
  formatted = formatted.replace(
    /^([一二三四五六七八九十]、|\d+[.、])\s*(.+)$/gm,
    "- $2"
  );

  // 3. 把连续3个以上纯中文短句（无标点的行）合并为段落
  const lines = formatted.split("\n");
  const result: string[] = [];
  let buffer: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // 空行 → 刷新缓冲区
    if (!trimmed) {
      if (buffer.length > 0) {
        result.push(buffer.join(""), "");
        buffer = [];
      } else {
        result.push("");
      }
      continue;
    }

    // 标题/列表/引用行 → 刷新缓冲区 + 保留原行
    if (/^(#{1,6}\s|[-*+]\s|\d+\.\s|>|\|)/.test(trimmed)) {
      if (buffer.length > 0) {
        result.push(buffer.join(""));
        buffer = [];
      }
      result.push(trimmed);
      continue;
    }

    // 普通文本 → 进缓冲区
    buffer.push(trimmed);
  }

  // 冲刷剩余
  if (buffer.length > 0) {
    result.push(buffer.join(""));
  }

  formatted = result.join("\n");

  // 4. 如果没有 h2 标题，根据模板插入默认结构
  if (!formatted.includes("## ") && templateType !== "standard") {
    const template = generateTemplateMarkdown(templateType);
    // 将原内容塞入正文区域
    formatted = template.replace(
      /#{2,3}\s正文[\s\S]*?(?=#{2,3}|$)/,
      (match) => match.trim() + "\n\n" + formatted
    );
  }

  // 5. 把 # 一级标题转为 ## （一级留给页面标题）
  formatted = formatted.replace(/^#\s(?!##)/gm, "## ");

  return formatted.trim();
}

/** 获取分类对应的默认模板类型 */
export function getDefaultTemplateType(category: string): TemplateType {
  const map: Record<string, TemplateType> = {
    leak: "leak",
    review: "review",
    analysis: "analysis",
    preview: "review",
    interview: "standard",
    opinion: "standard",
    news: "news",
    video: "standard",
  };
  return map[category] || "standard";
}
