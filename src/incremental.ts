import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import type { CacheMetadata } from "./types.js";

const CACHE_VERSION = "1.0.0";

/**
 * 计算字符串的 MD5 哈希值
 */
export function calculateHash(content: string): string {
  return createHash("md5").update(content).digest("hex");
}

/**
 * 获取缓存目录路径
 */
export function getCacheDir(outputDir: string): string {
  return path.join(outputDir, ".api-gen-cache");
}

/**
 * 获取缓存文件路径
 */
export function getCacheFilePath(outputDir: string): string {
  return path.join(getCacheDir(outputDir), "metadata.json");
}

/**
 * 读取缓存元数据
 */
export function readCache(outputDir: string): CacheMetadata | null {
  const cacheFile = getCacheFilePath(outputDir);

  if (!fs.existsSync(cacheFile)) {
    return null;
  }

  try {
    const content = fs.readFileSync(cacheFile, "utf-8");
    return JSON.parse(content) as CacheMetadata;
  } catch (error) {
    console.warn(`⚠️  读取缓存文件失败：${error}`);
    return null;
  }
}

/**
 * 写入缓存元数据
 */
export function writeCache(
  outputDir: string,
  metadata: Omit<CacheMetadata, "version">
): void {
  const cacheDir = getCacheDir(outputDir);

  // 确保缓存目录存在
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const cacheFile = getCacheFilePath(outputDir);
  const fullMetadata: CacheMetadata = {
    ...metadata,
    version: CACHE_VERSION,
  };

  fs.writeFileSync(cacheFile, JSON.stringify(fullMetadata, null, 2), "utf-8");
}

/**
 * 清除缓存
 */
export function clearCache(outputDir: string): void {
  const cacheDir = getCacheDir(outputDir);

  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log("🗑️  缓存已清除");
  }
}

/**
 * 检查是否需要重新生成
 * @returns true 需要重新生成，false 可以跳过
 */
export function shouldRegenerate(
  swaggerContent: string,
  input: string,
  outputDir: string,
  force: boolean = false
): boolean {
  // 强制重新生成
  if (force) {
    console.log("🔄 强制重新生成模式");
    return true;
  }

  // 读取缓存
  const cache = readCache(outputDir);

  if (!cache) {
    console.log("📝 未找到缓存，需要生成");
    return true;
  }

  // 检查版本
  if (cache.version !== CACHE_VERSION) {
    console.log("🔄 缓存版本不匹配，需要重新生成");
    return true;
  }

  // 检查输入源是否变化
  if (cache.input !== input) {
    console.log("🔄 输入源已变化，需要重新生成");
    return true;
  }

  // 检查输出目录是否变化
  if (cache.output !== path.resolve(outputDir)) {
    console.log("🔄 输出目录已变化，需要重新生成");
    return true;
  }

  // 计算当前内容的哈希值
  const currentHash = calculateHash(swaggerContent);

  // 比较哈希值
  if (cache.hash !== currentHash) {
    console.log("🔄 Swagger 内容已变化，需要重新生成");
    return true;
  }

  console.log("✅ Swagger 内容未变化，跳过生成");
  return false;
}

/**
 * 更新缓存
 */
export function updateCache(
  swaggerContent: string,
  input: string,
  outputDir: string
): void {
  const hash = calculateHash(swaggerContent);
  const metadata: Omit<CacheMetadata, "version"> = {
    hash,
    timestamp: Date.now(),
    input,
    output: path.resolve(outputDir),
  };

  writeCache(outputDir, metadata);
  console.log("💾 缓存已更新");
}
