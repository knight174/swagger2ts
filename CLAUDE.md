# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Swagger2TS is a TypeScript-based CLI tool that generates type-safe API clients and TypeScript definitions from OpenAPI/Swagger specifications using Kubb. It's designed as an npx-executable package with support for incremental generation, Swagger 2.0 conversion, custom patches, and multiple configuration methods.

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
npx @miaoosi/swagger2ts -i ./swagger.json -o ./dist/api

# Using pnpm dev for development (without --)
pnpm dev -i ./swagger.json -o ./dist/api

# Common options
npx @miaoosi/swagger2ts -i ./swagger.json -o ./dist --force  # Force regeneration
npx @miaoosi/swagger2ts --env .env.production       # Load specific .env file
npx @miaoosi/swagger2ts -i ./swagger.json -o ./dist --convert-to-v3  # Convert Swagger 2.0
```

## Architecture

The project follows a modular architecture with clear separation between CLI, Swagger processing, caching, and code generation:

### Core Modules

**`src/cli.ts`** - Main CLI Logic
- Parses command-line options using `cac`
- Supports two configuration sources (priority order):
  1. CLI parameters (`-i`, `-o`)
  2. Environment variables (`SWAGGER_INPUT`, `OUTPUT_PATH`)
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
- Exports `getCommonConfig()` - returns standard Kubb plugin configuration for Fetch clients
- Exports `createApiConfig()` - factory function for creating custom configs
- Plugin chain:
  1. `pluginOas()` - Parses OpenAPI/Swagger specs
  2. `pluginTs()` - Generates TypeScript types grouped by tag
  3. `pluginClient()` - Generates fetch-based API clients

**`templates/axios-client.config.ts`** - Axios Client Configuration
- Exports `getAxiosConfig()` - returns Kubb plugin configuration for Axios clients
- Exports `createAxiosConfig()` - factory function for Axios-based configs
- Use when you need Axios features like interceptors, request cancellation, etc.
- Requires `axios` to be installed in the consuming project

### Configuration System

The tool supports multiple configuration methods:

**1. CLI Parameters**
```bash
npx @miaoosi/swagger2ts -i ./swagger.json -o ./src/api
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

1. **CLI parses options** - Determines input/output from CLI args or env vars
2. **Fetch Swagger** - Downloads from URL or reads from file (`fetchSwagger`)
3. **Apply patches** - Runs custom patch functions to fix non-standard types (`applyPatches`)
4. **Detect version** - Identifies Swagger 2.0 vs OpenAPI 3.x (`detectSwaggerVersion`)
5. **Convert if needed** - Converts Swagger 2.0 → OpenAPI 3.x if `convertToV3` is enabled
6. **Check cache** - Compares MD5 hash with cached version (`shouldRegenerate`)
7. **Save temp file** - Writes processed Swagger to `{output}/.temp/swagger.json`
8. **Generate code** - Runs Kubb with common config (`generateAPI`)
9. **Update cache** - Saves new hash to cache metadata (`updateCache`)

### Development Patterns

**Creating a Custom Patch**:
```typescript
const customPatch: PatchFunction = (content: string) => {
  return content.replace(/"type": "MyCustomType"/g, '"type": "string"');
};
```

**Bypassing Cache**:
Use `--force` or `--no-cache` flags, or delete `{output}/.api-gen-cache/` directory.

## Important Notes

**TypeScript Configuration**:
- Project uses ESM (`"type": "module"` in package.json)
- Target: ES2022, moduleResolution: bundler
- All imports must include `.js` extension (e.g., `import { run } from "../src/cli.js"`)
- Source files compiled from root directory to `dist/`

**Entry Point**:
- Binary entry: `bin/swagger2ts.ts` → compiles to `dist/bin/swagger2ts.js`
- Uses shebang `#!/usr/bin/env node` for CLI execution
- CLI framework: `cac` for argument parsing

**Testing During Development**:
```bash
# Test CLI without building (Note: do NOT use -- with pnpm dev)
pnpm dev -i ./swagger.json -o ./dist/test

# Build and test as it would be installed
pnpm run build
node dist/bin/swagger2ts.js -i ./swagger.json -o ./dist/test
```

## Examples Directory

The `examples/` directory contains practical code samples demonstrating various use cases:

- **`01-basic-usage.ts`** - Simple API calls with type safety
- **`02-with-authentication.ts`** - Adding authentication headers
- **`03-multiple-api-sources.ts`** - Managing multiple API sources
- **`04-custom-patches.ts`** - Creating custom patch functions
- **`05-config-file.ts`** - Using `gefe.config.ts` for advanced configuration
- **`06-env-variables.sh`** - Environment variable configuration
- **`07-axios-client.ts`** - Using Axios instead of Fetch
- **`README.md`** - Complete examples documentation

When adding new features, consider adding a corresponding example to help users understand the functionality.

## Client Types

The generator supports two client types:

**Fetch Client (Default)**:
- Uses native `fetch` API
- No additional dependencies
- Configuration: `templates/base.config.ts`
- Output: `{output}/clients/fetch/`

**Axios Client**:
- Uses Axios library for HTTP requests
- Requires `axios` dependency in consuming project
- Configuration: `templates/axios-client.config.ts`
- Output: `{output}/clients/axios/`
- Benefits: Request/response interceptors, automatic JSON transformation, request cancellation, better error handling

To use Axios client, users would need to create a custom generator script importing from `templates/axios-client.config.ts`.

