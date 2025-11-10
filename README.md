# Swagger2TS

Generate type-safe TypeScript API clients from OpenAPI/Swagger specifications with incremental generation support.

English | [简体中文](./README.zh-CN.md)

## Features

- **Type-Safe**: Generates TypeScript types and fully-typed API clients using [Kubb](https://kubb.dev/)
- **Incremental Generation**: Smart caching system skips regeneration when Swagger hasn't changed
- **Swagger 2.0 Support**: Automatic conversion to OpenAPI 3.x when needed
- **Flexible Configuration**: CLI arguments, environment variables, or config files
- **Custom Patches**: Built-in and extensible patch system for non-standard Swagger formats
- **Multiple API Sources**: Support for managing multiple API sources via config file
- **Extensible**: Add Zod schemas, React Query hooks, or any Kubb plugin to extend code generation

## Quick Start

### Using npx (No Installation Required)

```bash
# Basic command structure
npx @miaoosi/swagger2ts -i <path-to-swagger-or-url> -o <output-directory>

# Generate API client from a Swagger file
npx @miaoosi/swagger2ts -i ./swagger.json -o ./src/api

# Generate from a URL
npx @miaoosi/swagger2ts -i https://api.example.com/swagger.json -o ./src/api

# Convert Swagger 2.0 to OpenAPI 3.x
npx @miaoosi/swagger2ts -i ./swagger-v2.json -o ./src/api --convert-to-v3
```

### Installation

> Node version >= 20 is required. If your project is using an older version, consider using `npx` instead. Or install it in another directory with node >= 20.

```bash
# Using pnpm
pnpm add -D @miaoosi/swagger2ts

# Using npm
npm install --save-dev @miaoosi/swagger2ts

# Using yarn
yarn add -D @miaoosi/swagger2ts
```

Then run:

```bash
npx swagger2ts -i <path-to-swagger-or-url> -o <output-directory>
```

## CLI Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--input <path>` | `-i` | Swagger file path or URL |
| `--output <path>` | `-o` | Output directory |
| `--config <path>` | `-c` | Config file path |
| `--source <names>` | `-s` | Source names to generate (comma-separated, e.g., v5,v7) |
| `--convert-to-v3` | | Convert Swagger 2.0 to OpenAPI 3.x |
| `--force` | | Force regeneration (skip cache check) |
| `--no-cache` | | Same as `--force` |
| `--clean` | | Clean output directory before generation |
| `--env <path>` | | Load specific `.env` file |

## Configuration Methods

Swagger2TS supports three configuration methods, with the following priority order:

### 1. Config File (Recommended for Multiple Sources)

Create a `swagger2ts.config.ts` (or `.js`) file in your project root:

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
    // Admin API
    admin: {
      input: './swagger/admin.json',
      output: './src/api/admin',
      patches: [builtinPatches.giteeTimestamp],
    },
  },
  // Global settings
  convertToV3: true,
  cache: true,
});
```

Then run:

```bash
# Generate all sources
npx swagger2ts

# Generate specific sources only
npx swagger2ts --source v5,v7

# Override config with CLI flags
npx swagger2ts --source v5 --force
```

**Supported config file names** (searched in this order):

- `swagger2ts.config.ts`
- `swagger2ts.config.mts`
- `swagger2ts.config.js`
- `swagger2ts.config.mjs`
- `.swagger2tsrc.ts`
- `.swagger2tsrc.mts`
- `.swagger2tsrc.js`
- `.swagger2tsrc.mjs`

### 2. CLI Arguments

Pass input/output directly via command line:

```bash
npx swagger2ts -i ./swagger.json -o ./src/api
npx swagger2ts -i https://api.com/swagger.json -o ./src/api --clean
```

### 3. Environment Variables

Create a `.env` file in your project root:

```env
SWAGGER_INPUT=https://api.example.com/swagger.json
OUTPUT_PATH=./src/api
CONVERT_TO_V3=true
```

Then run:

```bash
npx swagger2ts
```

You can also specify a custom `.env` file:

```bash
npx swagger2ts --env .env.production
```

## Multi-Environment Setup

For managing multiple API versions or environments, use the config file approach:

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

Usage:

```bash
# Generate all environments
npx swagger2ts

