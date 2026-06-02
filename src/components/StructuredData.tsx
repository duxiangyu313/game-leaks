/**
 * JSON-LD 结构化数据组件
 * 帮助搜索引擎理解网站内容，提升搜索排名
 */

export function WebsiteSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "国游爆料",
    url: "https://news.guoyouwenduji.cc",
    description: "国产3A游戏最新爆料、深度解析、游戏评测",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://news.guoyouwenduji.cc/games/?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export function OrganizationSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "国游爆料",
    url: "https://news.guoyouwenduji.cc",
    sameAs: [
      "https://space.bilibili.com/3546857156380947",
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export function ArticleSchema({ title, description, datePublished, author, url }: {
  title: string; description: string; datePublished: string; author?: string; url?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    datePublished: datePublished,
    author: { "@type": "Person", name: author || "国游爆料" },
    publisher: { "@type": "Organization", name: "国游爆料" },
    url: url || "https://news.guoyouwenduji.cc",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
