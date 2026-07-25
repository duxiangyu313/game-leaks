import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** 客户端 Supabase 实例 — 用于浏览器端操作，完整数据库类型提示 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/** 无类型约束的查询 — 用于新增表（尚未收入 Database 类型）如 cj2026_* */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = supabase;