# Generate only dev
npx swagger2ts --source dev

# Generate dev and staging
npx swagger2ts --source dev,staging
```

## Custom Swagger Patches

Patches are functions that transform Swagger JSON content before generation. Useful for fixing non-standard formats.

**Built-in patches:**

- `builtinPatches.giteeTimestamp`: Fixes Gitee's non-standard "Timestamp" type

For examples of creating custom patches, see [examples/04-custom-patches.ts](./examples/04-custom-patches.ts).

## Extending with Kubb Plugins

Swagger2TS generates TypeScript types and API clients by default, but you can extend it with additional Kubb plugins to generate Zod schemas, React Query hooks, and more.

### Available Plugins

- **[@kubb/plugin-zod](https://kubb.dev/plugins/plugin-zod/)** - Generate Zod schemas for runtime validation
- **[@kubb/plugin-react-query](https://kubb.dev/plugins/plugin-react-query/)** - Generate React Query hooks
- **[@kubb/plugin-swr](https://kubb.dev/plugins/plugin-swr/)** - Generate SWR hooks
- **[@kubb/plugin-vue-query](https://kubb.dev/plugins/plugin-vue-query/)** - Generate Vue Query composables
- **[@kubb/plugin-faker](https://kubb.dev/plugins/plugin-faker/)** - Generate mock data with Faker.js
- **[@kubb/plugin-msw](https://kubb.dev/plugins/plugin-msw/)** - Generate MSW (Mock Service Worker) handlers

### Example

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

      // Add Kubb plugins
      kubb: {
        plugins: [
          // Generate Zod schemas
          pluginZod({
            output: { path: './zod' },
            typed: true,
          }),

          // Generate React Query hooks
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

**Generated structure:**

```bash
src/api/
├── types/         # ← TypeScript types (default)
├── clients/axios/ # ← Axios clients (default)
├── zod/          # ← Zod schemas (from plugin)
└── hooks/        # ← React Query hooks (from plugin)
```

For more examples, see [swagger2ts.config.example.ts](./swagger2ts.config.example.ts).

## Generated Code Structure

Running the generator creates the following structure:

```bash
{output}/
├── .api-gen-cache/
│   └── metadata.json              # Cache metadata for incremental generation
├── .temp/
│   └── swagger.json               # Processed Swagger (after patches/conversion)
├── types/
│   ├── {Tag}/                     # Tag-based grouping
│   │   ├── {OperationId}.ts       # Type definitions per operation
│   │   └── index.ts
│   └── index.ts
├── clients/axios/                 # Axios client (default)
│   ├── {Tag}Service/
│   │   ├── {operationId}Client.ts # Individual client functions
│   │   ├── {tag}Service.ts
│   │   └── index.ts
│   └── index.ts
├── client-config.ts               # Runtime configuration helpers
└── schemas/
    └── {schema}.json              # JSON schemas
```

## Usage Examples

For detailed examples and code samples, see the **[examples/](./examples/)** directory.

**Quick examples:**

- **[Basic Usage](./examples/01-basic-usage.ts)** - Simple API calls with type safety
- **[Authentication](./examples/02-with-authentication.ts)** - Adding auth headers
- **[Multiple API Sources](./examples/03-multiple-api-sources.ts)** - Managing multiple APIs
- **[Custom Patches](./examples/04-custom-patches.ts)** - Fixing non-standard Swagger formats
- **[Environment Variables](./examples/06-env-variables.sh)** - Using `.env` files
- **[Axios Client](./examples/07-axios-client.ts)** - Using Axios instead of Fetch

### Quick Start Example

```typescript
// Import generated types and client
import type { GetUsersId } from "./api/types";
import { getUsersIdClient } from "./api/clients/axios";

// Make a type-safe API call
const response = await getUsersIdClient({
  params: { id: "123" }
});

