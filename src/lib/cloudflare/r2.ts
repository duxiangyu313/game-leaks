/**
 * Cloudflare R2 — 文件上传工具
 *
 * 使用方式：服务端通过预签名URL上传，客户端通过 Supabase Edge Function 中转
 * 配置环境变量: R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
 */

export interface R2UploadResult {
  url: string;       // 公开访问 URL
  key: string;       // 文件在桶中的路径
  size: number;
  contentType: string;
}

/**
 * 生成预签名上传 URL (服务端使用)
 */
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const accountId = process.env.R2_ACCOUNT_ID!;
  const bucketName = process.env.R2_BUCKET_NAME!;
  const publicUrl = process.env.R2_PUBLIC_URL!;

  const key = `uploads/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  // 调用 Cloudflare R2 API 生成预签名 URL
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}/upload-url`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.R2_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customMetadata: { contentType } }),
    }
  );

  const data = await response.json();
  return {
    uploadUrl: data.result?.uploadURL || "",
    publicUrl: `${publicUrl}/${key}`,
    key,
  };
}

/**
 * 客户端上传文件到 R2
 */
export async function uploadToR2(
  file: File,
  onProgress?: (pct: number) => void
): Promise<R2UploadResult> {
  // 从 Supabase 获取当前 session token
  const { supabase } = await import("../supabase/client");
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  // 通过 Supabase Edge Function 获取预签名 URL（static export 无 API Routes）
  const res = await fetch(
    "https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1/upload-presign",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ fileName: file.name, contentType: file.type }),
    }
  );

  if (!res.ok) throw new Error("获取上传凭证失败");
  const { uploadUrl, publicUrl, key } = await res.json();

  // 直接上传到 R2
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`上传失败: ${xhr.status}`));
    });
    xhr.addEventListener("error", () => reject(new Error("网络错误")));
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });

  return { url: publicUrl, key, size: file.size, contentType: file.type };
}
