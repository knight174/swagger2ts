import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginClient } from "@kubb/plugin-client";

// 公共的 Kubb 配置
export const COMMON_CONFIG = {
  plugins: [
    // 3️⃣ 加载 OAS 解析器
    pluginOas(),

    // 4️⃣ 生成 TypeScript 类型
    pluginTs({
      output: {
        path: "./types",
      },
      group: {
        type: "tag",
        name: ({ group }) => `${group}Controller`,
      },
      enumType: "asConst", // 枚举用 as const
      enumSuffix: "Enum",
      unknownType: "unknown",
      optionalType: "questionTokenAndUndefined",
    }),

    // 5️⃣ 生成 API 客户端（可配置 axios/fetch）
    pluginClient({
      output: {
        path: "./clients/fetch",
        barrelType: "named",
        banner: "/* eslint-disable no-alert, no-console */",
        footer: "",
      },
      group: {
        type: "tag",
        name: ({ group }) => `${group}Service`,
      },
      transformers: {
        name: (name, type) => {
          return `${name}Client`;
        },
      },
      operations: true,
      parser: "client",
      exclude: [
        {
          type: "tag",
          pattern: "store",
        },
      ],
      pathParamsType: "object",
      dataReturnType: "full",
      client: "fetch",
    }),
  ],
};
