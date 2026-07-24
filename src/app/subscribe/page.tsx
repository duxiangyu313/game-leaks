import type { Metadata } from "next";
import EmailSubscribe from "@/components/EmailSubscribe";

export const metadata: Metadata = {
  title: "邮件订阅",
  description: "订阅国游爆料邮件通知，国产3A最新动态第一时间送达。",
  alternates: { canonical: "/subscribe/" },
};

export default function SubscribePage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <EmailSubscribe />
    </div>
  );
}
