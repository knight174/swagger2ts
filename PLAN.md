# 实施计划：将 gefe-api-generator 改造为灵活的 npx 工具

## 目标
1. **灵活配置**：CLI 参数 + 配置模板 + 环境变量，三种方式结合
2. **增量生成**：基于哈希检测，跳过未变化的 Swagger 文件
3. **Swagger 2.0 支持**：修复验证问题 + 可选转换为 OpenAPI 3.x
4. **npx 可执行**：可通过 `npx @yourorg/gefe-api-gen` 直接运行

## 实施步骤

### 1. 项目结构重构
- 新增 `bin/` 目录，放置 CLI 入口文件
- 将当前配置移到 `templates/` 目录便于复用
- 创建 `src/` 目录存放核心逻辑（补丁、转换、生成）
- package.json 添加 `bin` 字段支持 npx

### 2. 增强 Swagger 处理器（`src/swagger-processor.ts`）
- 合并当前 `scripts/patch-swagger.ts` 的功能
- 新增 Swagger 2.0 → OpenAPI 3.x 转换器（使用 `swagger2openapi` 库）
- 可扩展的验证/补丁系统（不只是 Timestamp 修复）
- 导出可复用函数，支持自定义补丁

### 3. 增量生成系统（`src/incremental.ts`）
- 基于 MD5 哈希的变更检测
- 在 `.api-gen-cache/` 存储哈希值和元数据
- 如果 swagger 哈希匹配缓存，跳过生成
- 提供 `--force` 参数强制重新生成

### 4. CLI 工具（`bin/gefe-api-gen.ts`）
```bash
# 使用示例：
npx gefe-api-gen -i ./swagger.json -o ./src/api
npx gefe-api-gen --url https://api.com/swagger --output ./generated
npx gefe-api-gen --config ./custom-config.ts
npx gefe-api-gen --source gitee --convert-to-v3
```

CLI 功能参数：
- `-i, --input`：输入文件或 URL
- `-o, --output`：输出目录
- `--config`：自定义 kubb 配置文件路径
- `--source`：预定义数据源（demo、gitee 等）
- `--convert-to-v3`：将 Swagger 2.0 转换为 OpenAPI 3.x
- `--no-cache`：跳过增量检查，强制重新生成
- `--clean`：清空输出目录
- `--env`：加载指定 .env 文件

### 5. 配置系统

**a) 配置模板**（`templates/` 目录）
- `base.config.ts`：通用插件配置
- `fetch-client.config.ts`：基于 Fetch 的客户端配置
- `axios-client.config.ts`：Axios 客户端配置（备选方案）
- 工厂函数：`createApiConfig(options)` 快速创建配置

**b) 环境变量支持**（`.env` 文件）
```env
SWAGGER_INPUT=https://api.example.com/swagger.json
OUTPUT_PATH=./src/generated
API_BASE_URL=https://api.example.com
CONVERT_TO_V3=true
ENABLE_CACHE=true
```

**c) 项目配置文件**（`gefe.config.ts`）
```typescript
// 用户可在项目根目录创建此文件
export default {
  sources: {
    main: { input: './swagger.json', output: './src/api' },
    admin: { input: './admin-swagger.json', output: './src/admin-api' }
  },
  patches: [/* 自定义补丁函数 */],
  convertToV3: true,
  cache: true
}
```

### 6. package.json 更新
- 添加 `bin` 字段，指向 CLI 入口
- 添加依赖：
  - `swagger2openapi`（转换器）
  - `commander` 或 `cac`（CLI 框架）
  - `dotenv`（环境变量）
  - `chalk`（终端颜色输出）
- 添加 `files` 字段，只发布必要文件
- 设置 `publishConfig` 用于发布到 npm
- 添加脚本：`build`（编译）、`prepublishOnly`（发布前检查）

### 7. 文档编写
- 更新 README.md：
  - npx 使用示例
  - 配置指南（三种配置方式）
  - 模板自定义说明
  - 从当前版本迁移的指南
- 创建 `examples/` 目录，提供常见使用场景示例

### 8. TypeScript 构建配置
- 添加 `tsconfig.json` 用于编译
- 设置构建输出到 `dist/`
- 确保 bin 文件有正确的 shebang（`#!/usr/bin/env node`）
- 配置 ES 模块或 CommonJS 模块格式

## 文件变更汇总

**新增文件：**
- `bin/gefe-api-gen.ts` - CLI 入口
- `src/cli.ts` - CLI 参数解析与调度
- `src/swagger-processor.ts` - Swagger 补丁与转换
- `src/incremental.ts` - 基于哈希的缓存逻辑
- `src/generator.ts` - Kubb 生成器封装
- `src/types.ts` - TypeScript 类型定义
- `templates/base.config.ts` - 可复用配置模板
- `templates/fetch-client.config.ts` - Fetch 客户端配置
- `templates/axios-client.config.ts` - Axios 客户端配置
- `tsconfig.json` - TypeScript 配置
- `.env.example` - 环境变量示例
- `gefe.config.example.ts` - 项目配置示例

**修改文件：**
- `package.json` - 添加 bin、依赖、构建脚本
- `kubb.config.ts` - 简化，使用新的模板系统
- `README.md` - 完全重写，改为 npx 使用说明
- `CLAUDE.md` - 更新架构说明
- `.gitignore` - 添加 .api-gen-cache、dist 等

**删除/重构文件：**
- `scripts/patch-swagger.js` - 合并到 swagger-processor
- `config/index.ts` - 移动到 templates/base.config.ts

## 测试策略
实施完成后测试：
1. `npx . -i ./swaggers/demo.json -o ./test-output` - 基本生成
2. 再次运行，验证增量跳过功能
3. 修改 swagger 文件，验证重新生成
4. 测试 Swagger 2.0 规范 + `--convert-to-v3` 参数
5. 测试环境变量加载
6. 测试自定义配置文件
7. 测试预定义数据源（--source gitee）

## 实施优先级
1. 高优先级（核心功能）：
   - TypeScript 构建配置
   - Swagger 处理器（补丁 + 转换）
   - 增量生成系统
   - CLI 工具基础框架

2. 中优先级（易用性）：
   - 配置模板系统
   - 环境变量支持
   - package.json 配置

3. 低优先级（文档）：
   - README 更新
   - 示例代码
   - CLAUDE.md 更新
