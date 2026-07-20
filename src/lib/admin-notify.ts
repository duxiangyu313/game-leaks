/**
 * 管理员通知 — 前端直调 Edge Function（不依赖 pg_net 触发器）
 */
const EDGE_URL = 'https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1/admin-notify';
const SECRET = 'admin-notify-wh-20260718';

export async function notifyAdmin(type: 'user_signup' | 'user_login' | 'forum_post' | 'ugc_submission', title: string, body: string, link?: string) {
  try {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) return;
    await fetch(EDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + anonKey },
      body: JSON.stringify({ secret: SECRET, type, title, body, timestamp: new Date().toISOString(), link: link || 'https://news.guoyouwenduji.cc/admin' }),
    });
  } catch {}
}
