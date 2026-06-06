import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // 鉴权
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "请先登录" }), {
        status: 401,
        headers: corsHeaders(),
      });
    }

    const { fileName, contentType } = await req.json();
    if (!fileName || !contentType) {
      return new Response(JSON.stringify({ error: "缺少参数" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const accountId = Deno.env.get("R2_ACCOUNT_ID")!;
    const bucketName = Deno.env.get("R2_BUCKET_NAME")!;
    const publicUrl = Deno.env.get("R2_PUBLIC_URL")!;
    const apiToken = Deno.env.get("R2_API_TOKEN")!;

    const key = `uploads/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}/upload-url`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    if (!data.success) {
      return new Response(JSON.stringify({ error: "获取上传凭证失败" }), {
        status: 500,
        headers: corsHeaders(),
      });
    }

    return new Response(
      JSON.stringify({
        uploadUrl: data.result.uploadURL,
        publicUrl: `${publicUrl}/${key}`,
        key,
      }),
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
});

function corsHeaders() {
  return { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
}
