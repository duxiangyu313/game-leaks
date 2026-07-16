import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // 项目原有模式：Supabase 返回数据大量使用 any，逐步收紧
      "@typescript-eslint/no-explicit-any": "warn",
      // 项目原有模式：data hooks 中 refresh() 在 effect 中调用
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
