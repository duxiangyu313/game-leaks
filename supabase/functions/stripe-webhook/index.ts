import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

/* ── Price ID → 等级/周期 反向映射（metadata 缺失时的兜底） ── */
const PRICE_TO_TIER: Record<string, { tier: string; cycle: string }> = {
  "price_1TeENpQ9NyBUwMBMVfMk8ww9": { tier: "silver", cycle: "monthly" },
  "price_1TeFVKQ9NyBUwMBMrfstRBsO": { tier: "silver", cycle: "yearly" },
  "price_1TeFD3Q9NyBUwMBMKDAdmRvr": { tier: "gold", cycle: "monthly" },
  "price_1TeFVsQ9NyBUwMBMOXo9f5dC": { tier: "gold", cycle: "yearly" },
  "price_1TeFHRQ9NyBUwMBMOYF3290s": { tier: "diamond", cycle: "monthly" },
  "price_1TeFWIQ9NyBUwMBMZFCQ9i8U": { tier: "diamond", cycle: "yearly" },
};

function resolveTierFromPrice(priceId: string | null | undefined) {
  if (!priceId) return null;
  return PRICE_TO_TIER[priceId] || null;
}

function calcEndDate(cycle: string): Date {
  const d = new Date();
  if (cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

/* ── 核心：更新 user_memberships 表 ── */
async function upsertMembership(supabase: ReturnType<typeof createClient>, params: {
  userId: string;
  tier: string;
  cycle: string;
  endDate: Date;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeSessionId?: string;
  amount?: number;
}) {
  const { userId, tier, cycle, endDate, stripeCustomerId, stripeSubscriptionId, stripeSessionId, amount } = params;

  // 1) 将该用户现有 active 记录改为 expired
  await supabase.from("user_memberships")
    .update({ status: "expired", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "active");

  // 2) 插入新的 active 记录
  const { error: insertErr } = await supabase.from("user_memberships").insert({
    user_id: userId,
    tier,
    status: "active",
    billing_cycle: cycle,
    start_date: new Date().toISOString(),
    end_date: endDate.toISOString(),
    auto_renew: true,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_session_id: stripeSessionId || null,
    amount: amount || null,
  });

  if (insertErr) {
    console.error("[user_memberships] insert failed:", JSON.stringify(insertErr));
  } else {
    console.log(`[user_memberships] ${userId} → ${tier} (${cycle}) until ${endDate.toISOString()}`);
  }
}

serve(async (req) => {
  /* ── 1. 函数启动时校验必要环境变量 ── */
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrlEnv = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKeyEnv = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  const missingEnv: string[] = [];
  if (!stripeSecretKey) missingEnv.push("STRIPE_SECRET_KEY");
  if (!webhookSecret) missingEnv.push("STRIPE_WEBHOOK_SECRET");
  if (!supabaseUrlEnv) missingEnv.push("SUPABASE_URL");
  if (!supabaseServiceKeyEnv) missingEnv.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missingEnv.length > 0) {
    console.error(`[webhook] 缺少环境变量: ${missingEnv.join(", ")}`);
    return new Response(
      JSON.stringify({ error: `缺少环境变量: ${missingEnv.join(", ")}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 校验 webhook secret 格式
  if (!webhookSecret!.startsWith("whsec_")) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET 格式错误，应以 whsec_ 开头");
    return new Response(
      JSON.stringify({ error: "Webhook secret 格式错误" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 创建 Stripe 客户端（延迟到 handler 内部，避免模块加载时缺 env var 崩溃）
  const stripe = new Stripe(stripeSecretKey!, {
    apiVersion: "2023-10-16" as any,
    httpClient: Stripe.createFetchHttpClient(),
  });

  /* ── 2. 提取并校验 stripe-signature 请求头 ── */
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.error("[webhook] 缺少 stripe-signature 请求头");
    return new Response(
      JSON.stringify({ error: "缺少 stripe-signature 请求头" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 校验签名格式 (必须是 t=...,v1=... 或 v1=...,t=...)
  if (!signature.includes("t=") || !signature.includes("v1=")) {
    console.error(`[webhook] stripe-signature 格式无效: ${signature.substring(0, 50)}`);
    return new Response(
      JSON.stringify({ error: "stripe-signature 格式无效" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  /* ── 3. 读取原始请求体 ── */
  let body: string;
  try {
    body = await req.text();
    if (!body || body.length === 0) {
      console.error("[webhook] 请求体为空");
      return new Response(
        JSON.stringify({ error: "请求体为空" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (err: any) {
    console.error(`[webhook] 读取请求体失败: ${err.message}`);
    return new Response(
      JSON.stringify({ error: "读取请求体失败" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  /* ── 4. 验证签名 ── */
  let event: Stripe.Event;
  try {
    // tolerance: 600 秒（Stripe 默认 300，加一倍应对网络延迟）
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret!, 600);
    console.log(`[webhook] ✓ 签名验证通过 | type=${event.type} | id=${event.id}`);
  } catch (err: any) {
    console.error(`[webhook] ✗ 签名验证失败: ${err.message}`);
    console.error(`[webhook] signature 前缀: ${signature.substring(0, 80)}`);
    console.error(`[webhook] body 长度: ${body.length}, webhookSecret 前缀: ${webhookSecret!.substring(0, 10)}...`);
    return new Response(
      JSON.stringify({ error: `签名验证失败: ${err.message}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrlEnv!, supabaseServiceKeyEnv!);

  try {
    switch (event.type) {

      /* ═══════════════════════════════════════════
         checkout.session.completed — 首次订阅支付成功
         ═══════════════════════════════════════════ */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // 只处理订阅模式的 session
        if (session.mode !== "subscription") {
          console.log("[webhook] ignoring non-subscription session");
          break;
        }

        // 提取 userId：优先 client_reference_id，其次 subscription_data.metadata
        const userId =
          session.client_reference_id ||
          (session.subscription as any)?.metadata?.userId ||
          session.metadata?.userId;
        if (!userId) {
          console.error("[webhook] missing userId in checkout.session.completed");
          break;
        }

        // 提取 tier / cycle：优先 session.metadata，其次 price_id 反查
        let tier = session.metadata?.tier;
        let cycle = session.metadata?.cycle || "monthly";
        if (!tier) {
          const priceId = session.line_items?.data?.[0]?.price?.id
            || session.metadata?.price_id;
          const deduced = resolveTierFromPrice(priceId);
          if (deduced) {
            tier = deduced.tier;
            cycle = deduced.cycle;
          }
        }
        if (!tier) {
          console.error("[webhook] missing tier in checkout.session.completed");
          break;
        }

        const endDate = calcEndDate(cycle);
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        // A. 更新 profiles 表
        const { error: profileErr } = await supabase.from("profiles").update({
          membership: tier,
          subscription_status: "active",
          subscription_end_date: endDate.toISOString(),
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          updated_at: new Date().toISOString(),
        }).eq("id", userId);

        if (profileErr) {
          console.error("[profiles] update failed:", JSON.stringify(profileErr));
        }

        // B. 插入 payments 记录（幂等：session.id unique）
        const { error: paymentErr } = await supabase.from("payments").upsert({
          user_id: userId,
          stripe_session_id: session.id,
          amount: session.amount_total!, // Stripe 返回分（cents），数据库也存分
          currency: session.currency || "cny",
          tier,
          billing_cycle: cycle,
          status: "completed",
        }, { onConflict: "stripe_session_id" });

        if (paymentErr) {
          console.error("[payments] insert failed:", JSON.stringify(paymentErr));
        }

        // C. 更新 user_memberships 表 ★ 核心修复
        await upsertMembership(supabase, {
          userId,
          tier,
          cycle,
          endDate,
          stripeCustomerId,
          stripeSubscriptionId,
          stripeSessionId: session.id,
          amount: session.amount_total!,
        });

        console.log(`[webhook] checkout.session.completed → ${userId} upgraded to ${tier}`);
        break;
      }

      /* ═══════════════════════════════════════════
         invoice.paid — 续费/首付发票支付成功
         ═══════════════════════════════════════════ */
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        // 忽略非订阅发票
        if (!invoice.subscription) {
          console.log("[webhook] ignoring non-subscription invoice");
          break;
        }

        const customerId = invoice.customer as string;

        // 从 Stripe 拉取 Subscription 对象获取完整 metadata
        let tier: string | undefined;
        let userId: string | undefined;
        let cycle = "monthly";

        try {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          tier = subscription.metadata?.tier;
          userId = subscription.metadata?.userId;

          // 如果 subscription metadata 没有 tier，从 price 反查
          if (!tier) {
            const priceId = invoice.lines?.data?.[0]?.price?.id;
            const deduced = resolveTierFromPrice(priceId);
            if (deduced) {
              tier = deduced.tier;
              cycle = deduced.cycle;
            }
          }

          // 从 price 判断周期
          const priceId = invoice.lines?.data?.[0]?.price?.id;
          if (priceId?.includes("yearly")) cycle = "yearly";
        } catch (subErr: any) {
          console.error("[webhook] failed to retrieve subscription:", subErr.message);
        }

        const newEnd = calcEndDate(cycle);

        // 查找用户
        let existingUserId = userId;

        if (!existingUserId) {
          const { data: profile } = await supabase.from("profiles")
            .select("id,membership")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          if (profile) {
            existingUserId = profile.id;
            // 如果 tier 仍为空，保留现有等级
            if (!tier && profile.membership && profile.membership !== "free") {
              tier = profile.membership;
            }
          }
        }

        if (!existingUserId) {
          console.error("[webhook] cannot find user for invoice.paid, customer:", customerId);
          break;
        }

        // A. 更新 profiles
        const profileUpdates: Record<string, any> = {
          subscription_end_date: newEnd.toISOString(),
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        };

        if (tier) {
          profileUpdates.membership = tier;
          profileUpdates.subscription_status = "active";
        }

        const { error: profileErr } = await supabase.from("profiles")
          .update(profileUpdates).eq("id", existingUserId);

        if (profileErr) {
          console.error("[profiles] invoice.paid update failed:", JSON.stringify(profileErr));
        }

        // B. 插入 payments（对续费账单）
        const { error: paymentErr } = await supabase.from("payments").upsert({
          user_id: existingUserId,
          stripe_session_id: invoice.id, // 用 invoice.id 区分首次的 session.id
          stripe_invoice_id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency || "cny",
          tier: tier || "unknown",
          billing_cycle: cycle,
          status: "completed",
        }, { onConflict: "stripe_session_id" });

        if (paymentErr) {
          console.error("[payments] invoice.paid insert failed:", JSON.stringify(paymentErr));
        }

        // C. 更新 user_memberships
        if (tier) {
          const subscriptionId = invoice.subscription as string;
          await upsertMembership(supabase, {
            userId: existingUserId,
            tier,
            cycle,
            endDate: newEnd,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            amount: invoice.amount_paid,
          });
        }

        console.log(`[webhook] invoice.paid → ${existingUserId} renewed ${tier}`);
        break;
      }

      /* ═══════════════════════════════════════════
         customer.subscription.deleted — 订阅取消
         ═══════════════════════════════════════════ */
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // 更新 profiles
        await supabase.from("profiles").update({
          subscription_status: "canceled",
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        }).eq("stripe_customer_id", customerId);

        // 更新 user_memberships
        await supabase.from("user_memberships")
          .update({
            status: "canceled",
            auto_renew: false,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)
          .eq("status", "active");

        console.log(`[webhook] subscription.deleted → customer ${customerId}`);
        break;
      }

      /* ═══════════════════════════════════════════
         charge.refunded — 退款
         ═══════════════════════════════════════════ */
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          const { data: payment } = await supabase.from("payments")
            .select("id")
            .eq("stripe_session_id", charge.payment_intent as string)
            .maybeSingle();
          if (payment) {
            await supabase.from("payments")
              .update({ status: "refunded" })
              .eq("id", payment.id);
          }
        }
        break;
      }

      default:
        console.log(`[webhook] unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    // 即使处理出错也返回 200，避免 Stripe 无限重试
    console.error(`[webhook] unhandled error in ${event.type}:`, err.message);
    console.error(err.stack);
  }

  // 始终返回 200，Stripe 收到非 200 会重试
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
