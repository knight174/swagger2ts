# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gefe API Generator is a TypeScript-based CLI tool that generates type-safe API clients and TypeScript definitions from OpenAPI/Swagger specifications using Kubb. It's designed as an npx-executable package with support for incremental generation, Swagger 2.0 conversion, custom patches, and multiple configuration methods.

## Key Commands

### Build the Project
```bash
pnpm run build
```
Compiles TypeScript source files to `dist/` directory.

### Development Mode
```bash
pnpm run dev
```
Runs the CLI directly with `tsx` without compiling (useful for development).

### Generate API Clients (Legacy)
```bash
pnpm run generate:api
```
Uses the legacy Kubb config (`kubb.config.ts`) to generate API clients. Runs `prekubb` hook first to patch Swagger files.

### CLI Usage (Primary Method)
```bash
# Using npx
npx gefe-api-gen -i ./swagger.json -o ./dist/api

# Using pnpm dev for development
pnpm dev -- -i ./swagger.json -o ./dist/api

# Common options
npx gefe-api-gen --source demo              # Use predefined source
npx gefe-api-gen --source gitee --convert-to-v3  # Convert Swagger 2.0
npx gefe-api-gen -i ./swagger.json -o ./dist --force  # Force regeneration
npx gefe-api-gen --env .env.production       # Load specific .env file
```

## Architecture

The project follows a modular architecture with clear separation between CLI, Swagger processing, caching, and code generation:

### Core Modules

**`src/cli.ts`** - Main CLI Logic
- Parses command-line options using `cac`
- Supports three configuration sources (priority order):
  1. Predefined sources (`--source demo|gitee`)
  2. CLI parameters (`-i`, `-o`)
  3. Environment variables (`SWAGGER_INPUT`, `OUTPUT_PATH`)
- Coordinates the entire generation workflow

**`src/swagger-processor.ts`** - Swagger Processing Pipeline
- Fetches Swagger from local files or URLs
- Applies custom patches to fix non-standard formats
- Detects Swagger version (2.0 vs OpenAPI 3.x)
- Converts Swagger 2.0 to OpenAPI 3.x using `swagger2openapi`
- Built-in patches: `builtinPatches.giteeTimestamp` fixes Gitee's non-standard "Timestamp" type

**`src/incremental.ts`** - Incremental Generation System
- MD5 hash-based change detection to skip unchanged Swagger files
- Stores cache metadata in `{output}/.api-gen-cache/metadata.json`
- Cache includes: hash, timestamp, input source, output path, version
- Use `--force` or `--no-cache` to bypass incremental checks

**`src/generator.ts`** - Kubb Generator Wrapper
- Wraps Kubb's `build()` function with consistent configuration
- Uses common config from `templates/base.config.ts`
- Handles input/output paths and clean options

**`src/types.ts`** - TypeScript Type Definitions
- Defines all interfaces: `CliOptions`, `ApiSource`, `GefeConfig`, `CacheMetadata`, etc.
- `PatchFunction` type for custom Swagger patches

**`templates/base.config.ts`** - Reusable Kubb Configuration
- Exports `getCommonConfig()` - returns standard Kubb plugin configuration
- Exports `createApiConfig()` - factory function for creating custom configs
- Plugin chain:
  1. `pluginOas()` - Parses OpenAPI/Swagger specs
  2. `pluginTs()` - Generates TypeScript types grouped by tag
  3. `pluginClient()` - Generates fetch-based API clients

### Configuration System

The tool supports multiple configuration methods:

**1. Predefined Sources** (`src/cli.ts`)
```typescript
const PREDEFINED_SOURCES = {
  demo: {
    input: "./swaggers/demo.json",
    output: "./dist/demo",
  },
  gitee: {
    input: "https://gitee.com/api/v5/doc_json",
    output: "./dist/giteeV8",
    convertToV3: true,
    patches: [builtinPatches.giteeTimestamp],
  },
};
```

**2. Environment Variables** (`.env` file)
- `SWAGGER_INPUT` - Input Swagger file/URL
- `OUTPUT_PATH` - Output directory
- `CONVERT_TO_V3` - Convert Swagger 2.0 to OpenAPI 3.x

**3. Project Config File** (`gefe.config.ts`)
See `gefe.config.example.ts` for structure. Supports:
- Multiple API sources
- Global and per-source patches
- Cache settings
- Swagger 2.0 conversion toggle

### Generated Code Structure

Output directory structure:
```
{output}/
├── .api-gen-cache/
│   └── metadata.json          # Cache metadata for incremental generation
├── .temp/
│   └── swagger.json           # Processed Swagger (after patches/conversion)
├── types/
│   ├── {Tag}Controller/
│   │   ├── {OperationId}.ts   # Type definitions per operation
│   │   └── index.ts
│   └── index.ts
├── clients/fetch/
│   ├── {Tag}Service/
│   │   ├── {operationId}Client.ts  # Individual client functions
│   │   ├── {tag}Service.ts
│   │   └── index.ts
│   ├── operations.ts
│   └── index.ts
└── schemas/                    # JSON schemas
```

### Kubb Plugin Configuration Details

From `templates/base.config.ts`:

**TypeScript Plugin (`pluginTs`)**:
- Groups types by OpenAPI tag → `{Tag}Controller`
- Enum handling: `asConst` type with `Enum` suffix
- Optional types: `questionTokenAndUndefined` (both `?` and `| undefined`)

**Client Plugin (`pluginClient`)**:
- Client type: `fetch` (native fetch API)
- Return type: `full` (returns complete response object)
- Path params: `object` format
- Name transformer: Adds `Client` suffix to function names
- Excludes tags matching pattern `"store"`
- Banner: `/* eslint-disable no-alert, no-console */`

### Workflow

The typical generation workflow:

1. **CLI parses options** - Determines input/output from CLI args, predefined sources, or env vars
2. **Fetch Swagger** - Downloads from URL or reads from file (`fetchSwagger`)
3. **Apply patches** - Runs custom patch functions to fix non-standard types (`applyPatches`)
4. **Detect version** - Identifies Swagger 2.0 vs OpenAPI 3.x (`detectSwaggerVersion`)
5. **Convert if needed** - Converts Swagger 2.0 → OpenAPI 3.x if `convertToV3` is enabled
6. **Check cache** - Compares MD5 hash with cached version (`shouldRegenerate`)
7. **Save temp file** - Writes processed Swagger to `{output}/.temp/swagger.json`
8. **Generate code** - Runs Kubb with common config (`generateAPI`)
9. **Update cache** - Saves new hash to cache metadata (`updateCache`)

### Development Patterns

**Adding a New Predefined Source**:
Edit `PREDEFINED_SOURCES` in `src/cli.ts`:
```typescript
myapi: {
  input: "https://api.example.com/swagger.json",
  output: "./dist/myapi",
  convertToV3: true,
  patches: [builtinPatches.giteeTimestamp, customPatch],
}
```

**Creating a Custom Patch**:
```typescript
const customPatch: PatchFunction = (content: string) => {
  return content.replace(/"type": "MyCustomType"/g, '"type": "string"');
};
```

**Bypassing Cache**:
Use `--force` or `--no-cache` flags, or delete `{output}/.api-gen-cache/` directory.
