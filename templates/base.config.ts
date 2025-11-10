import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginClient } from "@kubb/plugin-client";
import type { UserConfig } from "@kubb/core";

/**
 * 通用的 Kubb 配置
 * 可被所有 API 源复用
 */
export function getCommonConfig(): Pick<UserConfig, "plugins"> {
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
          name: ({ group }) => `${group}`,
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
          name: ({ group }: { group: string }) => `${group}Service`,
        },
        transformers: {
          name: (name: string, type?: string) => {
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
        bundle: true,
      } as any),
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
  baseURL?: string;
}): UserConfig {
  const { input, output, clean = false, clientType = "axios", baseURL } = options;

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
          name: ({ group }) => `${group}`,
        },
        enumType: "asConst",
        enumSuffix: "Enum",
        unknownType: "unknown",
        optionalType: "questionTokenAndUndefined",
      }),

      // 3. 生成 API 客户端
      pluginClient({
        output: {
          path: `./clients/${clientType}`,
          barrelType: "named",
          banner: "/* eslint-disable no-alert, no-console */",
          footer: "",
        },
        group: {
          type: "tag",
          name: ({ group }: { group: string }) => `${group}Service`,
        },
        transformers: {
          name: (name: string, type?: string) => {
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
        client: clientType,
        baseURL,
        bundle: true,
      } as any),
    ],
    input: {
      path: input,
    },
    output: {
      path: output,
      clean,
    },
  };
}
