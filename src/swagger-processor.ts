import fs from "fs";
import path from "path";
import { convertObj } from "swagger2openapi";
import type { PatchFunction, ProcessedSwagger } from "./types.js";

/**
 * 内置补丁：修复 Gitee API 的非标准 Timestamp 类型
 */
export function patchGiteeTimestamp(content: string): string {
  let patched = content;

  // 修复 Timestamp 和 TimeStamp（不区分大小写）
  patched = patched.replace(
    /"type":\s*"Timestamp"/gi,
    `"type": "string", "format": "date-time"`
  );
  patched = patched.replace(
    /"type":\s*"TimeStamp"/gi,
    `"type": "string", "format": "date-time"`
  );

  return patched;
}

/**
 * 内置补丁集合
 */
export const builtinPatches: Record<string, PatchFunction> = {
  giteeTimestamp: patchGiteeTimestamp,
};

/**
 * 从文件或 URL 获取 Swagger 内容
 */
export async function fetchSwagger(input: string): Promise<string> {
  // 判断是 URL 还是本地文件
  if (input.startsWith("http://") || input.startsWith("https://")) {
    console.log(`📥 从 URL 获取 Swagger: ${input}`);
    const response = await fetch(input);
    if (!response.ok) {
      throw new Error(`❌ 获取 Swagger 失败：${response.statusText}`);
    }
    return await response.text();
  } else {
    const resolvedPath = path.resolve(input);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`❌ 文件不存在：${resolvedPath}`);
    }
    console.log(`📂 从本地文件读取 Swagger: ${resolvedPath}`);
    return fs.readFileSync(resolvedPath, "utf-8");
  }
}

/**
 * 应用补丁函数
 */
export function applyPatches(
  content: string,
  patches: PatchFunction[]
): string {
  let result = content;
  for (const patch of patches) {
    result = patch(result);
  }
  return result;
}

/**
 * 检测 Swagger 版本
 */
export function detectSwaggerVersion(content: string): string {
  try {
    const spec = JSON.parse(content);

    if (spec.openapi) {
      return spec.openapi; // OpenAPI 3.x
    } else if (spec.swagger) {
      return spec.swagger; // Swagger 2.0
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * 将 Swagger 2.0 转换为 OpenAPI 3.x
 */
export async function convertToOpenAPI3(
  swagger2Content: string
): Promise<string> {
  try {
    const swagger2 = JSON.parse(swagger2Content);

    console.log("🔄 正在将 Swagger 2.0 转换为 OpenAPI 3.x...");

    const result = await convertObj(swagger2, {
      patch: true, // 自动修复常见问题
      warnOnly: true, // 只警告不报错
    });

    console.log("✅ 转换完成");
    return JSON.stringify(result.openapi, null, 2);
  } catch (error) {
    throw new Error(
      `❌ Swagger 2.0 转换失败：${error instanceof Error ? error.message : error}`
    );
  }
}

/**
 * 处理 Swagger 文件（获取、补丁、转换）
 */
export async function processSwagger(
  input: string,
  options: {
    patches?: PatchFunction[];
    convertToV3?: boolean;
  } = {}
): Promise<ProcessedSwagger> {
  // 1. 获取 Swagger 内容
  let content = await fetchSwagger(input);

  // 2. 应用补丁
  if (options.patches && options.patches.length > 0) {
    console.log(`🔧 应用 ${options.patches.length} 个补丁...`);
    content = applyPatches(content, options.patches);
  }

  // 3. 检测版本
  const version = detectSwaggerVersion(content);
  console.log(`📋 检测到 Swagger 版本：${version}`);

  // 4. 转换为 OpenAPI 3.x（如果需要）
  let isConverted = false;
  if (options.convertToV3 && version.startsWith("2.")) {
    content = await convertToOpenAPI3(content);
    isConverted = true;
  }

  return {
    content,
    isConverted,
    originalVersion: version,
  };
}

/**
 * 保存 Swagger 到临时文件
 */
export function saveTempSwagger(content: string, outputDir: string): string {
  const tempDir = path.join(outputDir, ".temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFile = path.join(tempDir, "swagger.json");
  fs.writeFileSync(tempFile, content, "utf-8");

  return tempFile;
}