if (response.ok) {
  const user: GetUsersId["response"] = await response.json();
  console.log(user);
}
```

See the [examples/README.md](./examples/README.md) for complete documentation of all examples.

## Incremental Generation

The tool uses MD5 hashing to detect changes in Swagger files:

- **First run**: Generates all files and stores hash in `.api-gen-cache/metadata.json`
- **Subsequent runs**: Skips generation if Swagger content hasn't changed
- **Force regeneration**: Use `--force` or `--no-cache` flag

```bash
# Normal run - will skip if unchanged
npx swagger2ts -i <path-to-swagger-or-url> -o <output-directory>

# Force regeneration
npx swagger2ts -i <path-to-swagger-or-url> -o <output-directory> --force
```

## Swagger 2.0 Support

The tool can automatically convert Swagger 2.0 specifications to OpenAPI 3.x:

```bash
npx swagger2ts -i <path-to-swagger-or-url> -o <output-directory> --convert-to-v3
```

This uses the [swagger2openapi](https://github.com/Mermade/oas-kit) library with automatic patching for common issues.

## Development

### Project Setup

```bash
git clone <repo-url>
cd swagger2ts

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run in development mode
# generated from local Swagger files
pnpm run dev -i ./__mock__/swagger.json -o ./api/gen
pnpm run dev -i ./__mock__/swagger-v2.json -o ./api/gen-v2
pnpm run dev -i ./__mock__/swagger-v2.json -o ./api/gen-v3 --convert-to-v3
# generated from remote Swagger URL
pnpm run dev -i https://petstore.swagger.io/v2/swagger.json -o ./api/petstore-v2
pnpm run dev -i https://petstore.swagger.io/v2/swagger.json -o ./api/petstore --convert-to-v3
```

### Scripts

- `pnpm run build`: Compile TypeScript to `dist/`
- `pnpm run dev`: Run CLI in development mode with tsx
- `pnpm run prepublishOnly`: Pre-publish build check

### Project Structure

```bash
swagger2ts/
├── bin/
│   └── swagger2ts.ts              # CLI entry point
├── src/
│   ├── cli.ts                     # CLI argument parsing
│   ├── generator.ts               # Kubb wrapper
│   ├── incremental.ts             # Cache system
│   ├── swagger-processor.ts       # Swagger patching & conversion
│   └── types.ts                   # TypeScript definitions
├── templates/
│   └── base.config.ts             # Reusable Kubb config
├── examples/
│   ├── 01-basic-usage.ts          # Basic usage example
│   ├── 02-with-authentication.ts
│   ├── 03-multiple-api-sources.ts
│   ├── 04-custom-patches.ts
│   ├── 06-env-variables.sh
│   ├── 07-axios-client.ts
│   ├── 08-runtime-baseurl.ts
│   ├── 09-config-with-client-type.ts
│   └── README.md                  # Examples documentation
└── __mock__/
    └── swagger.json               # Demo Swagger file
```

## Troubleshooting

### "Timestamp" Type Errors

If you encounter errors with non-standard "Timestamp" types (common with Gitee API), you can create custom patches. See [examples/04-custom-patches.ts](./examples/04-custom-patches.ts) for how to implement patch functions.

> **Note:** Built-in patch support via configuration file is planned for a future release.

### Cache Issues

If you suspect cache corruption:

```bash
# Force regeneration
npx swagger2ts -i ./swagger.json -o ./src/api --force

# Or delete cache directory
rm -rf ./src/api/.api-gen-cache
```

### Validation Errors

For Swagger 2.0 validation errors:

```bash
# Convert to OpenAPI 3.x first
npx swagger2ts -i ./swagger.json -o ./src/api --convert-to-v3
```

## Migration Guide

### From Direct Kubb Usage

Replace your Kubb configuration with Swagger2TS CLI:

**Before:**

```typescript
// kubb.config.ts
export default {
  input: { path: './swagger.json' },
  output: { path: './src/api' },
  // ... complex plugin config
}
```

**After:**

```bash
npx swagger2ts -i ./swagger.json -o ./src/api
```

All plugin configurations are handled by `templates/base.config.ts`.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

## Credits

Built with [Kubb](https://kubb.dev/) - The ultimate OpenAPI code generator.
