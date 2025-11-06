import { build } from "@kubb/core";
import type { UserConfig } from "@kubb/core";
import type { GeneratorOptions } from "./types.js";
import { getCommonConfig } from "../templates/base.config.js";

/**
 * 使用 Kubb 生成 API 客户端
 */
export async function generateAPI(options: GeneratorOptions): Promise<void> {
  const { input, output, clean = false } = options;

  console.log("🚀 开始生成 API 客户端...");
  console.log(`   输入：${input}`);
  console.log(`   输出：${output}`);

  const config: UserConfig = {
    ...getCommonConfig(),
    input: {
      path: input,
    },
    output: {
      path: output,
      clean,
    },
  };

  try {
    await build({
      config,
    });

    console.log("✅ API 客户端生成完成");
  } catch (error) {
    console.error("❌ 生成失败：", error);
    throw error;
  }
}
