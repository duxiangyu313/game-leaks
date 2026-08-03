import type { Metadata } from "next";
import EmailSubscribe from "@/components/EmailSubscribe";

export const metadata: Metadata = {
  title: "邮件订阅 - 国游爆料国产3A游戏黑神话悟空/影之刃零最新动态推送",
  description: "立即订阅国游爆料邮件通知，第一时间将黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A大作的最新爆料、发售日提醒、测试资格申请通道、官方直播预告、开发者访谈、行业深度观察以及玩家社区热门讨论送到你的邮箱，让你不再错过任何一条关于国产游戏的重要消息。",
  alternates: { canonical: "/subscribe/" },
};

export default function SubscribePage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <EmailSubscribe />
    </div>
  );
}
