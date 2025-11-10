/**
 * Config File with Client Type Example
 *
 * This example shows how to configure multiple API sources
 * with different client types (fetch/axios) and baseURLs.
 */

import { defineConfig } from "@miaoosi/swagger2ts/config-loader";

export default defineConfig({
  sources: {
    // Public API using Fetch (default, zero dependencies)
    publicApi: {
      input: "https://api.example.com/v1/swagger.json",
      output: "./src/api/public",
      clientType: "fetch",
      baseURL: "https://api.example.com/v1", // Optional: for documentation
    },

    // Admin API using Axios (for interceptors, better error handling)
    adminApi: {
      input: "https://api.example.com/admin/swagger.json",
      output: "./src/api/admin",
      clientType: "axios",
      baseURL: "https://api.example.com/admin",
      convertToV3: true,
    },

    // Internal API using Fetch
    internalApi: {
      input: "./specs/internal-api.json",
      output: "./src/api/internal",
      clientType: "fetch",
      clean: true,
    },
  },

  // Global settings
  convertToV3: true,
  cache: true,
});

/**
 * Usage in your application:
 *
 * ```typescript
 * // src/config/api.ts
 * import { configureApiClient as configurePublicApi } from '../api/public/client-config'
 * import { configureApiClient as configureAdminApi } from '../api/admin/client-config'
 *
 * export function initializeApiClients() {
 *   // Configure public API
 *   configurePublicApi({
 *     baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com/v1',
 *   })
 *
 *   // Configure admin API with interceptors
 *   configureAdminApi({
 *     baseURL: process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://api.example.com/admin',
 *     timeout: 15000,
 *   })
 *
 *   // Add Axios interceptor for admin API
 *   import { apiAxiosInstance } from '../api/admin/client-config'
 *   apiAxiosInstance.interceptors.request.use(config => {
 *     const token = localStorage.getItem('admin_token')
 *     if (token) {
 *       config.headers.Authorization = `Bearer ${token}`
 *     }
 *     return config
 *   })
 * }
 *
 * // Call in your app entry point
 * initializeApiClients()
 * ```
 *
 * Generate specific sources:
 * ```bash
 * npx @miaoosi/swagger2ts --source publicApi,adminApi
 * ```
 */
