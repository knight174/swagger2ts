import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginClient } from "@kubb/plugin-client";
import type { UserConfig } from "@kubb/core";

/**
 * Axios Client Configuration
 *
 * This configuration generates API clients using Axios instead of Fetch.
 * Use this when you prefer Axios for features like:
 * - Request/response interceptors
 * - Automatic JSON transformation
 * - Request cancellation
 * - Progress monitoring
 * - Better error handling
 *
 * Note: You need to install axios in your project:
 * pnpm add axios
 */
export function getAxiosConfig(): Pick<UserConfig, "plugins"> {
  return {
    plugins: [
      // 1. OAS Parser
      pluginOas(),

      // 2. Generate TypeScript Types
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

      // 3. Generate API Clients (Axios)
      pluginClient({
        output: {
          path: "./clients/axios",
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
        client: "axios",
        bundle: true,  // Copy client runtime to .kubb directory, avoiding dependency on @kubb/plugin-client
      } as any),
    ],
  };
}

/**
 * Create Axios API configuration
 */
export function createAxiosConfig(options: {
  input: string;
  output: string;
  clean?: boolean;
}): UserConfig {
  const { input, output, clean = false } = options;

  return {
    ...getAxiosConfig(),
    input: {
      path: input,
    },
    output: {
      path: output,
      clean,
    },
  };
}
