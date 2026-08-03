import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "激活码领取 - 国游爆料国产3A游戏测试资格/福利兑换/会员专属",
  description: "国游爆料会员专属激活码领取中心，为黄金与钻石会员提供黑神话悟空、影之刃零、归唐、湮灭之潮等热门国产3A游戏的限量测试资格、Steam或主机平台激活码、抢先体验资格与限时福利兑换服务，登录会员账号后即可查看当前可领取权益、使用说明与有效期提醒。",
  alternates: { canonical: "/claim/" },
};

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
