/**
 * Extending with Kubb Plugins Example
 *
 * This example shows how to extend the default generation
 * with additional Kubb plugins like Zod schemas, React Query hooks, etc.
 *
 * Save this as: swagger2ts.config.ts
 */

import { defineConfig } from "@miaoosi/swagger2ts/config-loader";
import { pluginZod } from "@kubb/plugin-zod";
import { pluginReactQuery } from "@kubb/plugin-react-query";

/**
 * First, install the plugins you need:
 *
 * ```bash
 * pnpm add -D @kubb/plugin-zod @kubb/plugin-react-query
 * # or
 * npm install --save-dev @kubb/plugin-zod @kubb/plugin-react-query
 * ```
 */

export default defineConfig({
  sources: {
    api: {
      input: "https://api.example.com/swagger.json",
      output: "./src/api",
      clientType: "axios",

      // ✨ Add Kubb plugins here
      kubb: {
        plugins: [
          // Generate Zod schemas for runtime validation
          pluginZod({
            output: { path: "./zod" },
            typed: true, // Use TypeScript types in schemas
          }),

          // Generate React Query hooks
          pluginReactQuery({
            output: { path: "./hooks" },
            client: "axios", // Must match clientType above
            infinite: {}, // Enable infinite queries
          }),
        ],

        // Optional: Add hooks for lifecycle events
        hooks: {
          done: () => console.log("✨ Generation complete!"),
        },
      },
    },
  },
});

/**
 * Generated structure:
 *
 * ```
 * src/api/
 * ├── types/         ← TypeScript types (default)
 * ├── clients/axios/ ← Axios clients (default)
 * ├── zod/          ← Zod schemas (from plugin)
 * └── hooks/        ← React Query hooks (from plugin)
 * ```
 *
 * Usage in your app:
 *
 * ```typescript
 * // Validate data with Zod
 * import { getUserResponseSchema } from './api/zod'
 *
 * const data = await fetch('/api/user/123').then(r => r.json())
 * const validatedUser = getUserResponseSchema.parse(data)
 *
 * // Use React Query hooks
 * import { useGetUser } from './api/hooks'
 *
 * function UserProfile() {
 *   const { data, isLoading } = useGetUser({ params: { id: '123' } })
 *
 *   if (isLoading) return <div>Loading...</div>
 *   return <div>{data.name}</div>
 * }
 * ```
 *
 * Available Kubb Plugins:
 * - @kubb/plugin-zod - Zod schemas
 * - @kubb/plugin-react-query - React Query hooks
 * - @kubb/plugin-swr - SWR hooks
 * - @kubb/plugin-vue-query - Vue Query composables
 * - @kubb/plugin-faker - Mock data generation
 * - @kubb/plugin-msw - MSW handlers
 *
 * See: https://kubb.dev/plugins/
 */
