"use client";

import Link from "next/link";
import type { LinkProps } from "next/link";
import type { AnchorHTMLAttributes, RefAttributes } from "react";

/**
 * Static Export 专用 Link 封装。
 * 默认 prefetch={false}，避免 hover 时请求不存在的 RSC payload（404 错误）。
 * 用法：import LinkNoPrefetch from "@/components/LinkNoPrefetch";
 *        <LinkNoPrefetch href="/games">游戏库</LinkNoPrefetch>
 */
export default function LinkNoPrefetch(
  props: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement> & RefAttributes<HTMLAnchorElement>
) {
  return <Link prefetch={false} {...props} />;
}
