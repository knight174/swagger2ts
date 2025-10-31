import fs from "fs";
import path from "path";

// 1. 从命令行获取目标路径，如果没有提供，则使用默认值
const customPath = process.argv[2];
const localPath = customPath
  ? path.resolve(customPath) // 使用传入的路径
  : path.resolve("./swagger-v5.json"); // 默认路径

const url = "https://gitee.com/api/v5/doc_json";

async function main() {
  console.log(`📥 Fetching Swagger from: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`❌ Failed to fetch swagger: ${res.statusText}`);

  let text = await res.text();

  // 修复不规范的 Timestamp 类型
  text = text.replace(
    /"type":\s*"Timestamp"/gi,
    `"type": "string", "format": "date-time"`
  );
  text = text.replace(
    /"type":\s*"TimeStamp"/gi,
    `"type": "string", "format": "date-time"`
  );

  fs.writeFileSync(localPath, text);
  console.log(`✅ Swagger saved to ${localPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
