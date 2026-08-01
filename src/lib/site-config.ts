/**
 * 网站全局配置
 * FREE_MODE = true 时，所有付费内容免费开放，付费墙逻辑全部禁用
 * 未来如需恢复付费模式，改为 false 即可
 */
export const FREE_MODE = true;

/**
 * 工具免费试用配置
 */
export const TOOL_FREE_LIMIT = {
  reqCheck: {
    dailyLimit: 3,        // 每日免费检测次数
    storageKey: "tool_req_check_count",
  },
};
