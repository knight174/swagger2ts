# Gefe API Generator

A flexible, type-safe API client generator from OpenAPI/Swagger specifications with incremental generation support.

## Features

- **Type-Safe**: Generates TypeScript types and fully-typed API clients using [Kubb](https://kubb.dev/)
- **Incremental Generation**: Smart caching system skips regeneration when Swagger hasn't changed
- **Swagger 2.0 Support**: Automatic conversion to OpenAPI 3.x when needed
- **Flexible Configuration**: CLI arguments, environment variables, or config files
- **Custom Patches**: Built-in and extensible patch system for non-standard Swagger formats
- **Multiple API Sources**: Support for managing multiple API sources in one project

## Quick Start

### Using npx (No Installation Required)

```bash
# Generate API client from a Swagger file
npx gefe-api-gen -i ./swagger.json -o ./src/api

# Generate from a URL
npx gefe-api-gen -i https://api.example.com/swagger.json -o ./src/api

# Use a predefined source
npx gefe-api-gen --source demo

# Convert Swagger 2.0 to OpenAPI 3.x
npx gefe-api-gen -i ./swagger-v2.json -o ./src/api --convert-to-v3
```

### Installation

```bash
# Using pnpm
pnpm add -D gefe-api-generator

# Using npm
npm install --save-dev gefe-api-generator

# Using yarn
yarn add -D gefe-api-generator
```

Then run:

```bash
npx gefe-api-gen -i ./swagger.json -o ./src/api
```

## CLI Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--input <path>` | `-i` | Swagger file path or URL |
| `--output <path>` | `-o` | Output directory |
| `--source <name>` | | Use predefined API source (e.g., `demo`, `gitee`) |
| `--convert-to-v3` | | Convert Swagger 2.0 to OpenAPI 3.x |
| `--force` | | Force regeneration (skip cache check) |
| `--no-cache` | | Same as `--force` |
| `--clean` | | Clean output directory before generation |
| `--env <path>` | | Load specific `.env` file |

## Configuration Methods

Gefe API Generator supports three configuration methods, with the following priority order:

### 1. Predefined Sources (Highest Priority)

Use `--source` flag to use built-in API configurations:

```bash
npx gefe-api-gen --source demo
npx gefe-api-gen --source gitee --convert-to-v3
```

**Available predefined sources:**
- `demo`: Local demo API (`./swaggers/demo.json` → `./dist/demo`)
- `gitee`: Gitee API v5 with automatic Timestamp patch

### 2. CLI Arguments

Pass input/output directly via command line:

```bash
npx gefe-api-gen -i ./swagger.json -o ./src/api
npx gefe-api-gen -i https://api.com/swagger.json -o ./src/api --clean
```

### 3. Environment Variables (Lowest Priority)

Create a `.env` file in your project root:

```env
SWAGGER_INPUT=https://api.example.com/swagger.json
OUTPUT_PATH=./src/api
CONVERT_TO_V3=true
```

Then run:

```bash
npx gefe-api-gen
```

You can also specify a custom `.env` file:

```bash
npx gefe-api-gen --env .env.production
```

## Advanced Configuration

### Project Configuration File

Create a `gefe.config.ts` file in your project root for advanced scenarios:

```typescript
import type { GefeConfig } from "gefe-api-generator";
import { builtinPatches } from "gefe-api-generator/swagger-processor";

const config: GefeConfig = {
  // Define multiple API sources
  sources: {
    main: {
      input: "./swagger/main.json",
      output: "./src/api/main",
      convertToV3: true,
      clean: false,
    },
    admin: {
      input: "https://admin.example.com/swagger.json",
      output: "./src/api/admin",
      convertToV3: true,
      patches: [
        builtinPatches.giteeTimestamp,
        // Custom patch example
        (content: string) => {
          return content.replace(/"type": "CustomType"/g, '"type": "string"');
        },
      ],
    },
  },

  // Global patches applied to all sources
  patches: [builtinPatches.giteeTimestamp],

  // Enable incremental cache
  cache: true,

  // Custom cache directory (optional)
  cacheDir: ".api-gen-cache",

  // Convert all sources to OpenAPI 3.x
  convertToV3: true,
};

export default config;
```

See `gefe.config.example.ts` for more examples.

### Custom Swagger Patches

Patches are functions that transform Swagger JSON content before generation. Useful for fixing non-standard formats:

```typescript
import type { PatchFunction } from "gefe-api-generator";

// Fix custom timestamp format
const fixTimestamp: PatchFunction = (content: string) => {
  return content.replace(
    /"type":\s*"Timestamp"/gi,
    '"type": "string", "format": "date-time"'
  );
};

// Fix missing required fields
const addRequiredFields: PatchFunction = (content: string) => {
  const spec = JSON.parse(content);

  // Modify spec object
  if (spec.paths) {
    // Your custom logic here
  }

  return JSON.stringify(spec, null, 2);
};
```

**Built-in patches:**
- `builtinPatches.giteeTimestamp`: Fixes Gitee's non-standard "Timestamp" type

## Generated Code Structure

Running the generator creates the following structure:

```
{output}/
├── .api-gen-cache/
│   └── metadata.json              # Cache metadata for incremental generation
├── .temp/
│   └── swagger.json               # Processed Swagger (after patches/conversion)
├── types/
│   ├── {Tag}Controller/
│   │   ├── {OperationId}.ts       # Type definitions per operation
│   │   └── index.ts
│   └── index.ts
├── clients/fetch/
│   ├── {Tag}Service/
│   │   ├── {operationId}Client.ts # Individual client functions
│   │   ├── {tag}Service.ts
│   │   └── index.ts
│   └── index.ts
└── schemas/
    └── {schema}.json              # JSON schemas
```

## Usage Examples

### Basic Usage

```typescript
// Import generated types
import type { GetUsersId } from "./api/types";

// Import generated client
import { getUsersIdClient } from "./api/clients/fetch";

// Use the client
const response = await getUsersIdClient({
  params: { id: "123" }
});

// Response is fully typed
if (response.ok) {
  const user: GetUsersId["response"] = await response.json();
  console.log(user);
}
```

### With Custom Fetch Configuration

```typescript
import { getUsersIdClient } from "./api/clients/fetch";

// Add authentication
const response = await getUsersIdClient({
  params: { id: "123" },
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### Multiple API Sources

```bash
# Generate main API
npx gefe-api-gen -i ./swagger/main.json -o ./src/api/main

# Generate admin API
npx gefe-api-gen -i ./swagger/admin.json -o ./src/api/admin
```

Then import from different sources:

```typescript
import { getUserClient } from "./api/main/clients/fetch";
import { getAdminStatsClient } from "./api/admin/clients/fetch";
```

## Incremental Generation

The tool uses MD5 hashing to detect changes in Swagger files:

- **First run**: Generates all files and stores hash in `.api-gen-cache/metadata.json`
- **Subsequent runs**: Skips generation if Swagger content hasn't changed
- **Force regeneration**: Use `--force` or `--no-cache` flag

```bash
# Normal run - will skip if unchanged
npx gefe-api-gen -i ./swagger.json -o ./src/api

# Force regeneration
npx gefe-api-gen -i ./swagger.json -o ./src/api --force
```

## Swagger 2.0 Support

The tool can automatically convert Swagger 2.0 specifications to OpenAPI 3.x:

```bash
npx gefe-api-gen -i ./swagger-v2.json -o ./src/api --convert-to-v3
```

This uses the [swagger2openapi](https://github.com/Mermade/oas-kit) library with automatic patching for common issues.

## Development

### Project Setup

```bash
# Clone repository
git clone <repo-url>
cd gefe-api-generator

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run in development mode
pnpm run dev -- -i ./swagger.json -o ./dist/test
```

### Scripts

- `pnpm run build`: Compile TypeScript to `dist/`
- `pnpm run dev`: Run CLI in development mode with tsx
- `pnpm run generate:api`: Legacy generation using kubb.config.ts
- `pnpm run prepublishOnly`: Pre-publish build check

### Project Structure

```
gefe-api-generator/
├── bin/
│   └── gefe-api-gen.ts        # CLI entry point
├── src/
│   ├── cli.ts                 # CLI argument parsing
│   ├── generator.ts           # Kubb wrapper
│   ├── incremental.ts         # Cache system
│   ├── swagger-processor.ts   # Swagger patching & conversion
│   └── types.ts               # TypeScript definitions
├── templates/
│   └── base.config.ts         # Reusable Kubb config
├── config/
│   └── index.ts               # Legacy config (deprecated)
└── swaggers/
    └── demo.json              # Demo Swagger file
```

## Troubleshooting

### "Timestamp" Type Errors

If you encounter errors with non-standard "Timestamp" types (common with Gitee API):

```bash
# Use built-in Gitee source
npx gefe-api-gen --source gitee

# Or apply patch manually
npx gefe-api-gen -i <url> -o ./dist --convert-to-v3
```

### Cache Issues

If you suspect cache corruption:

```bash
# Force regeneration
npx gefe-api-gen -i ./swagger.json -o ./src/api --force

# Or delete cache directory
rm -rf ./src/api/.api-gen-cache
```

### Validation Errors

For Swagger 2.0 validation errors:

```bash
# Convert to OpenAPI 3.x first
npx gefe-api-gen -i ./swagger.json -o ./src/api --convert-to-v3
```

## Migration Guide

### From Legacy `kubb.config.ts`

**Before:**
```bash
pnpm run generate:api
```

**After:**
```bash
npx gefe-api-gen --source demo
# Or
npx gefe-api-gen -i ./swaggers/demo.json -o ./dist/demo
```

### From Direct Kubb Usage

Replace your Kubb configuration with Gefe's CLI:

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
npx gefe-api-gen -i ./swagger.json -o ./src/api
```

All plugin configurations are handled by `templates/base.config.ts`.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

## Credits

Built with [Kubb](https://kubb.dev/) - The ultimate OpenAPI code generator.