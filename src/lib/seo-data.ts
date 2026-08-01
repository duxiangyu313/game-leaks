/**
 * SEO 数据加载器
 * 从构建时生成的 public/seo-data.json 读取 SEO 数据
 * 在客户端 hydration 前使用，确保搜索引擎爬虫能读取到正确的 meta 标签
 */

export interface ArticleSEOData {
  id: string;
  title: string;
  description: string;
  keywords: string;
  category: string;
  wordCount: number;
  readTime: number;
  excerpt: string;
  coverImage: string | null;
  publishedAt: string | null;
  authorName: string;
  gameName: string | null;
  jsonLd: Record<string, unknown>;
}

export interface GameSEOData {
  id: string;
  title: string;
  description: string;
  keywords: string;
  jsonLd: Record<string, unknown>;
}

interface SEOCache {
  articles: Record<string, ArticleSEOData>;
  games: Record<string, GameSEOData>;
  generatedAt: string;
}

let cache: SEOCache | null = null;

export async function loadSEOData(): Promise<SEOCache> {
  if (cache) return cache;
  try {
    const res = await fetch("/seo-data.json", { cache: "force-cache" });
    if (!res.ok) throw new Error("Failed to load SEO data");
    cache = await res.json();
    return cache;
  } catch {
    return { articles: {}, games: {}, generatedAt: "" };
  }
}

export function getArticleSEO(id: string): ArticleSEOData | null {
  return cache?.articles?.[id] || null;
}

export function getGameSEO(id: string): GameSEOData | null {
  return cache?.games?.[id] || null;
}

export function applySEO(seo: {
  title?: string;
  description?: string;
  keywords?: string;
  jsonLd?: Record<string, unknown>;
  url?: string;
  image?: string;
}) {
  if (seo.title) document.title = seo.title;

  if (seo.description) {
    setMetaTag("description", seo.description);
    setMetaTag("og:description", seo.description, "property");
  }
  if (seo.title) {
    setMetaTag("og:title", seo.title, "property");
  }
  if (seo.keywords) {
    setMetaTag("keywords", seo.keywords);
  }
  if (seo.url) {
    setMetaTag("og:url", seo.url, "property");
    setLinkTag("canonical", seo.url);
  }
  if (seo.image) {
    setMetaTag("og:image", seo.image, "property");
  }

  if (seo.jsonLd) {
    const existing = document.getElementById("seo-jsonld");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "seo-jsonld";
    script.textContent = JSON.stringify(seo.jsonLd);
    document.head.appendChild(script);
  }
}

function setMetaTag(name: string, content: string, attr: "name" | "property" = "name") {
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (tag) {
    tag.setAttribute("content", content);
  } else {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    tag.setAttribute("content", content);
    document.head.appendChild(tag);
  }
}

function setLinkTag(rel: string, href: string) {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (tag) {
    tag.setAttribute("href", href);
  } else {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    tag.setAttribute("href", href);
    document.head.appendChild(tag);
  }
}
