# Gefe API Generator

A flexible, type-safe API client generator from OpenAPI/Swagger specifications with incremental generation support.

## Features

- **Type-Safe**: Generates TypeScript types and fully-typed API clients using [Kubb](https://kubb.dev/)
- **Incremental Generation**: Smart caching system skips regeneration when Swagger hasn't changed
- **Swagger 2.0 Support**: Automatic conversion to OpenAPI 3.x when needed
- **Flexible Configuration**: CLI arguments, environment variables, or config files
- **Custom Patches**: Built-in and extensible patch system for non-standard Swagger formats
- **Multiple API Sources**: Support for managing multiple API sources via config file

## Quick Start

### Using npx (No Installation Required)

```bash
# Basic command structure
npx gefe-api-gen -i <path-to-swagger-or-url> -o <output-directory>

# Generate API client from a Swagger file
npx gefe-api-gen -i ./swagger.json -o ./src/api

# Generate from a URL
npx gefe-api-gen -i https://api.example.com/swagger.json -o ./src/api

# Convert Swagger 2.0 to OpenAPI 3.x
npx gefe-api-gen -i ./swagger-v2.json -o ./src/api --convert-to-v3
```

### Installation

> Node version >= 20 is required. If your project is using an older version, consider using `npx` instead. Or install it in another directory with node >= 20.

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
npx gefe-api-gen -i <path-to-swagger-or-url> -o <output-directory>
```

## CLI Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--input <path>` | `-i` | Swagger file path or URL |
| `--output <path>` | `-o` | Output directory |
| `--convert-to-v3` | | Convert Swagger 2.0 to OpenAPI 3.x |
| `--force` | | Force regeneration (skip cache check) |
| `--no-cache` | | Same as `--force` |
| `--clean` | | Clean output directory before generation |
| `--env <path>` | | Load specific `.env` file |

## Configuration Methods

Gefe API Generator supports two configuration methods, with the following priority order:

### 1. CLI Arguments (Higher Priority)

Pass input/output directly via command line:

```bash
npx gefe-api-gen -i ./swagger.json -o ./src/api
npx gefe-api-gen -i https://api.com/swagger.json -o ./src/api --clean
```

### 2. Environment Variables

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

Patches are functions that transform Swagger JSON content before generation. Useful for fixing non-standard formats.

**Built-in patches:**

- `builtinPatches.giteeTimestamp`: Fixes Gitee's non-standard "Timestamp" type

For examples of creating custom patches, see [examples/04-custom-patches.ts](./examples/04-custom-patches.ts).

## Generated Code Structure

Running the generator creates the following structure:

```bash
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

For detailed examples and code samples, see the **[examples/](./examples/)** directory.

**Quick examples:**

- **[Basic Usage](./examples/01-basic-usage.ts)** - Simple API calls with type safety
- **[Authentication](./examples/02-with-authentication.ts)** - Adding auth headers
- **[Multiple API Sources](./examples/03-multiple-api-sources.ts)** - Managing multiple APIs
- **[Custom Patches](./examples/04-custom-patches.ts)** - Fixing non-standard Swagger formats
- **[Configuration File](./examples/05-config-file.ts)** - Advanced configuration with `gefe.config.ts`
- **[Environment Variables](./examples/06-env-variables.sh)** - Using `.env` files
- **[Axios Client](./examples/07-axios-client.ts)** - Using Axios instead of Fetch

### Quick Start Example

```typescript
// Import generated types and client
import type { GetUsersId } from "./api/types";
import { getUsersIdClient } from "./api/clients/fetch";

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
npx gefe-api-gen -i <path-to-swagger-or-url> -o <output-directory>

# Force regeneration
npx gefe-api-gen -i <path-to-swagger-or-url> -o <output-directory> --force
```

## Swagger 2.0 Support

The tool can automatically convert Swagger 2.0 specifications to OpenAPI 3.x:

```bash
npx gefe-api-gen -i <path-to-swagger-or-url> -o <output-directory> --convert-to-v3
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
pnpm run dev -- -i ./__mock__/swagger.json -o ./api/test
```

### Scripts

- `pnpm run build`: Compile TypeScript to `dist/`
- `pnpm run dev`: Run CLI in development mode with tsx
- `pnpm run generate:api`: Legacy generation using kubb.config.ts
- `pnpm run prepublishOnly`: Pre-publish build check

### Project Structure

```bash
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
│   ├── base.config.ts         # Reusable Kubb config (Fetch)
│   └── axios-client.config.ts # Axios client configuration
├── examples/
│   ├── 01-basic-usage.ts      # Basic usage example
│   ├── 02-with-authentication.ts
│   ├── 03-multiple-api-sources.ts
│   ├── 04-custom-patches.ts
│   ├── 05-config-file.ts
│   ├── 06-env-variables.sh
│   ├── 07-axios-client.ts
│   └── README.md              # Examples documentation
├── config/
│   └── index.ts               # Legacy config (deprecated)
└── swaggers/
    └── demo.json              # Demo Swagger file
```

## Troubleshooting

### "Timestamp" Type Errors

If you encounter errors with non-standard "Timestamp" types (common with Gitee API), you can use custom patches:

```typescript
// gefe.config.ts
import { builtinPatches } from "gefe-api-generator/swagger-processor";

const config = {
  sources: {
    gitee: {
      input: "https://gitee.com/api/v5/doc_json",
      output: "./src/api/gitee",
      convertToV3: true,
      patches: [builtinPatches.giteeTimestamp],
    },
  },
};

export default config;
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
npx gefe-api-gen -i ./swagger.json -o ./dist/api
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
