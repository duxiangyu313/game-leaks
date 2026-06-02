(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,32781,e=>{"use strict";let t=(0,e.i(56420).default)("loader-circle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);e.s(["Loader2",0,t],32781)},11241,e=>{"use strict";let t=(0,e.i(56420).default)("arrow-left",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);e.s(["ArrowLeft",0,t],11241)},74544,e=>{"use strict";let t=(0,e.i(56420).default)("clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]);e.s(["Clock",0,t],74544)},72382,e=>{"use strict";let t=(0,e.i(56420).default)("eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);e.s(["Eye",0,t],72382)},48161,e=>{"use strict";let t=(0,e.i(56420).default)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);e.s(["CheckCircle",0,t],48161)},30274,e=>{"use strict";let t=(0,e.i(56420).default)("send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);e.s(["Send",0,t],30274)},26091,e=>{"use strict";let t=(0,e.i(56420).default)("file-text",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);e.s(["FileText",0,t],26091)},6537,e=>{"use strict";let t=(0,e.i(56420).default)("lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);e.s(["Lock",0,t],6537)},89664,e=>{"use strict";let t=(0,e.i(56420).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["Check",0,t],89664)},14831,e=>{"use strict";function t(e){return e.replace(/#{1,6}\s/g,"").replace(/\*{1,3}(.+?)\*{1,3}/g,"$1").replace(/_{1,3}(.+?)_{1,3}/g,"$1").replace(/`{1,3}[^`]*`{1,3}/g,"").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/!\[([^\]]*)\]\([^)]+\)/g,"$1").replace(/>\s/g,"").replace(/[-*+]\s/g,"").replace(/\d+\.\s/g,"").replace(/<[^>]+>/g,"").replace(/\|\s?[-:]+\s?\|/g,"").replace(/:::/g,"").replace(/\|\|/g,"").replace(/\n{2,}/g,"\n").trim()}function r(e){return e.toLowerCase().replace(/[^\w一-鿿]+/g,"-").replace(/^-+|-+$/g,"").slice(0,64)}e.s(["calculateReadingTime",0,function(e){if(!e)return 1;let r=t(e);return Math.max(1,Math.ceil((r.match(/[一-鿿]/g)||[]).length/400+(r.match(/[a-zA-Z]+/g)||[]).length/200))},"calculateWordCount",0,function(e){if(!e)return 0;let r=t(e);return(r.match(/[一-鿿]/g)||[]).length+(r.match(/[a-zA-Z]+/g)||[]).length},"extractImages",0,function(e){let t;if(!e)return[];let r=[],n=/!\[[^\]]*\]\(([^)]+)\)/g;for(;null!==(t=n.exec(e));)r.push(t[1]);let l=/<img[^>]+src=["']([^"']+)["'][^>]*>/gi;for(;null!==(t=l.exec(e));)r.push(t[1]);return r},"formatDate",0,function(e){if(!e)return"";try{return new Date(e).toLocaleDateString("zh-CN",{year:"numeric",month:"long",day:"numeric"})}catch{return e}},"generateExcerpt",0,function(e,r=160){if(!e)return"";let n=t(e),l=n.split(/\n\s*\n/)[0]||n.split("\n")[0]||"";return l.length<=r?l:l.slice(0,r).replace(/\s+\S*$/,"")+"…"},"generateTOC",0,function(e){let t;if(!e)return[];let n=/^(#{2,3})\s+(.+)$/gm,l=[];for(;null!==(t=n.exec(e));){let e=t[1].length,n=t[2].trim(),i=r(n);l.push({id:i,text:n,level:e})}return l},"slugify",0,r])},51210,e=>{"use strict";function t(e){let t={leak:`## 核心要点
<!-- 用2-3句话概括这条爆料的核心信息 -->

## 正文
<!-- 详细展开爆料内容 -->

## 可信度评估
- **消息来源**:
- **交叉验证**:
- **可信度评级**: ★★★☆☆

## 关键总结
<!-- 3-5条核心takeaway -->
`,review:`## 游戏速览
- **开发商**:
- **平台**:
- **发售日期**:
- **评分**: /10

## 正文
<!-- 评测详细内容 -->

## 优缺点
### 优点
-

### 缺点
-

## 总评
<!-- 一句话总结推荐意见 -->
`,analysis:`## 摘要
<!-- 一句话核心观点 -->

## 正文
<!-- 详细分析 -->

## 数据与事实
<!-- 支撑数据 -->

## 结论与展望
`,news:`## TL;DR
<!-- 一句话速览 -->

## 正文
<!-- 新闻详细内容 -->

## 背景
<!-- 相关背景信息 -->
`,standard:`## 正文
<!-- 开始输入内容 -->
`};return t[e]||t.standard}e.s(["formatOneClick",0,function(e,r){if(!e.trim())return t(r);let n=e,l=(n=(n=n.replace(/^([A-Z][A-Z\s]{3,40})$/gm,"## $1")).replace(/^([一二三四五六七八九十]、|\d+[.、])\s*(.+)$/gm,"- $2")).split("\n"),i=[],a=[];for(let e of l){let t=e.trim();if(!t){a.length>0?(i.push(a.join(""),""),a=[]):i.push("");continue}if(/^(#{1,6}\s|[-*+]\s|\d+\.\s|>|\|)/.test(t)){a.length>0&&(i.push(a.join("")),a=[]),i.push(t);continue}a.push(t)}return a.length>0&&i.push(a.join("")),(n=i.join("\n")).includes("## ")||"standard"===r||(n=t(r).replace(/#{2,3}\s正文[\s\S]*?(?=#{2,3}|$)/,e=>e.trim()+"\n\n"+n)),(n=n.replace(/^#\s(?!##)/gm,"## ")).trim()},"generateTemplateMarkdown",0,t,"getDefaultTemplateType",0,function(e){return({leak:"leak",review:"review",analysis:"analysis",preview:"review",interview:"standard",opinion:"standard",news:"news",video:"standard"})[e]||"standard"},"preprocessMarkdown",0,function(e){if(!e)return"";let t=e;return(t=t.replace(/:::callout\{type="(\w+)"\}\s*\n([\s\S]*?):::/g,(e,t,r)=>`> ${({info:"ℹ️",warning:"⚠️",success:"✅",danger:"🚫"})[t]||"📌"} **${t.toUpperCase()}**
>
> ${r.trim().replace(/\n/g,"\n> ")}`)).replace(/\|\|(.+?)\|\|/g,'<span class="spoiler-text cursor-pointer hover:bg-[#F59E0B]/10 px-1 rounded" onclick="this.classList.toggle(\'spoiler-revealed\')">$1</span>')}])},53138,e=>{"use strict";let t=(0,e.i(56420).default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);e.s(["AlertTriangle",0,t],53138)},41987,e=>{"use strict";let t=(0,e.i(56420).default)("share-2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]);e.s(["Share2",0,t],41987)},82022,62368,e=>{"use strict";var t=e.i(56420);let r=(0,t.default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);e.s(["ExternalLink",0,r],82022);let n=(0,t.default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);e.s(["Download",0,n],62368)},24071,e=>{"use strict";let t=(0,e.i(56420).default)("chevron-left",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);e.s(["ChevronLeft",0,t],24071)},67927,e=>{"use strict";let t=(0,e.i(56420).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,t],67927)},88653,e=>{"use strict";e.i(47167);var t=e.i(18050),r=e.i(71645),n=e.i(31178),l=e.i(47414),i=e.i(74008),a=e.i(21476),s=e.i(72846),c=r,o=e.i(37806);function u(e,t){if("function"==typeof e)return e(t);null!=e&&(e.current=t)}class p extends c.Component{getSnapshotBeforeUpdate(e){let t=this.props.childRef.current;if((0,s.isHTMLElement)(t)&&e.isPresent&&!this.props.isPresent&&!1!==this.props.pop){let e=t.offsetParent,r=(0,s.isHTMLElement)(e)&&e.offsetWidth||0,n=(0,s.isHTMLElement)(e)&&e.offsetHeight||0,l=getComputedStyle(t),i=this.props.sizeRef.current;i.height=parseFloat(l.height),i.width=parseFloat(l.width),i.top=t.offsetTop,i.left=t.offsetLeft,i.right=r-i.width-i.left,i.bottom=n-i.height-i.top,i.direction=l.direction}return null}componentDidUpdate(){}render(){return this.props.children}}function h({children:e,isPresent:n,anchorX:l,anchorY:i,root:a,pop:s}){let d=(0,c.useId)(),f=(0,c.useRef)(null),g=(0,c.useRef)({width:0,height:0,top:0,left:0,right:0,bottom:0,direction:"ltr"}),{nonce:m}=(0,c.useContext)(o.MotionConfigContext),y=function(...e){return r.useCallback(function(...e){return t=>{let r=!1,n=e.map(e=>{let n=u(e,t);return r||"function"!=typeof n||(r=!0),n});if(r)return()=>{for(let t=0;t<n.length;t++){let r=n[t];"function"==typeof r?r():u(e[t],null)}}}}(...e),e)}(f,e.props?.ref??e?.ref);return(0,c.useInsertionEffect)(()=>{let{width:e,height:t,top:r,left:c,right:o,bottom:u,direction:p}=g.current;if(n||!1===s||!f.current||!e||!t)return;let h="rtl"===p,y="left"===l?h?`right: ${o}`:`left: ${c}`:h?`left: ${c}`:`right: ${o}`,k="bottom"===i?`bottom: ${u}`:`top: ${r}`;f.current.dataset.motionPopId=d;let x=document.createElement("style");m&&(x.nonce=m);let w=a??document.head;return w.appendChild(x),x.sheet&&x.sheet.insertRule(`
          [data-motion-pop-id="${d}"] {
            position: absolute !important;
            width: ${e}px !important;
            height: ${t}px !important;
            ${y}px !important;
            ${k}px !important;
          }
        `),()=>{f.current?.removeAttribute("data-motion-pop-id"),w.contains(x)&&w.removeChild(x)}},[n]),(0,t.jsx)(p,{isPresent:n,childRef:f,sizeRef:g,pop:s,children:!1===s?e:c.cloneElement(e,{ref:y})})}let d=({children:e,initial:n,isPresent:i,onExitComplete:s,custom:c,presenceAffectsLayout:o,mode:u,anchorX:p,anchorY:d,root:g})=>{let m=(0,l.useConstant)(f),y=(0,r.useId)(),k=!0,x=(0,r.useMemo)(()=>(k=!1,{id:y,initial:n,isPresent:i,custom:c,onExitComplete:e=>{for(let t of(m.set(e,!0),m.values()))if(!t)return;s&&s()},register:e=>(m.set(e,!1),()=>m.delete(e))}),[i,m,s]);return o&&k&&(x={...x}),(0,r.useMemo)(()=>{m.forEach((e,t)=>m.set(t,!1))},[i]),r.useEffect(()=>{i||m.size||!s||s()},[i]),e=(0,t.jsx)(h,{pop:"popLayout"===u,isPresent:i,anchorX:p,anchorY:d,root:g,children:e}),(0,t.jsx)(a.PresenceContext.Provider,{value:x,children:e})};function f(){return new Map}var g=e.i(64978);let m=e=>e.key||"";function y(e){let t=[];return r.Children.forEach(e,e=>{(0,r.isValidElement)(e)&&t.push(e)}),t}e.s(["AnimatePresence",0,({children:e,custom:a,initial:s=!0,onExitComplete:c,presenceAffectsLayout:o=!0,mode:u="sync",propagate:p=!1,anchorX:h="left",anchorY:f="top",root:k})=>{let[x,w]=(0,g.usePresence)(p),v=(0,r.useMemo)(()=>y(e),[e]),M=p&&!x?[]:v.map(m),C=(0,r.useRef)(!0),$=(0,r.useRef)(v),E=(0,l.useConstant)(()=>new Map),L=(0,r.useRef)(new Set),[z,T]=(0,r.useState)(v),[R,b]=(0,r.useState)(v);(0,i.useIsomorphicLayoutEffect)(()=>{C.current=!1,$.current=v;for(let e=0;e<R.length;e++){let t=m(R[e]);M.includes(t)?(E.delete(t),L.current.delete(t)):!0!==E.get(t)&&E.set(t,!1)}},[R,M.length,M.join("-")]);let j=[];if(v!==z){let e=[...v];for(let t=0;t<R.length;t++){let r=R[t],n=m(r);M.includes(n)||(e.splice(t,0,r),j.push(r))}return"wait"===u&&j.length&&(e=j),b(y(e)),T(v),null}let{forceRender:A}=(0,r.useContext)(n.LayoutGroupContext);return(0,t.jsx)(t.Fragment,{children:R.map(e=>{let r=m(e),n=(!p||!!x)&&(v===R||M.includes(r));return(0,t.jsx)(d,{isPresent:n,initial:(!C.current||!!s)&&void 0,custom:a,presenceAffectsLayout:o,mode:u,root:k,onExitComplete:n?void 0:()=>{if(L.current.has(r)||!E.has(r))return;L.current.add(r),E.set(r,!0);let e=!0;E.forEach(t=>{t||(e=!1)}),e&&(A?.(),b($.current),p&&w?.(),c&&c())},anchorX:h,anchorY:f,children:e},r)})})}],88653)}]);