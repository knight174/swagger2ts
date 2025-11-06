import { existsSync } from "fs";
import { resolve } from "path";
import { bundleRequire } from "bundle-require";
import type { Swagger2TsConfig } from "./types.js";

/**
 * 支持的配置文件名称（按优先级排序）
 */
const CONFIG_FILES = [
  "swagger2ts.config.ts",
  "swagger2ts.config.mts",
  "swagger2ts.config.js",
  "swagger2ts.config.mjs",
  ".swagger2tsrc.ts",
  ".swagger2tsrc.mts",
  ".swagger2tsrc.js",
  ".swagger2tsrc.mjs",
];

/**
 * 查找配置文件
 * @param cwd 当前工作目录
 * @param explicitPath 明确指定的配置文件路径
 * @returns 配置文件路径，如果未找到则返回 null
 */
export function findConfigFile(
  cwd: string,
  explicitPath?: string
): string | null {
  // 如果明确指定了路径，检查是否存在
  if (explicitPath) {
    const path = resolve(cwd, explicitPath);
    return existsSync(path) ? path : null;
  }

  // 按优先级顺序查找
  for (const file of CONFIG_FILES) {
    const path = resolve(cwd, file);
    if (existsSync(path)) {
      return path;
    }
  }

  return null;
}

/**
 * 加载并解析配置文件
 * @param configPath 配置文件路径
 * @returns 解析后的配置对象
 */
export async function loadConfigFile(
  configPath: string
): Promise<Swagger2TsConfig> {
  try {
    const { mod } = await bundleRequire({
      filepath: configPath,
    });

    // 支持 default export 和 named export
    const config = mod.default || mod;

    return validateConfig(config);
  } catch (error) {
    throw new Error(
      `Failed to load config file: ${configPath}\n${error instanceof Error ? error.message : error}`
    );
  }
}

/**
 * 验证配置对象的基本结构
 * @param config 待验证的配置对象
 * @returns 验证后的配置对象
 */
function validateConfig(config: unknown): Swagger2TsConfig {
  if (!config || typeof config !== "object") {
    throw new Error("Config must be an object");
  }

  const cfg = config as Swagger2TsConfig;

  // 验证 sources 结构（如果存在）
  if (cfg.sources) {
    if (typeof cfg.sources !== "object" || Array.isArray(cfg.sources)) {
      throw new Error("Config.sources must be an object");
    }

    for (const [name, source] of Object.entries(cfg.sources)) {
      if (!source.input || !source.output) {
        throw new Error(
          `Config.sources["${name}"] must have 'input' and 'output' properties`
        );
      }
    }
  }

  return cfg;
}

/**
 * 类型安全的配置定义辅助函数
 * @param config 配置对象
 * @returns 原样返回配置对象（仅用于类型推断）
 */
export function defineConfig(config: Swagger2TsConfig): Swagger2TsConfig {
  return config;
}
