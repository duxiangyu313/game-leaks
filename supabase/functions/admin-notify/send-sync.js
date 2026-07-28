const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "sync-email.html"), "utf-8");

const payload = {
  secret: "admin-notify-wh-20260718",
  type: "custom",
  title: "[国游温度计] 游戏进度同步建议 - 2026-07-26",
  body: "共4条更新建议，涉及影之刃零、昭和米国物语、归唐3款游戏",
  custom_html: html,
};

fetch("https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1/admin-notify", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bXB4ZnhieHh5bGppa2FpenNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNzM1NDUsImV4cCI6MjA5NTk0OTU0NX0.MnnnjS_kkxL6fdS3S0gXSrQ0v3rEUikehmr08HmHJkU",
  },
  body: JSON.stringify(payload),
})
  .then((r) => r.json())
  .then((d) => console.log(JSON.stringify(d)))
  .catch((e) => console.error(e.message));
