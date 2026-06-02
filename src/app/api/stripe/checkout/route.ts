/**
 * Stripe Checkout API
 * POST /api/stripe/checkout — 创建支付会话
 * 注意: 静态导出时不可用，需部署到 Vercel 或使用 Supabase Edge Function
 */
import { NextRequest, NextResponse } from "next/server";
import { stripe, MEMBERSHIP_PRICES } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { tier, cycle, userId, email } = await req.json();

    if (!tier || !cycle || !userId) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    const prices = MEMBERSHIP_PRICES[tier as keyof typeof MEMBERSHIP_PRICES];
    if (!prices) {
      return NextResponse.json({ error: "无效的会员等级" }, { status: 400 });
    }

    const priceId = prices[cycle as keyof typeof prices];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      client_reference_id: userId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { tier, cycle, price_id: priceId },
      subscription_data: {
        metadata: { tier, userId },
      },
      payment_method_types: ["card", "alipay", "wechat_pay"],
      success_url: `${req.nextUrl.origin}/member/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/member/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
