import { Metadata } from "next";
import { MessageSquare, Plus } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import ForumCardsGrid from "@/components/ForumCardsGrid";
import ForumLiveStats from "@/components/ForumLiveStats";
import ForumCategoryCards from "@/components/ForumCategoryCards";

export const metadata: Metadata = {
  title: "社区论坛 · 国产3A游戏玩家讨论交流社区与攻略爆料",
  description: "国游爆料玩家社区论坛，汇集黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A游戏讨论。分享攻略心得、交流爆料信息、组队开黑，与热爱国产游戏的玩家一起互动。",
  alternates: { canonical: "/forum/" },
};

export default function ForumPage() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-7 h-7 text-[#06B6D4]" />
              <h1 className="text-3xl font-bold text-[#F1F5F9]">论坛</h1>
            </div>
            <p className="text-[#94A3B8]">国产3A游戏玩家社区</p>
            <div className="mt-3"><ForumLiveStats /></div>
          </div>
          <LinkNoPrefetch href="/forum/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] text-white font-medium rounded-xl hover:bg-[#0891B2] transition-colors">
            <Plus className="w-4 h-4" /> 发布新帖
          </LinkNoPrefetch>
        </div>

        <div className="mb-10">
          <ForumLiveStats large />
        </div>

        <ForumCardsGrid>
        <ForumCategoryCards />
        </ForumCardsGrid>
      </div>
    </div>
  );
}
