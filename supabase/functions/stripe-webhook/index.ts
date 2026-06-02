/**
 * Stripe Webhook — Supabase Edge Function
 * 处理 Stripe 支付事件，自动更新会员状态
 *
 * 部署: supabase functions deploy stripe-webhook
 * 环境变量: supabase secrets set STRIPE_SECRET_KEY=sk_xxx STRIPE_WEBHOOK_SECRET=whsec_xxx
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16" as any,
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const signature = req.headers.get("stripe-signature")!;
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  switch (event.type) {
    // ── 支付成功 → 升级会员 ──
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const priceId = session.metadata?.price_id;
      const tier = session.metadata?.tier;
      const cycle = session.metadata?.cycle;

      if (!userId || !tier) break;

      const endDate = new Date();
      if (cycle === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);
      else endDate.setMonth(endDate.getMonth() + 1);

      // 更新用户会员等级
      await supabase.from("profiles").upsert({
        id: userId,
        membership: tier,
        subscription_status: "active",
        subscription_end_date: endDate.toISOString(),
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        updated_at: new Date().toISOString(),
      });

      // 记录支付
      await supabase.from("payments").insert({
        user_id: userId,
        stripe_session_id: session.id,
        amount: session.amount_total!,
        currency: session.currency || "cny",
        tier,
        billing_cycle: cycle || "monthly",
        status: "completed",
      });

      // 发送欢迎邮件 (可选: 集成 Resend 等邮件服务)
      break;
    }

    // ── 订阅续费成功 ──
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profiles) {
        const newEnd = new Date();
        newEnd.setMonth(newEnd.getMonth() + 1);
        await supabase.from("profiles")
          .update({ subscription_end_date: newEnd.toISOString() })
          .eq("id", profiles.id);
      }
      break;
    }

    // ── 订阅取消 ──
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase.from("profiles")
        .update({
          subscription_status: "canceled",
          stripe_subscription_id: null,
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    // ── 退款处理 ──
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      if (charge.payment_intent) {
        const { data: payment } = await supabase
          .from("payments")
          .select("id, user_id")
          .eq("stripe_session_id", charge.payment_intent as string)
          .single();

        if (payment) {
          await supabase.from("payments")
            .update({ status: "refunded" })
            .eq("id", payment.id);
        }
      }
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
