/**
 * Cloudflare R2 预签名上传 API
 * POST /api/upload/presign — 获取上传凭证
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { fileName, contentType } = await req.json();
    if (!fileName || !contentType) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    const accountId = process.env.R2_ACCOUNT_ID!;
    const bucketName = process.env.R2_BUCKET_NAME!;
    const publicUrl = process.env.R2_PUBLIC_URL!;
    const apiToken = process.env.R2_API_TOKEN!;

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
      return NextResponse.json({ error: "获取上传凭证失败" }, { status: 500 });
    }

    return NextResponse.json({
      uploadUrl: data.result.uploadURL,
      publicUrl: `${publicUrl}/${key}`,
      key,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
