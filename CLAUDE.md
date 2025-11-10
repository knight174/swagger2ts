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

### CLI Usage (Primary Method)
```bash
# Single source generation
npx @miaoosi/swagger2ts -i ./swagger.json -o ./dist/api

# Multi-source generation with config file
npx @miaoosi/swagger2ts  # Generates all sources in config
npx @miaoosi/swagger2ts --source v5,v7  # Generate specific sources

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
- Supports three configuration sources (priority order):
  1. Config file (`swagger2ts.config.ts`)
  2. CLI parameters (`-i`, `-o`)
  3. Environment variables (`SWAGGER_INPUT`, `OUTPUT_PATH`)
- Coordinates the entire generation workflow
- Handles multi-source generation

**`src/config-loader.ts`** - Configuration File Loader
- Searches for config files in project root
- Uses `bundle-require` to load `.ts` and `.js` config files
- Exports `findConfigFile()`, `loadConfigFile()`, and `defineConfig()` helper
- Validates config structure

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
- Defines all interfaces: `CliOptions`, `ApiSource`, `Swagger2TsConfig`, `CacheMetadata`, etc.
- `PatchFunction` type for custom Swagger patches
- `GefeConfig` kept as deprecated alias for backwards compatibility
- Supports `clientType` and `baseURL` configuration options

**`templates/base.config.ts`** - Reusable Kubb Configuration
- Exports `createApiConfig()` - factory function for creating custom configs
- Supports dynamic client type selection via `clientType` parameter ('fetch' or 'axios')
- Plugin chain:
  1. `pluginOas()` - Parses OpenAPI/Swagger specs
  2. `pluginTs()` - Generates TypeScript types grouped by tag (no Controller suffix)
  3. `pluginClient()` - Generates fetch or axios-based API clients based on clientType

**`templates/client-config.*.template.ts`** - Runtime Client Configuration Templates
- Auto-generated `client-config.ts` in output directory
- Provides `configureApiClient()` for runtime baseURL configuration
- Wraps Kubb's `setConfig()` for easier usage
- Separate templates for fetch and axios clients

### Configuration System

The tool supports multiple configuration methods (in priority order):

**1. Config File** (`swagger2ts.config.ts` or `.js`)
```typescript
import { defineConfig } from '@miaoosi/swagger2ts/config-loader'

export default defineConfig({
  sources: {
    v5: {
      input: 'https://api.com/v5/swagger.json',
      output: './src/api/v5',
      clientType: 'fetch',  // 'fetch' or 'axios'
      baseURL: 'https://api.com/v5',  // Optional: for documentation only
    },
    v7: {
      input: 'https://api.com/v7/swagger.json',
      output: './src/api/v7',
      clientType: 'axios',  // Use Axios for this source
    }
  },
  convertToV3: true,
  cache: true,
})
```

Usage:
- `npx @miaoosi/swagger2ts` - Generate all sources
- `npx @miaoosi/swagger2ts --source v5,v7` - Generate specific sources
- `npx @miaoosi/swagger2ts --config custom.config.ts` - Use custom config path

**2. CLI Parameters**
```bash
npx @miaoosi/swagger2ts -i ./swagger.json -o ./src/api
```

**3. Environment Variables** (`.env` file)
- `SWAGGER_INPUT` - Input Swagger file/URL
- `OUTPUT_PATH` - Output directory
- `CONVERT_TO_V3` - Convert Swagger 2.0 to OpenAPI 3.x

### Generated Code Structure

Output directory structure:
```
{output}/
├── .api-gen-cache/
│   └── metadata.json          # Cache metadata for incremental generation
├── .temp/
│   └── swagger.json           # Processed Swagger (after patches/conversion)
├── types/
│   ├── {Tag}/                 # Tag-based grouping (no Controller suffix)
│   │   ├── {OperationId}.ts   # Type definitions per operation
│   │   └── index.ts
│   └── index.ts
├── clients/{clientType}/       # 'fetch' or 'axios'
│   ├── {Tag}Service/
│   │   ├── {operationId}Client.ts  # Individual client functions
│   │   ├── {tag}Service.ts
│   │   └── index.ts
│   ├── operations.ts
│   └── index.ts
├── client-config.ts            # Runtime configuration helpers (auto-generated)
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

