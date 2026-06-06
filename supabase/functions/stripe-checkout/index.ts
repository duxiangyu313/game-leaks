import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16" as any,
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

/* ── Price ID 表 ── */
const PRICES: Record<string, Record<string, string>> = {
  silver:  { monthly: "price_1TeENpQ9NyBUwMBMVfMk8ww9", yearly: "price_1TeFVKQ9NyBUwMBMrfstRBsO" },
  gold:    { monthly: "price_1TeFD3Q9NyBUwMBMKDAdmRvr", yearly: "price_1TeFVsQ9NyBUwMBMOXo9f5dC" },
  diamond: { monthly: "price_1TeFHRQ9NyBUwMBMOYF3290s", yearly: "price_1TeFWIQ9NyBUwMBMZFCQ9i8U" },
};

/* ── 首月优惠券定义（自动创建，无需手动建） ── */
const FIRST_MONTH_COUPONS: Record<string, { id: string; name: string; percent_off: number }> = {
  silver:  { id: "first_month_silver",  name: "白银首月5折", percent_off: 50 },
  gold:    { id: "first_month_gold",    name: "黄金首月5折", percent_off: 50 },
  diamond: { id: "first_month_diamond", name: "钻石首月5折", percent_off: 50 },
};

/**
 * 确保优惠券存在，不存在则自动创建
 */
async function ensureCoupon(couponDef: { id: string; name: string; percent_off: number }) {
  try {
    return await stripe.coupons.retrieve(couponDef.id);
  } catch (err: any) {
    // 404 / resource_missing — 优惠券不存在，创建之
    if (err.statusCode === 404 || err.type === "StripeInvalidRequestError") {
      console.log(`[checkout] 创建优惠券: ${couponDef.id}`);
      return await stripe.coupons.create({
        id: couponDef.id,
        name: couponDef.name,
        duration: "once",
        percent_off: couponDef.percent_off,
      });
    }
    throw err;
  }
}

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
      return new Response(JSON.stringify({ error: "请先登录" }), { status: 401, headers: corsHeaders() });
    }

    const { tier, cycle } = await req.json();
    const priceId = PRICES[tier]?.[cycle];
    if (!priceId) {
      return new Response(JSON.stringify({ error: "无效的会员等级或周期" }), { status: 400, headers: corsHeaders() });
    }

    // 构建 Checkout Session
    const sessionParams: any = {
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { tier, cycle, price_id: priceId },
      subscription_data: { metadata: { tier, userId: user.id } },
      payment_method_types: ["card"],
      success_url: `${req.headers.get("origin") || "https://news.guoyouwenduji.cc"}/member/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") || "https://news.guoyouwenduji.cc"}/member/cancel`,
    };

    // 月付首月优惠：自动创建并应用优惠券
    if (cycle === "monthly" && FIRST_MONTH_COUPONS[tier]) {
      await ensureCoupon(FIRST_MONTH_COUPONS[tier]);
      sessionParams.discounts = [{ coupon: FIRST_MONTH_COUPONS[tier].id }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return new Response(JSON.stringify({ url: session.url }), { headers: corsHeaders() });
  } catch (err: any) {
    console.error("[checkout] 错误:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders() });
  }
});

function corsHeaders() {
  return { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
}
