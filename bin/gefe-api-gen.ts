#!/usr/bin/env node

import { cac } from "cac";
import { run } from "../src/cli.js";
import type { CliOptions } from "../src/types.js";

const cli = cac("gefe-api-gen");

cli
  .command("[action]", "生成 API 客户端")
  .option("-i, --input <path>", "Swagger 文件路径或 URL")
  .option("-o, --output <path>", "输出目录")
  .option("--source <name>", "使用预定义的 API 源 (demo, gitee)")
  .option("--convert-to-v3", "将 Swagger 2.0 转换为 OpenAPI 3.x")
  .option("--no-cache", "跳过增量检查，强制重新生成")
  .option("--clean", "清空输出目录")
  .option("--force", "强制重新生成（同 --no-cache）")
  .option("--env <path>", "加载指定的 .env 文件")
  .action(async (action, options: CliOptions) => {
    await run(options);
  });

cli.help();
cli.version(require("../../package.json").version);

cli.parse();
