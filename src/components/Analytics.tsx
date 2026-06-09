/**
 * 网站分析统计组件
 *
 * - 百度统计 (Baidu Tongji)：国内用户行为分析
 * - Google Analytics (GA4)：国际流量 + 广告转化追踪
 *
 * 通过环境变量配置，未设置则自动跳过。
 */

export function Analytics() {
  const baiduId = process.env.NEXT_PUBLIC_BAIDU_TONGJI_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!baiduId && !gaId) return null;

  return (
    <>
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
