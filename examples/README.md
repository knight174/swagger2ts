# Swagger2TS - Examples

This directory contains various examples demonstrating how to use Swagger2TS in different scenarios.

## Examples Overview

### 1. Basic Usage (`01-basic-usage.ts`)

Learn how to use the generated API client for basic API calls with full type safety.

**Key concepts:**

- Importing generated types and clients
- Making type-safe API requests
- Handling responses

### 2. Authentication (`02-with-authentication.ts`)

Add authentication headers to your API requests.

**Key concepts:**

- Adding custom headers
- Bearer token authentication
- Error handling

### 3. Multiple API Sources (`03-multiple-api-sources.ts`)

Manage and use multiple API sources in the same project.

**Key concepts:**

- Generating clients for multiple APIs
- Importing from different API sources
- Using multiple clients together

**Shell script:** `03-multiple-api-sources.sh` - Generate multiple API clients

### 4. Custom Patches (`04-custom-patches.ts`)

Create custom patch functions to fix non-standard Swagger formats.

**Key concepts:**

- Creating patch functions
- Fixing type definitions
- Transforming Swagger specs before generation

### 5. Environment Variables (`06-env-variables.sh`)

Configure the generator using environment variables.

**Key concepts:**

- `.env` file usage
- Custom environment files
- Environment-based configuration

### 6. Axios Client (`07-axios-client.ts`)

Use Axios instead of Fetch for HTTP requests.

**Key concepts:**

- Generating Axios-based clients
- Request/response interceptors
- Advanced Axios features
- Error handling with Axios

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
- **Configuration Examples:** See [gefe.config.example.ts](../gefe.config.example.ts)
- **Environment Variables:** See [.env.example](../.env.example)

## Need Help?

If you encounter issues or have questions:

1. Check the [Troubleshooting](../README.md#troubleshooting) section in the main README
2. Review the examples in this directory
3. Check the [CLAUDE.md](../CLAUDE.md) for development guidance
