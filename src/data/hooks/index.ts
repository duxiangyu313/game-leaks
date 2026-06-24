/**
 * 数据层统一导出
 *
 * 使用方式：
 *   import { useGames, useGameDetail, useLeaks, useProfile } from "@/data/hooks";
 *
 * 每个 hook 返回 { data/result, loading, error } 三元组，
 * 内部统一处理了 PGRST116、null safety、类型映射。
 */

export { useProfile, getUserMembership } from "./useProfile";
export { useGames } from "./useGames";
export { useGameDetail } from "./useGameDetail";
export { useLeaks, useLeakDetail } from "./useLeaks";
export { useArticles, useArticleDetail } from "./useArticles";
export { useSearch } from "./useSearch";
export { useForumPosts, useForumPost } from "./useForum";
export { useSiteStats } from "./useSiteStats";

export type { UserProfile } from "./useProfile";
export type { GameListItem } from "./useGames";
export type { GameDetail } from "./useGameDetail";
export type { LeakListItem } from "./useLeaks";
export type { ArticleListItem } from "./useArticles";
export type { SearchResult } from "./useSearch";
export type { SiteStats } from "./useSiteStats";
