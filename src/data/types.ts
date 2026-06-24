/**
 * 数据层统一返回类型
 * 所有 hooks 返回 { data, error, loading } 三元组
 */
export interface QueryResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** 分页结果 */
export interface PaginatedResult<T> extends QueryResult<T[]> {
  count: number;
  page: number;
  pageSize: number;
}

/**
 * 安全调用 .single() — 将 PGRST116（0 行）转为 null，其他错误抛出
 */
export function safeSingle<T>(result: { data: T | null; error: unknown }): { data: T | null; error: string | null } {
  if (result.error) {
    // PGRST116: 查询返回 0 行 — 这不是错误，只是没数据
    const err = result.error as { code?: string; message?: string };
    if (err.code === "PGRST116") {
      return { data: null, error: null };
    }
    return { data: null, error: err.message || "查询失败" };
  }
  return { data: result.data, error: null };
}

/**
 * 安全执行 Supabase 查询 — 统一 try/catch，返回 QueryResult
 */
export async function safeQuery<T>(
  promise: PromiseLike<{ data: T | null; error: unknown }>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await promise;
    if (result.error) {
      const err = result.error as { code?: string; message?: string };
      return { data: null, error: err.message || "查询失败" };
    }
    return { data: result.data, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "未知错误" };
  }
}
