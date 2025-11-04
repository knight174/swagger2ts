import path from "path";
import { config as loadEnv } from "dotenv";
import chalk from "chalk";
import type { CliOptions, PatchFunction } from "./types.js";
import {
  processSwagger,
  saveTempSwagger,
} from "./swagger-processor.js";
import { shouldRegenerate, updateCache } from "./incremental.js";
import { generateAPI } from "./generator.js";

/**
 * 主 CLI 逻辑
 */
export async function run(options: CliOptions): Promise<void> {
  console.log(chalk.cyan.bold("\n🚀 Swagger2TS\n"));

  // 加载环境变量
  if (options.env) {
    loadEnv({ path: options.env });
    console.log(chalk.gray(`📦 加载环境变量：${options.env}\n`));
  } else {
    loadEnv();
  }

  // 确定输入和输出
  let input: string;
  let output: string;
  let convertToV3 = options.convertToV3 || false;
  let clean = options.clean || false;
  let patches: PatchFunction[] = [];

  // 1. 从 CLI 参数获取
  if (options.input && options.output) {
    input = options.input;
    output = options.output;
  }
  // 2. 从环境变量获取
  else if (process.env.SWAGGER_INPUT && process.env.OUTPUT_PATH) {
    input = process.env.SWAGGER_INPUT;
    output = process.env.OUTPUT_PATH;
    convertToV3 =
      process.env.CONVERT_TO_V3 === "true" ? true : convertToV3;

    console.log(chalk.blue("📌 使用环境变量配置"));
  }
  // 3. 错误：缺少必要参数
  else {
    console.error(chalk.red("❌ 缺少必要参数"));
    console.log(
      chalk.gray(
        "\n使用方式:\n" +
          "  1. 指定输入输出：-i <input> -o <output>\n" +
          "  2. 使用环境变量：SWAGGER_INPUT 和 OUTPUT_PATH\n"
      )
    );
    process.exit(1);
  }

  // 解析路径
  input = input.startsWith("http") ? input : path.resolve(input);
  output = path.resolve(output);

  console.log(chalk.gray(`📥 输入：${input}`));
  console.log(chalk.gray(`📤 输出：${output}\n`));

  try {
    // 处理 Swagger（获取、补丁、转换）
    const processed = await processSwagger(input, {
      patches,
      convertToV3,
    });

    // 检查是否需要重新生成
    const needsRegeneration = shouldRegenerate(
      processed.content,
      input,
      output,
      options.force || options.noCache || false
    );

    if (!needsRegeneration) {
      console.log(
        chalk.green("\n✨ 内容未变化，跳过生成。使用 --force 强制重新生成。\n")
      );
      return;
    }

    // 保存到临时文件
    const tempFile = saveTempSwagger(processed.content, output);
    console.log(chalk.gray(`💾 临时文件：${tempFile}\n`));

    // 生成 API 客户端
    await generateAPI({
      input: tempFile,
      output,
      clean,
    });

    // 更新缓存
    updateCache(processed.content, input, output);

    console.log(chalk.green.bold("\n✅ 完成！\n"));
  } catch (error) {
    console.error(
      chalk.red("\n❌ 生成失败："),
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}
