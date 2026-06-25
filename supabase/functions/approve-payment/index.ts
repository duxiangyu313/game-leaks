import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { confirmation_id } = await req.json();
    if (!confirmation_id) throw new Error("缺少 confirmation_id");

    // 获取确认记录
    const { data: conf, error: fetchErr } = await supabase
      .from("payment_confirmations")
      .select("*")
      .eq("id", confirmation_id)
      .single();

    if (fetchErr || !conf) throw new Error("确认记录不存在");
    if (conf.status !== "pending") throw new Error("该记录已处理");

    // 通过 auth.users 查找用户
    const { data: authUser, error: authErr } = await supabase.auth.admin.listUsers();
    if (authErr) throw new Error("无法查询用户列表");

    const matchedUser = authUser.users.find(
      (u: any) => u.email?.toLowerCase() === conf.user_email.toLowerCase()
    );
    if (!matchedUser) throw new Error(`未找到用户: ${conf.user_email}`);

    const userId = matchedUser.id;

    // 计算到期日
    const endDate = new Date();
    if (conf.cycle === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);
    else endDate.setMonth(endDate.getMonth() + 1);

    // 更新 profiles
    const { error: updateErr } = await supabase.from("profiles").update({
      membership: conf.tier,
      subscription_status: "active",
      subscription_end_date: endDate.toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", userId);

    if (updateErr) throw new Error(`升级失败: ${updateErr.message}`);

    // 更新确认记录
    await supabase.from("payment_confirmations").update({
      status: "approved",
      approved_at: new Date().toISOString(),
    }).eq("id", confirmation_id);

    return new Response(JSON.stringify({ success: true, message: `${conf.user_email} 已升级为 ${conf.tier}`, user_id: userId }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
