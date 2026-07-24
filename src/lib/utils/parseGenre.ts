/**
 * 解析游戏类型字符串。
 * 处理 PostgreSQL 数组字符串格式（如 "{动作RPG,魂系}"）和普通逗号分隔格式。
 */
export function parseGenre(genre?: string | null): string[] {
  if (!genre || !genre.trim()) return [];

  // 去除 PostgreSQL 数组格式的花括号
  const cleaned = genre.replace(/^\{|\}$/g, "");

  return cleaned
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
