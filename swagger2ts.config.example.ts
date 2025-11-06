import { defineConfig } from "./src/config-loader";
import { builtinPatches } from "./src/swagger-processor";

/**
 * Swagger2TS 配置示例
 *
 * 在项目根目录创建 `swagger2ts.config.ts` 或 `swagger2ts.config.js` 文件来自定义配置
 */
export default defineConfig({
  // 定义多个 API 源
  sources: {
    // 主 API (v5)
    v5: {
      input: "https://api.example.com/v5/swagger.json",
      output: "./src/api/v5",
      convertToV3: true,
      clean: false,
    },

    // 新版 API (v7)
    v7: {
      input: "https://api.example.com/v7/swagger.json",
      output: "./src/api/v7",
      convertToV3: true,
      clean: false,
      // 可为每个源单独配置补丁
      patches: [
        builtinPatches.giteeTimestamp,
        // 自定义补丁示例
        (content: string) => {
          // 修复其他非标准类型
          return content.replace(/"type": "CustomType"/g, '"type": "string"');
        },
      ],
    },

    // 管理后台 API
    admin: {
      input: "./swagger/admin.json",
      output: "./src/api/admin",
      convertToV3: false,
      clean: false,
    },
  },

  // 全局补丁（应用于所有源）
  patches: [
    builtinPatches.giteeTimestamp,
  ],

  // 是否启用增量缓存
  cache: true,

  // 自定义缓存目录（可选）
  cacheDir: ".api-gen-cache",

  // 是否转换为 OpenAPI 3.x（全局默认值，可被源配置覆盖）
  convertToV3: true,
});
