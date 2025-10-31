import { defineConfig } from "@kubb/core";
import { COMMON_CONFIG } from "./config";

export default defineConfig([
  {
    ...COMMON_CONFIG,
    input: {
      path: "./swaggers/demo.json", // 本地文件或 URL 地址
    },
    output: {
      path: "./dist/demo",
      clean: true, // 每次重新生成会清空
    },
  },
  {
    ...COMMON_CONFIG,
    input: {
      path: "https://gitee.com/api/v5/doc_json", // 需要修正 Timestamp 问题
    },
    output: {
      path: "./dist/giteeV8",
      clean: true,
    },
  },
]);
