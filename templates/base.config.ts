import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginClient } from "@kubb/plugin-client";
import type { UserConfig } from "@kubb/core";

/**
 * 创建自定义 API 配置，最终会传递给 Kubb 去构建
 * 支持 Fetch 和 Axios 客户端类型
 * 支持扩展 Kubb 原生配置
 */
export function createApiConfig(options: {
  input: string;
  output: string;
  clean?: boolean;
  clientType?: "fetch" | "axios";
  baseURL?: string;
  kubbOptions?: {
    plugins?: any[];
    hooks?: any;
    [key: string]: any;
  };
}): UserConfig {
  const {
    input,
    output,
    clean = false,
    clientType = "axios",
    baseURL,
    kubbOptions = {},
  } = options;

  // 默认插件配置
  const defaultPlugins = [
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
        name: (name: string) => {
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
  ];

  // 提取用户自定义的插件和其他配置
  const { plugins: userPlugins = [], ...otherKubbOptions } = kubbOptions;

  return {
    // 合并默认插件和用户插件
    plugins: [...defaultPlugins, ...userPlugins],

    input: {
      path: input,
    },
    output: {
      path: output,
      clean,
    },

    // 合并其他 Kubb 配置（如 hooks 等）
    ...otherKubbOptions,
  };
}
