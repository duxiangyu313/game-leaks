import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服务条款 - 国游爆料国产3A游戏社区用户注册/会员订阅/内容使用协议",
  description: "国游爆料服务条款明确用户注册与账号安全管理、会员等级与自动续费机制、退款政策与价格调整、社区内容发布规范、原创内容版权保护、付费内容防盗与水印措施、爆料信息免责声明、第三方链接责任界定以及服务条款修订与通知方式，注册或使用即表示同意全部条款，请仔细阅读。",
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        {/* 页头 */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">服务条款</h1>
          <p className="text-sm text-[#64748B]">最后更新：2026年6月</p>
        </div>

        <div className="article-content glass-card p-6 md:p-10">

          <h2>一、接受条款</h2>
          <p>欢迎使用国游爆料（以下简称&ldquo;本平台&rdquo;，域名为 news.guoyouwenduji.cc）。注册或使用本平台即表示您同意本服务条款的全部内容。如果您不同意，请勿注册或使用本平台。</p>

          <h2>二、账号注册与管理</h2>
          <ol>
            <li><strong>注册信息</strong>：您承诺提供真实、准确的邮箱地址注册账号。因虚假信息导致的账号问题，本平台不承担责任。</li>
            <li><strong>账号安全</strong>：您对自身账号下的所有活动负责。请妥善保管密码，发现异常登录应立即修改密码并联系管理员。</li>
            <li><strong>账号归属</strong>：账号仅限本人使用，不得转让、出借或出售给他人。</li>
            <li><strong>封禁权利</strong>：如有违反本条款或社区规则的行为，本平台有权暂停或永久封禁您的账号，且不退还已支付的会员费用。</li>
          </ol>

          <h2>三、会员服务</h2>
          <ol>
            <li><strong>会员等级</strong>：本平台提供 Free（免费）、Silver（¥9/月）、Gold（¥29/月）、Diamond（¥89/月）四级会员。各等级权益详见会员页面。</li>
            <li><strong>自动续费</strong>：订阅默认开启自动续费。您可随时在账户设置中取消，取消后当前周期结束前仍可享受对应权益。</li>
            <li><strong>退款政策</strong>：付款后 7 天内可申请全额退款。超过 7 天不支持退款。退款请联系客服邮箱。</li>
            <li><strong>价格变更</strong>：本平台保留调整会员价格的权利。现有订阅用户的价格将在下一个计费周期生效前至少 30 天通知。</li>
            <li><strong>付费内容</strong>：Silver 及以上会员可阅读标注为&ldquo;会员专享&rdquo;的深度文章。付费内容受著作权保护，禁止复制、传播。</li>
          </ol>

          <h2>四、社区规范</h2>
          <ol>
            <li><strong>禁止内容</strong>：禁止发布违法信息、人身攻击、仇恨言论、色情低俗内容、垃圾广告及恶意灌水。</li>
            <li><strong>知识产权</strong>：您在论坛发布的内容，授予本平台非独占、免许可费的使用权（用于展示和推广）。您保证发布内容不侵犯他人知识产权。</li>
            <li><strong>内容审核</strong>：本平台保留审核和删除违规内容的权利，无需事先通知。</li>
          </ol>

          <h2>五、内容版权</h2>
          <ol>
            <li><strong>原创内容</strong>：本平台的原创文章、分析、图像、设计等内容的著作权归国游爆料所有，未经书面授权不得转载。</li>
            <li><strong>游戏素材</strong>：平台上出现的游戏截图、视频、Logo 等归各自版权方所有，本平台仅作为新闻报道使用。</li>
            <li><strong>转载内容</strong>：标注来源为第三方的爆料/新闻，版权归原作者所有。如有侵权请联系我们处理。</li>
            <li><strong>付费内容保护</strong>：禁止以任何形式分享、转载付费内容。本平台采用技术手段保护付费内容，包括但不限于水印追踪。若检测到盗版传播，将追查来源账号并封禁。</li>
          </ol>

          <h2>六、免责声明</h2>
          <ol>
            <li><strong>爆料信息</strong>：本平台发布的&ldquo;爆料&rdquo;内容来源于非官方渠道（传闻/业内消息/招聘信息等），仅供参考，不构成购买建议。实际产品信息以官方公告为准。</li>
            <li><strong>第三方链接</strong>：本平台可能包含指向第三方网站的链接，对第三方内容不作任何保证。</li>
            <li><strong>服务中断</strong>：因不可抗力（自然灾害、网络攻击、服务器故障等）导致的服务中断，本平台不承担责任。</li>
            <li><strong>数据安全</strong>：我们采用行业标准措施保护用户数据，但不保证绝对安全。</li>
          </ol>

          <h2>七、条款修改</h2>
          <p>本平台保留随时修改本条款的权利。重大变更会通过邮件或站内通知告知。继续使用本平台即视为接受修改后的条款。</p>

          <h2>八、联系我们</h2>
          <p>如对本条款有疑问，请通过以下方式联系我们：</p>
          <ul>
            <li>邮箱：support@guoyouwenduji.cc</li>
            <li>或访问 <a href="/contact" className="text-[#06B6D4] hover:underline">联系我们</a> 页面</li>
          </ul>

        </div>
      </div>
    </div>
  );
}
