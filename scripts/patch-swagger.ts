import fs from "fs";
import path from "path";

/**
 * Generic Swagger patch script
 *
 * Usage:
 *   tsx scripts/patch-swagger.ts <swagger-url> <output-path>
 *
 * Examples:
 *   tsx scripts/patch-swagger.ts https://api.example.com/swagger.json ./swagger.json
 *   tsx scripts/patch-swagger.ts https://gitee.com/api/v5/doc_json ./swagger-v5.json
 */

// Parse command line arguments
const url = process.argv[2];
const outputPath = process.argv[3];

if (!url || !outputPath) {
  console.error(`❌ Usage: tsx scripts/patch-swagger.ts <swagger-url> <output-path>`);
  process.exit(1);
}

const localPath = path.resolve(outputPath);

async function main() {
  console.log(`📥 Fetching Swagger from: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`❌ Failed to fetch swagger: ${res.statusText}`);

  let text = await res.text();

  // Fix non-standard "Timestamp" type (common in Gitee API)
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
