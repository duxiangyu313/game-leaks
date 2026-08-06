/**
 * 网站分析统计 + 百度抓取组件
 *
 * - 百度统计 (Baidu Tongji)：国内用户行为分析
 * - Google Analytics (GA4)：国际流量 + 广告转化追踪
 * - 百度自动推送 (Auto-Push)：生产环境每个页面注入，访客打开即通知百度蜘蛛抓取该 URL（零 token 依赖）
 *
 * 统计部分通过环境变量配置，未设置则自动跳过。
 * 自动推送仅在 NODE_ENV==='production'（即生产构建）时注入，避免把 dev/localhost 地址推给百度。
 */

// 百度自动推送脚本：根据协议动态加载 push.js，加载后自动把当前页 URL 提交给百度
const BAIDU_AUTO_PUSH = `(function(){var bp=document.createElement('script');var curProtocol=window.location.protocol.split(':')[0];if(curProtocol==='https'){bp.src='https://zz.bdstatic.com/linksubmit/push.js';}else{bp.src='http://push.zhanzhang.baidu.com/push.js';}var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(bp,s);})();`;

export function Analytics() {
  const baiduId = process.env.NEXT_PUBLIC_BAIDU_TONGJI_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const isProd = process.env.NODE_ENV === "production";

  // 没有任何统计/抓取代码可注入时返回 null
  if (!baiduId && !gaId && !isProd) return null;

  return (
    <>
      {/* 百度自动推送 — 访客打开页面即通知百度蜘蛛来抓取该 URL（生产环境） */}
      {isProd && (
        <script dangerouslySetInnerHTML={{ __html: BAIDU_AUTO_PUSH }} />
      )}

      {/* 百度统计 */}
      {baiduId && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `var _hmt=_hmt||[];(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?${baiduId}";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s);})();`,
            }}
          />
        </>
      )}

      {/* Google Analytics (GA4) */}
      {gaId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { send_page_view: true });
              `,
            }}
          />
        </>
      )}
    </>
  );
}
