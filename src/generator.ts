import { build } from "@kubb/core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { GeneratorOptions } from "./types.js";
import { createApiConfig } from "../templates/base.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 复制客户端配置模板文件
 */
function copyClientConfigTemplate(
  outputDir: string,
  clientType: "fetch" | "axios"
): void {
  const templateFileName = `client-config.${clientType}.template.ts`;
  const possiblePaths = [
    // 开发模式 (tsx 直接运行)
    path.join(process.cwd(), "templates", templateFileName),
    // 构建模式 (从 dist/src 到项目根的 templates)
    path.join(__dirname, "../../templates", templateFileName),
  ];

  let templatePath: string | undefined;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      templatePath = p;
      break;
    }
  }

  if (!templatePath) {
    console.warn(`⚠️  客户端配置模板文件不存在，尝试的路径:`, possiblePaths);
    return;
  }

  const targetPath = path.join(outputDir, "client-config.ts");

  // 如果目标文件已存在，不覆盖（用户可能已自定义）
  if (fs.existsSync(targetPath)) {
    console.log(`  ℹ️  client-config.ts 已存在，跳过覆盖`);
    return;
  }

  // 复制模板文件
  try {
    fs.copyFileSync(templatePath, targetPath);
    console.log(`  ✨ 已生成 client-config.ts`);
  } catch (error) {
    console.warn(`⚠️  复制客户端配置文件失败:`, error);
  }
}

/**
 * 使用 Kubb 生成 API 客户端
 */
export async function generateAPI(options: GeneratorOptions): Promise<void> {
  const {
    input,
    output,
    clean = false,
    clientType = "axios",
    baseURL,
    kubbOptions,
  } = options;

  console.log("🚀 开始生成 API 客户端...");

  const config = createApiConfig({
    input,
    output,
    clean,
    clientType,
    baseURL,
    kubbOptions,
  });

  try {
    await build({
      config,
    });

    // 生成完成后，复制客户端配置模板
    copyClientConfigTemplate(output, clientType);

    console.log("✅ API 客户端生成完成");
  } catch (error) {
    console.error("❌ 生成失败：", error);
    throw error;
  }
}
