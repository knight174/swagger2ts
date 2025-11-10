# Swagger2TS

从 OpenAPI/Swagger 规范生成类型安全的 TypeScript API 客户端，支持增量生成。

[English](./README.md) | 简体中文

## 特性

- **类型安全**: 使用 [Kubb](https://kubb.dev/) 生成 TypeScript 类型和完全类型化的 API 客户端
- **增量生成**: 智能缓存系统，当 Swagger 未变化时跳过重新生成
- **Swagger 2.0 支持**: 需要时自动转换为 OpenAPI 3.x
- **灵活配置**: 支持 CLI 参数、环境变量或配置文件
- **自定义补丁**: 内置和可扩展的补丁系统，用于处理非标准的 Swagger 格式
- **多 API 源**: 通过配置文件支持管理多个 API 源
- **可扩展**: 添加 Zod schemas、React Query hooks 或任何 Kubb 插件来扩展代码生成

## 快速开始

### 使用 npx（无需安装）

```bash
# 基本命令结构
npx @miaoosi/swagger2ts -i <swagger文件路径或URL> -o <输出目录>

# 从 Swagger 文件生成 API 客户端
npx @miaoosi/swagger2ts -i ./swagger.json -o ./src/api

# 从 URL 生成
npx @miaoosi/swagger2ts -i https://api.example.com/swagger.json -o ./src/api

# 将 Swagger 2.0 转换为 OpenAPI 3.x
npx @miaoosi/swagger2ts -i ./swagger-v2.json -o ./src/api --convert-to-v3
```

### 安装

> 需要 Node 版本 >= 20。如果你的项目使用较旧版本，请考虑使用 `npx` 代替。或者在另一个使用 node >= 20 的目录中安装。

```bash
# 使用 pnpm
pnpm add -D @miaoosi/swagger2ts

# 使用 npm
npm install --save-dev @miaoosi/swagger2ts

# 使用 yarn
yarn add -D @miaoosi/swagger2ts
```

然后运行：

```bash
npx swagger2ts -i <swagger文件路径或URL> -o <输出目录>
```

## CLI 选项

| 选项 | 别名 | 描述 |
|--------|-------|-------------|
| `--input <path>` | `-i` | Swagger 文件路径或 URL |
| `--output <path>` | `-o` | 输出目录 |
| `--config <path>` | `-c` | 配置文件路径 |
| `--source <names>` | `-s` | 要生成的源名称（逗号分隔，例如 v5,v7） |
| `--convert-to-v3` | | 将 Swagger 2.0 转换为 OpenAPI 3.x |
| `--force` | | 强制重新生成（跳过缓存检查） |
| `--no-cache` | | 与 `--force` 相同 |
| `--clean` | | 生成前清理输出目录 |
| `--env <path>` | | 加载特定的 `.env` 文件 |

## 配置方法

Swagger2TS 支持三种配置方法，优先级顺序如下：

### 1. 配置文件（推荐用于多个源）

在项目根目录创建 `swagger2ts.config.ts`（或 `.js`）文件：

```typescript
import { defineConfig } from '@miaoosi/swagger2ts';
import { builtinPatches } from '@miaoosi/swagger2ts/swagger-processor';

export default defineConfig({
  sources: {
    // API v5
    v5: {
      input: 'https://api.example.com/v5/swagger.json',
      output: './src/api/v5',
      convertToV3: true,
    },
    // API v7
    v7: {
      input: 'https://api.example.com/v7/swagger.json',
      output: './src/api/v7',
      convertToV3: true,
    },
    // 管理 API
    admin: {
      input: './swagger/admin.json',
      output: './src/api/admin',
      patches: [builtinPatches.giteeTimestamp],
    },
  },
  // 全局设置
  convertToV3: true,
  cache: true,
});
```

然后运行：

```bash
# 生成所有源
npx swagger2ts

# 仅生成特定源
npx swagger2ts --source v5,v7

# 使用 CLI 标志覆盖配置
npx swagger2ts --source v5 --force
```

**支持的配置文件名**（按此顺序搜索）：

- `swagger2ts.config.ts`
- `swagger2ts.config.mts`
- `swagger2ts.config.js`
- `swagger2ts.config.mjs`
- `.swagger2tsrc.ts`
- `.swagger2tsrc.mts`
- `.swagger2tsrc.js`
- `.swagger2tsrc.mjs`

### 2. CLI 参数

通过命令行直接传递输入/输出：

```bash
npx swagger2ts -i ./swagger.json -o ./src/api
npx swagger2ts -i https://api.com/swagger.json -o ./src/api --clean
```

### 3. 环境变量

在项目根目录创建 `.env` 文件：

```env
SWAGGER_INPUT=https://api.example.com/swagger.json
OUTPUT_PATH=./src/api
CONVERT_TO_V3=true
```

然后运行：

```bash
npx swagger2ts
```

你也可以指定自定义的 `.env` 文件：

```bash
npx swagger2ts --env .env.production
```

## 多环境设置

对于管理多个 API 版本或环境，使用配置文件方式：

```typescript
// swagger2ts.config.ts
import { defineConfig } from '@miaoosi/swagger2ts';

export default defineConfig({
  sources: {
    dev: {
      input: 'https://dev-api.example.com/swagger.json',
      output: './src/api/dev',
    },
    staging: {
      input: 'https://staging-api.example.com/swagger.json',
      output: './src/api/staging',
    },
    production: {
      input: 'https://api.example.com/swagger.json',
      output: './src/api/prod',
    },
  },
});
```

使用：

```bash
# 生成所有环境
npx swagger2ts

# 仅生成 dev
npx swagger2ts --source dev

# 生成 dev 和 staging
npx swagger2ts --source dev,staging
```

## 自定义 Swagger 补丁

补丁是在生成前转换 Swagger JSON 内容的函数。用于修复非标准格式。

**内置补丁：**

- `builtinPatches.giteeTimestamp`: 修复 Gitee 的非标准 "Timestamp" 类型

有关创建自定义补丁的示例，请参见 [examples/04-custom-patches.ts](./examples/04-custom-patches.ts)。

## 使用 Kubb 插件扩展

Swagger2TS 默认生成 TypeScript 类型和 API 客户端，但你可以通过添加 Kubb 插件来扩展功能，生成 Zod schemas、React Query hooks 等。

### 可用插件

- **[@kubb/plugin-zod](https://kubb.dev/plugins/plugin-zod/)** - 生成 Zod schemas 用于运行时验证
- **[@kubb/plugin-react-query](https://kubb.dev/plugins/plugin-react-query/)** - 生成 React Query hooks
- **[@kubb/plugin-swr](https://kubb.dev/plugins/plugin-swr/)** - 生成 SWR hooks
- **[@kubb/plugin-vue-query](https://kubb.dev/plugins/plugin-vue-query/)** - 生成 Vue Query composables
- **[@kubb/plugin-faker](https://kubb.dev/plugins/plugin-faker/)** - 使用 Faker.js 生成 mock 数据
- **[@kubb/plugin-msw](https://kubb.dev/plugins/plugin-msw/)** - 生成 MSW (Mock Service Worker) handlers

### 示例

```typescript
// swagger2ts.config.ts
import { defineConfig } from '@miaoosi/swagger2ts';
import { pluginZod } from '@kubb/plugin-zod';
import { pluginReactQuery } from '@kubb/plugin-react-query';

export default defineConfig({
  sources: {
    api: {
      input: 'https://api.example.com/swagger.json',
      output: './src/api',
      clientType: 'axios',

      // 添加 Kubb 插件
      kubb: {
        plugins: [
          // 生成 Zod schemas
          pluginZod({
            output: { path: './zod' },
            typed: true,
          }),

          // 生成 React Query hooks
          pluginReactQuery({
            output: { path: './hooks' },
            client: 'axios',
          }),
        ],
      },
    },
  },
});
```

**生成的目录结构：**

```bash
src/api/
├── types/         # ← TypeScript 类型（默认）
├── clients/axios/ # ← Axios 客户端（默认）
├── zod/          # ← Zod schemas（来自插件）
└── hooks/        # ← React Query hooks（来自插件）
```

更多示例请参见 [swagger2ts.config.example.ts](./swagger2ts.config.example.ts)。

## 生成的代码结构

运行生成器会创建以下结构：

```bash
{output}/
├── .api-gen-cache/
│   └── metadata.json              # 增量生成的缓存元数据
├── .temp/
│   └── swagger.json               # 处理后的 Swagger（补丁/转换后）
├── types/
│   ├── {Tag}/                     # 基于标签的分组
│   │   ├── {OperationId}.ts       # 每个操作的类型定义
│   │   └── index.ts
│   └── index.ts
├── clients/axios/                 # Axios 客户端（默认）
│   ├── {Tag}Service/
│   │   ├── {operationId}Client.ts # 单独的客户端函数
│   │   ├── {tag}Service.ts
│   │   └── index.ts
│   └── index.ts
├── client-config.ts               # 运行时配置助手
└── schemas/
    └── {schema}.json              # JSON schemas
```

## 使用示例

有关详细示例和代码样本，请参见 **[examples/](./examples/)** 目录。

**快速示例：**

- **[基本用法](./examples/01-basic-usage.ts)** - 具有类型安全的简单 API 调用
- **[身份验证](./examples/02-with-authentication.ts)** - 添加认证头
- **[多个 API 源](./examples/03-multiple-api-sources.ts)** - 管理多个 API
- **[自定义补丁](./examples/04-custom-patches.ts)** - 修复非标准 Swagger 格式
- **[环境变量](./examples/06-env-variables.sh)** - 使用 `.env` 文件
- **[Axios 客户端](./examples/07-axios-client.ts)** - 使用 Axios 而不是 Fetch

### 快速入门示例

```typescript
// 导入生成的类型和客户端
import type { GetUsersId } from "./api/types";
import { getUsersIdClient } from "./api/clients/axios";

// 进行类型安全的 API 调用
const response = await getUsersIdClient({
  params: { id: "123" }
});

if (response.ok) {
  const user: GetUsersId["response"] = await response.json();
  console.log(user);
}
```

有关所有示例的完整文档，请参见 [examples/README.md](./examples/README.md)。

## 增量生成

该工具使用 MD5 哈希来检测 Swagger 文件的变化：

- **首次运行**: 生成所有文件并将哈希存储在 `.api-gen-cache/metadata.json` 中
- **后续运行**: 如果 Swagger 内容未更改则跳过生成
- **强制重新生成**: 使用 `--force` 或 `--no-cache` 标志

```bash
# 正常运行 - 如果未更改将跳过
npx swagger2ts -i <swagger文件路径或URL> -o <输出目录>

# 强制重新生成
npx swagger2ts -i <swagger文件路径或URL> -o <输出目录> --force
```

## Swagger 2.0 支持

该工具可以自动将 Swagger 2.0 规范转换为 OpenAPI 3.x：

```bash
npx swagger2ts -i <swagger文件路径或URL> -o <输出目录> --convert-to-v3
```

这使用 [swagger2openapi](https://github.com/Mermade/oas-kit) 库，自动修补常见问题。

## 开发

### 项目设置

```bash
git clone <repo-url>
cd swagger2ts

# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 在开发模式下运行
# 从本地 Swagger 文件生成
pnpm run dev -i ./__mock__/swagger.json -o ./api/gen
pnpm run dev -i ./__mock__/swagger-v2.json -o ./api/gen-v2
pnpm run dev -i ./__mock__/swagger-v2.json -o ./api/gen-v3 --convert-to-v3
# 从远程 Swagger URL 生成
pnpm run dev -i https://petstore.swagger.io/v2/swagger.json -o ./api/petstore-v2
pnpm run dev -i https://petstore.swagger.io/v2/swagger.json -o ./api/petstore --convert-to-v3
```

### 脚本

- `pnpm run build`: 将 TypeScript 编译到 `dist/`
- `pnpm run dev`: 使用 tsx 在开发模式下运行 CLI
- `pnpm run prepublishOnly`: 发布前构建检查

### 项目结构

```bash
swagger2ts/
├── bin/
│   └── swagger2ts.ts              # CLI 入口点
├── src/
│   ├── cli.ts                     # CLI 参数解析
│   ├── generator.ts               # Kubb 包装器
│   ├── incremental.ts             # 缓存系统
│   ├── swagger-processor.ts       # Swagger 补丁和转换
│   └── types.ts                   # TypeScript 定义
├── templates/
│   └── base.config.ts             # 可重用的 Kubb 配置
├── examples/
│   ├── 01-basic-usage.ts          # 基本用法示例
│   ├── 02-with-authentication.ts
│   ├── 03-multiple-api-sources.ts
│   ├── 04-custom-patches.ts
│   ├── 06-env-variables.sh
│   ├── 07-axios-client.ts
│   ├── 08-runtime-baseurl.ts
│   ├── 09-config-with-client-type.ts
│   └── README.md                  # 示例文档
└── __mock__/
    └── swagger.json               # 演示 Swagger 文件
```

## 故障排除

### "Timestamp" 类型错误

如果遇到非标准 "Timestamp" 类型的错误（Gitee API 常见），你可以创建自定义补丁。有关如何实现补丁函数，请参见 [examples/04-custom-patches.ts](./examples/04-custom-patches.ts)。

> **注意：** 通过配置文件的内置补丁支持计划在未来版本中推出。

### 缓存问题

如果怀疑缓存损坏：

```bash
# 强制重新生成
npx swagger2ts -i ./swagger.json -o ./src/api --force

# 或删除缓存目录
rm -rf ./src/api/.api-gen-cache
```

### 验证错误

对于 Swagger 2.0 验证错误：

```bash
# 首先转换为 OpenAPI 3.x
npx swagger2ts -i ./swagger.json -o ./src/api --convert-to-v3
```

## 迁移指南

### 从直接使用 Kubb

用 Swagger2TS CLI 替换你的 Kubb 配置：

**之前：**

```typescript
// kubb.config.ts
export default {
  input: { path: './swagger.json' },
  output: { path: './src/api' },
  // ... 复杂的插件配置
}
```

**之后：**

```bash
npx swagger2ts -i ./swagger.json -o ./src/api
```

所有插件配置由 `templates/base.config.ts` 处理。

## 贡献

欢迎贡献！请随时提交问题或拉取请求。

## 许可证

MIT

## 致谢

使用 [Kubb](https://kubb.dev/) 构建 - 终极 OpenAPI 代码生成器。
