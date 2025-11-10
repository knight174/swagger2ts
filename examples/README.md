# Swagger2TS - Examples

This directory contains practical examples demonstrating how to use Swagger2TS in different scenarios.

## Examples Overview

### 1. Basic Usage (`01-basic-usage.ts`)

Learn how to use the generated API client for basic API calls with full type safety.

**Key concepts:**
- Importing generated types and clients
- Making type-safe API requests
- Handling responses

### 2. Authentication (`02-with-authentication.ts`)

Configure runtime client settings and add authentication headers to your API requests.

**Key concepts:**
- Runtime client configuration
- Adding auth headers (Bearer tokens)
- Dynamic header updates (login/logout)
- Error handling

### 3. Multiple API Sources (`03-multiple-api-sources.ts`)

Manage and use multiple API sources in the same project.

**Key concepts:**
- Config file with multiple sources
- Generating clients for different APIs
- Using multiple clients together

### 4. Custom Patches (`04-custom-patches.ts`)

Create custom patch functions to fix non-standard Swagger formats.

**Key concepts:**
- Creating patch functions
- Fixing non-standard type definitions
- Transforming Swagger specs before generation
- Using built-in patches

### 5. Extending with Kubb Plugins (`05-extending-with-kubb-plugins.ts`)

Extend code generation with additional Kubb plugins for Zod schemas, React Query hooks, and more.

**Key concepts:**
- Installing Kubb plugins
- Configuring plugins in swagger2ts.config.ts
- Using generated Zod schemas for validation
- Using generated React Query hooks
- Available plugin ecosystem

## Quick Start

### Generate from a local file

```bash
npx @miaoosi/swagger2ts -i ./swagger.json -o ./src/api
```

### Generate from a URL

```bash
npx @miaoosi/swagger2ts -i https://api.example.com/swagger.json -o ./src/api
```

### Convert Swagger 2.0 to OpenAPI 3.x

```bash
npx @miaoosi/swagger2ts -i ./swagger-v2.json -o ./src/api --convert-to-v3
```

### Force regeneration (skip cache)

```bash
npx @miaoosi/swagger2ts -i ./swagger.json -o ./src/api --force
```

## Additional Resources

- **Main Documentation:** See [README.md](../README.md) for complete documentation
- **Configuration Example:** See [swagger2ts.config.example.ts](../swagger2ts.config.example.ts) for advanced configuration options
- **Development Guide:** See [CLAUDE.md](../CLAUDE.md) for project architecture and development guidance

## Need Help?

If you encounter issues or have questions:

1. Check the [Troubleshooting](../README.md#troubleshooting) section in the main README
2. Review the examples in this directory
3. Explore the [Kubb documentation](https://kubb.dev/) for advanced plugin usage
