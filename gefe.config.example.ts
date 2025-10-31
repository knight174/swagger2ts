import type { GefeConfig } from "./src/types";
import { builtinPatches } from "./src/swagger-processor";

/**
 * Gefe API Generator 配置示例
 *
 * 在项目根目录创建 `gefe.config.ts` 文件来自定义配置
 */
const config: GefeConfig = {
  // 定义多个 API 源
  sources: {
    // 主 API
    main: {
      input: "./swagger/main.json",
      output: "./src/api/main",
      convertToV3: true,
      clean: false,
    },

    // 管理后台 API
    admin: {
      input: "https://admin.example.com/swagger.json",
      output: "./src/api/admin",
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
  },

  // 全局补丁（应用于所有源）
  patches: [
    builtinPatches.giteeTimestamp,
  ],

  // 是否启用增量缓存
  cache: true,

  // 自定义缓存目录（可选）
  cacheDir: ".api-gen-cache",

  // 是否转换为 OpenAPI 3.x
  convertToV3: true,
};

export default config;
