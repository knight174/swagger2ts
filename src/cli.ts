import path from "path";
import { config as loadEnv } from "dotenv";
import chalk from "chalk";
import type { CliOptions, PatchFunction, ApiSource } from "./types.js";
import {
  processSwagger,
  saveTempSwagger,
} from "./swagger-processor.js";
import { shouldRegenerate, updateCache } from "./incremental.js";
import { generateAPI } from "./generator.js";
import {
  findConfigFile,
  loadConfigFile,
} from "./config-loader.js";

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

  const cwd = process.cwd();

  // 1. 尝试加载配置文件
  const configPath = findConfigFile(cwd, options.config);

  if (configPath) {
    console.log(chalk.blue(`📋 使用配置文件: ${configPath}\n`));
    const config = await loadConfigFile(configPath);
    await runWithConfig(config, options);
  } else {
    // 2. 单一生成模式 (使用 CLI 参数或环境变量)
    await runSingle(options);
  }
}

/**
 * 使用配置文件的多源生成模式
 */
async function runWithConfig(
  config: import("./types.js").Swagger2TsConfig,
  options: CliOptions
): Promise<void> {
  if (!config.sources || Object.keys(config.sources).length === 0) {
    console.error(chalk.red("❌ 配置文件中未定义任何 sources"));
    process.exit(1);
  }

  // 解析 --source 参数
  const requestedSources = options.source
    ? options.source.split(",").map((s) => s.trim())
    : Object.keys(config.sources);

  // 验证请求的源是否存在
  for (const sourceName of requestedSources) {
    if (!config.sources[sourceName]) {
      console.error(
        chalk.red(`❌ 配置文件中未找到源: "${sourceName}"`)
      );
      console.log(
        chalk.gray(`可用的源: ${Object.keys(config.sources).join(", ")}`)
      );
      process.exit(1);
    }
  }

  console.log(
    chalk.cyan(
      `📦 将生成 ${requestedSources.length} 个源: ${requestedSources.join(", ")}\n`
    )
  );

  // 逐个生成
  for (const sourceName of requestedSources) {
    const source = config.sources[sourceName];
    console.log(chalk.cyan.bold(`\n▶ 生成源: ${sourceName}`));

    // 合并配置: 全局配置 + 源配置 + CLI 覆盖
    const mergedSource: ApiSource = {
      ...source,
      convertToV3: options.convertToV3 ?? source.convertToV3 ?? config.convertToV3 ?? false,
      clean: options.clean ?? source.clean ?? false,
      patches: [
        ...(config.patches || []),
        ...(source.patches || []),
      ],
    };

    await runSourceGeneration(sourceName, mergedSource, options);
  }

  console.log(chalk.green.bold("\n✅ 所有源已生成完成！\n"));
}

/**
 * 单一源生成
 */
async function runSingle(options: CliOptions): Promise<void> {
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
          "  1. 创建配置文件: swagger2ts.config.ts\n" +
          "  2. 指定输入输出：-i <input> -o <output>\n" +
          "  3. 使用环境变量：SWAGGER_INPUT 和 OUTPUT_PATH\n"
      )
    );
    process.exit(1);
  }

  // 解析路径
  input = input.startsWith("http") ? input : path.resolve(input);
  output = path.resolve(output);

  console.log(chalk.gray(`📥 输入：${input}`));
  console.log(chalk.gray(`📤 输出：${output}\n`));

  const source: ApiSource = {
    input,
    output,
    convertToV3,
    clean,
    patches,
  };

  await runSourceGeneration("default", source, options);

  console.log(chalk.green.bold("\n✅ 完成！\n"));
}

/**
 * 执行单个源的生成
 */
async function runSourceGeneration(
  sourceName: string,
  source: ApiSource,
  options: CliOptions
): Promise<void> {
  const { input, output, convertToV3 = false, clean = false, patches = [] } = source;

  // 解析路径
  const resolvedInput = input.startsWith("http") ? input : path.resolve(input);
  const resolvedOutput = path.resolve(output);

  console.log(chalk.gray(`  📥 输入：${resolvedInput}`));
  console.log(chalk.gray(`  📤 输出：${resolvedOutput}`));

  try {
    // 处理 Swagger（获取、补丁、转换）
    const processed = await processSwagger(resolvedInput, {
      patches,
      convertToV3,
    });

    // 检查是否需要重新生成
    const needsRegeneration = shouldRegenerate(
      processed.content,
      resolvedInput,
      resolvedOutput,
      options.force || options.noCache || false
    );

    if (!needsRegeneration) {
      console.log(
        chalk.green("  ✨ 内容未变化，跳过生成。使用 --force 强制重新生成。")
      );
      return;
    }

    // 保存到临时文件
    const tempFile = saveTempSwagger(processed.content, resolvedOutput);
    console.log(chalk.gray(`  💾 临时文件：${tempFile}`));

    // 生成 API 客户端
    await generateAPI({
      input: tempFile,
      output: resolvedOutput,
      clean,
    });

    // 更新缓存
    updateCache(processed.content, resolvedInput, resolvedOutput);

    console.log(chalk.green(`  ✅ 源 "${sourceName}" 生成完成`));
  } catch (error) {
    console.error(
      chalk.red(`  ❌ 源 "${sourceName}" 生成失败：`),
      error instanceof Error ? error.message : error
    );
    throw error;
  }
}
