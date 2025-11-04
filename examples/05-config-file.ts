/**
 * Project Configuration File Example
 *
 * Create this file as `gefe.config.ts` in your project root
 * to configure multiple API sources and custom patches.
 */

import type { GefeConfig } from "gefe-api-generator";
import { builtinPatches } from "gefe-api-generator/swagger-processor";

const config: GefeConfig = {
  // Define multiple API sources
  sources: {
    // Main API
    main: {
      input: "./swagger/main.json",
      output: "./src/api/main",
      convertToV3: true,
      clean: false,
    },

    // Admin API
    admin: {
      input: "https://admin.example.com/swagger.json",
      output: "./src/api/admin",
      convertToV3: true,
      clean: false,
      // Apply patches to specific source
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
