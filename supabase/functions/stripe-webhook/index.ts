import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const PRICE_TO_TIER: Record<string, { tier: string; cycle: string }> = {
  "price_1ThRsgQ9NyBUwMBMt0b5WkXA": { tier: "gold", cycle: "monthly" },
  "price_1ThRtDQ9NyBUwMBMSpWF4J6Y": { tier: "gold", cycle: "yearly" },
  "price_1ThRtcQ9NyBUwMBMY5BWeUnh": { tier: "diamond", cycle: "monthly" },
  "price_1ThRtrQ9NyBUwMBMY3VpweNz": { tier: "diamond", cycle: "yearly" },
  // legacy
  "price_1TeENpQ9NyBUwMBMVfMk8ww9": { tier: "gold", cycle: "monthly" },
  "price_1TeFVKQ9NyBUwMBMrfstRBsO": { tier: "gold", cycle: "yearly" },
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

async function upsertMembership(supabase: ReturnType<typeof createClient>, params: {
  userId: string; tier: string; cycle: string; endDate: Date;
  stripeCustomerId: string; stripeSubscriptionId: string; stripeSessionId?: string; amount?: number;
}) {
  const { userId, tier, cycle, endDate, stripeCustomerId, stripeSubscriptionId, stripeSessionId, amount } = params;
  await supabase.from("user_memberships").update({ status: "expired", updated_at: new Date().toISOString() })
    .eq("user_id", userId).eq("status", "active");
  await supabase.from("user_memberships").insert({
    user_id: userId, tier, status: "active", billing_cycle: cycle,
    start_date: new Date().toISOString(), end_date: endDate.toISOString(), auto_renew: true,
    stripe_customer_id: stripeCustomerId, stripe_subscription_id: stripeSubscriptionId,
    stripe_session_id: stripeSessionId || null, amount: amount || null,
  });
  await supabase.from("profiles").update({
    membership: tier, subscription_status: "active",
    subscription_end_date: endDate.toISOString(),
    stripe_customer_id: stripeCustomerId, stripe_subscription_id: stripeSubscriptionId,
    updated_at: new Date().toISOString(),
  }).eq("id", userId);
}

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" as any, httpClient: Stripe.createFetchHttpClient() });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const sig = req.headers.get("stripe-signature")!;
  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, sig, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
  } catch (err: any) {
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const priceId = session.metadata?.price_id || session.line_items?.data?.[0]?.price?.id;
        const resolved = resolveTierFromPrice(priceId) || { tier: session.metadata?.tier || "gold", cycle: session.metadata?.cycle || "monthly" };
        const endDate = calcEndDate(resolved.cycle);
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        if (userId) await upsertMembership(supabase, { userId, tier: resolved.tier, cycle: resolved.cycle, endDate, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId, stripeSessionId: session.id, amount: session.amount_total || undefined });
        const amt = session.amount_total || 0;
        await supabase.from("payments").insert({ user_id: userId, stripe_session_id: session.id, amount: amt, currency: session.currency || "cny", tier: resolved.tier, billing_cycle: resolved.cycle, status: "completed", payment_method: "stripe" });
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        if (subId) {
          const { data: memb } = await supabase.from("user_memberships").select("user_id, tier, billing_cycle").eq("stripe_subscription_id", subId).eq("status", "active").single();
          if (memb) {
            const endDate = calcEndDate(memb.billing_cycle);
            await supabase.from("user_memberships").update({ end_date: endDate.toISOString(), updated_at: new Date().toISOString() }).eq("stripe_subscription_id", subId).eq("status", "active");
            await supabase.from("profiles").update({ subscription_end_date: endDate.toISOString(), updated_at: new Date().toISOString() }).eq("id", memb.user_id);
            await supabase.from("payments").insert({ user_id: memb.user_id, stripe_invoice_id: invoice.id, amount: invoice.amount_paid, currency: invoice.currency || "cny", tier: memb.tier, billing_cycle: memb.billing_cycle, status: "completed", payment_method: "stripe" });
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const subId = sub.id;
        await supabase.from("user_memberships").update({ status: "canceled", updated_at: new Date().toISOString() }).eq("stripe_subscription_id", subId).eq("status", "active");
        const { data: memb } = await supabase.from("user_memberships").select("user_id").eq("stripe_subscription_id", subId).eq("status", "canceled").order("updated_at", { ascending: false }).limit(1).single();
        if (memb) await supabase.from("profiles").update({ membership: "free", subscription_status: "inactive", updated_at: new Date().toISOString() }).eq("id", memb.user_id);
        break;
      }
    }
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    console.error("[webhook]", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