## Runtime Configuration Best Practices

### BaseURL Configuration

The `baseURL` field in config files is **optional and for documentation only**. The actual baseURL should be configured at **runtime** using environment variables.

**Recommended Approach (Similar to GraphQL Client)**:

```typescript
// 1. Configure once at app initialization (e.g., main.ts, app.ts)
import { configureApiClient } from './api/v5/client-config'

configureApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  }
})

// 2. Use generated clients anywhere in your app
import { getUsersIdClient } from './api/v5/clients/fetch'

const response = await getUsersIdClient({ params: { id: '123' } })
```

**Environment-specific Configuration**:

```typescript
// config/api.ts
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

configureApiClient({
  baseURL: isDevelopment
    ? 'http://localhost:3000/api'
    : isProduction
      ? process.env.NEXT_PUBLIC_API_URL
      : 'https://api.staging.com',
})
```

**Dynamic Headers (e.g., Authentication)**:

```typescript
import { updateApiHeaders } from './api/client-config'

// After user login
function handleLogin(token: string) {
  updateApiHeaders({
    'Authorization': `Bearer ${token}`
  })
}

// After logout
function handleLogout() {
  updateApiHeaders({
    'Authorization': ''
  })
}
```

### Client Type Selection

**When to use Fetch (Default)**:
- ✅ Modern web applications (React, Vue, Next.js)
- ✅ Zero dependencies requirement
- ✅ Simple HTTP requests without advanced features
- ✅ SSR/SSG environments (Node 18+)

**When to use Axios**:
- ✅ Need request/response interceptors
- ✅ Request cancellation (AbortController alternative)
- ✅ Progress monitoring (file uploads)
- ✅ Better error handling out of the box
- ✅ Legacy codebases already using Axios

**Configuration**:

```typescript
// swagger2ts.config.ts
export default defineConfig({
  sources: {
    publicApi: {
      input: 'https://api.com/public/swagger.json',
      output: './src/api/public',
      clientType: 'fetch',  // Lightweight, zero deps
    },
    adminApi: {
      input: 'https://api.com/admin/swagger.json',
      output: './src/api/admin',
      clientType: 'axios',  // Need interceptors
    }
  }
})
```

**Using Axios Interceptors**:

```typescript
import { apiAxiosInstance } from './api/admin/client-config'

// Request interceptor
apiAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }
)

// Response interceptor
apiAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

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
- **`02-with-authentication.ts`** - Runtime client configuration and authentication
- **`03-multiple-api-sources.ts`** - Managing multiple API sources
- **`04-custom-patches.ts`** - Creating custom patch functions
- **`05-config-file.ts`** - Using config file for advanced configuration
- **`06-env-variables.sh`** - Environment variable configuration
- **`07-axios-client.ts`** - Using Axios instead of Fetch with interceptors
- **`08-runtime-baseurl.ts`** - Runtime baseURL configuration examples
- **`09-config-with-client-type.ts`** - Multi-source with different client types
- **`README.md`** - Complete examples documentation

When adding new features, consider adding a corresponding example to help users understand the functionality.

## Client Types

The generator supports two client types that can be configured per source:

**Fetch Client (Default)**:
- Uses native `fetch` API
- No additional dependencies
- Automatically selected with `clientType: 'fetch'`
- Output: `{output}/clients/fetch/`
- Auto-generates `client-config.ts` with Fetch-specific helpers

**Axios Client**:
- Uses Axios library for HTTP requests
- Requires `axios` dependency in consuming project
- Select with `clientType: 'axios'` in config
- Output: `{output}/clients/axios/`
- Auto-generates `client-config.ts` with Axios-specific helpers
- Benefits: Request/response interceptors, automatic JSON transformation, request cancellation, better error handling

**Usage**:

```typescript
// swagger2ts.config.ts
export default defineConfig({
  sources: {
    publicApi: {
      input: 'https://api.com/swagger.json',
      output: './src/api/public',
      clientType: 'fetch',  // or 'axios'
    }
  }
})
```

