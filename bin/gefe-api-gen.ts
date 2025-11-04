#!/usr/bin/env node

import { cac } from "cac";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { run } from "../src/cli.js";
import type { CliOptions } from "../src/types.js";

// 获取当前文件的目录路径（ESM 中的 __dirname 替代方案）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取 package.json 获取版本号
// 开发模式：bin/gefe-api-gen.ts -> 向上一级
// 编译后：dist/bin/gefe-api-gen.js -> 向上两级
// 尝试向上两级（编译后），如果失败则向上一级（开发模式）
let packageJson: { version: string };
try {
  packageJson = JSON.parse(
    readFileSync(join(__dirname, "../../package.json"), "utf-8")
  );
} catch {
  packageJson = JSON.parse(
    readFileSync(join(__dirname, "../package.json"), "utf-8")
  );
}

const cli = cac("gefe-api-gen");

cli
  .command("[action]", "生成 API 客户端")
  .option("-i, --input <path>", "Swagger 文件路径或 URL")
  .option("-o, --output <path>", "输出目录")
  .option("--convert-to-v3", "将 Swagger 2.0 转换为 OpenAPI 3.x")
  .option("--no-cache", "跳过增量检查，强制重新生成")
  .option("--clean", "清空输出目录")
  .option("--force", "强制重新生成（同 --no-cache）")
  .option("--env <path>", "加载指定的 .env 文件")
  .action(async (_action, options: CliOptions) => {
    await run(options);
  });

cli.help();
cli.version(packageJson.version);

cli.parse();
