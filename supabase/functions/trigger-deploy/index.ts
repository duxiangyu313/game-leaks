// Supabase Edge Function: trigger-deploy
// 触发 GitHub Actions 自动构建+部署
// 部署: supabase functions deploy trigger-deploy
// 密钥: supabase secrets set GITHUB_TOKEN=ghp_xxxx

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req: Request) => {
  // 仅允许 POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
  if (!GITHUB_TOKEN) {
    return new Response(JSON.stringify({ error: "GITHUB_TOKEN not configured" }), { status: 500 });
  }

  try {
    const res = await fetch(
      "https://api.github.com/repos/duxiangyu313/game-leaks/actions/workflows/deploy.yml/dispatches",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ ref: "main" }),
      }
    );

    if (res.ok) {
      return new Response(JSON.stringify({ ok: true, message: "部署已触发，约2分钟后生效" }), { status: 200 });
    } else {
      const err = await res.text();
      return new Response(JSON.stringify({ error: `GitHub API 错误: ${err}` }), { status: 500 });
    }
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "未知错误" }), { status: 500 });
  }
});
