import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策 - 国游爆料国产3A游戏平台用户数据保护与Cookie说明",
  description: "国游爆料隐私政策详细说明我们如何收集、使用、存储和保护你的个人信息，内容涵盖注册邮箱与昵称的用途、Stripe支付安全保障、浏览器Cookie与本地存储机制、付费内容图片水印的版权追溯用途，以及用户依法享有的查阅、更正、删除个人数据和取消邮件订阅等各项权利。",
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* 页头 */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">隐私政策</h1>
          <p className="text-sm text-[#64748B]">最后更新：2026年6月</p>
        </div>

        <div className="article-content glass-card p-6 md:p-10">

          <h2>一、信息收集</h2>
          <p>
            本站高度重视用户隐私保护。我们仅收集运行服务所必需的最少信息：
          </p>
          <ul>
            <li><strong>注册邮箱</strong>：用于账号登录、发送开售提醒和会员到期通知；</li>
            <li><strong>用户昵称与头像</strong>：用于社区互动展示（可选提供）；</li>
            <li><strong>支付信息</strong>：会员订阅由 Stripe 处理，本站不存储用户的银行卡号、支付密码等敏感金融信息。</li>
          </ul>
          <p>
            本站<strong>不收集</strong>身份证号、手机号码、真实姓名、家庭住址等个人隐私信息。
          </p>

          <h2>二、图片水印</h2>
          <p>
            为保护付费内容的版权，本站对付费文章中的图片自动添加水印（包含用户 ID 和时间戳）。水印仅用于版权追溯与防盗用途，不对外公开，不会用于任何商业目的。
          </p>

          <h2>三、数据存储与安全</h2>
          <ul>
            <li>所有用户数据存储在 <strong>Supabase</strong> 云数据库中，采用行业标准加密传输（TLS）；</li>
            <li>本站承诺<strong>不会出售、出租、交易或泄露用户任何信息</strong>给第三方；</li>
            <li>除法律法规要求或政府机关依法查询外，本站不会向任何第三方提供用户数据；</li>
            <li>本站采取合理的技术手段保护用户数据安全，但无法保证绝对安全（互联网不存在 100% 安全的数据传输）。</li>
          </ul>

          <h2>四、Cookie 与本地存储</h2>
          <ul>
            <li>本站使用浏览器本地存储（localStorage）缓存用户的登录状态和页面偏好，以提升访问速度；</li>
            <li>用户可随时在浏览器设置中清除本站的 Cookie 和本地存储数据；</li>
            <li>本站不使用第三方跟踪 Cookie 或广告定向 Cookie。</li>
          </ul>

          <h2>五、用户权利</h2>
          <p>您对自己的数据拥有以下权利：</p>
          <ul>
            <li><strong>查阅权</strong>：登录后可在{"“"}账号设置{"”"}页面查看您的基本信息；</li>
            <li><strong>更正权</strong>：如发现信息有误，可自行修改或联系管理员协助更正；</li>
            <li><strong>删除权</strong>：您可以申请注销账号，我们将在 7 个工作日内清除您的全部个人数据；</li>
            <li><strong>撤回同意</strong>：您可以随时取消订阅邮件通知（邮件底部{"“"}取消订阅{"”"}链接）。</li>
          </ul>
          <p>如需行使上述权利，请通过{"“"}联系我们{"”"}页面或发送邮件至管理员邮箱。</p>

          <h2>六、未成年人保护</h2>
          <p>
            本站服务面向具有完全民事行为能力的用户。如果您是未成年人，请在监护人指导下使用本站服务。
          </p>

          <h2>七、政策更新</h2>
          <p>
            本隐私政策可能适时修订，更新后的版本将在本站公示。重大变更我们将通过站内通知或邮件告知注册用户。
          </p>

        </div>
      </div>
    </div>
  );
}
