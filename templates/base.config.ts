import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginClient } from "@kubb/plugin-client";
import type { UserConfig } from "@kubb/core";

/**
 * 通用的 Kubb 配置
 * 可被所有 API 源复用
 */
export function getCommonConfig(): Partial<UserConfig> {
  return {
    plugins: [
      // 1. OAS 解析器
      pluginOas(),

      // 2. 生成 TypeScript 类型
      pluginTs({
        output: {
          path: "./types",
        },
        group: {
          type: "tag",
          name: ({ group }) => `${group}Controller`,
        },
        enumType: "asConst",
        enumSuffix: "Enum",
        unknownType: "unknown",
        optionalType: "questionTokenAndUndefined",
      }),

      // 3. 生成 API 客户端（Fetch）
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
}

/**
 * 创建自定义 API 配置
 */
export function createApiConfig(options: {
  input: string;
  output: string;
  clean?: boolean;
  clientType?: "fetch" | "axios";
}): UserConfig {
  const { input, output, clean = false, clientType = "fetch" } = options;

  return {
    ...getCommonConfig(),
    input: {
      path: input,
    },
    output: {
      path: output,
      clean,
    },
  };
}
