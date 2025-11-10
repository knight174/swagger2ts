/**
 * API Client Configuration (Axios)
 *
 * This file provides runtime configuration for the generated API client.
 * It wraps the client's setConfig function for easy baseURL and headers setup.
 *
 * @example
 * ```typescript
 * // In your app entry point (e.g., main.ts, app.ts)
 * import { configureApiClient } from './api/client-config'
 *
 * configureApiClient({
 *   baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com',
 *   timeout: 10000,
 *   headers: {
 *     'Content-Type': 'application/json',
 *   }
 * })
 * ```
 */

import { setConfig, getConfig, axiosInstance } from './.kubb/fetch'
import type { RequestConfig } from './.kubb/fetch'

/**
 * API Client configuration type
 * Supports all RequestConfig options
 */
export type ApiClientConfig = Partial<RequestConfig<unknown>>

/**
 * Configure the API client with runtime settings
 *
 * @param config - Client configuration options
 * @returns The updated configuration
 *
 * @example
 * ```typescript
 * // Client-side (React/Next.js)
 * configureApiClient({
 *   baseURL: process.env.NEXT_PUBLIC_API_URL,
 *   timeout: 10000,
 *   headers: {
 *     'Content-Type': 'application/json',
 *   }
 * })
 *
 * // Server-side (Node.js)
 * configureApiClient({
 *   baseURL: process.env.SERVER_API_URL || 'https://api.example.com',
 *   validateStatus: (status) => status < 500,
 * })
 * ```
 */
export function configureApiClient(config: ApiClientConfig) {
  return setConfig(config as RequestConfig)
}

/**
 * Get the current API client configuration
 *
 * @returns Current client configuration
 *
 * @example
 * ```typescript
 * const currentConfig = getCurrentApiConfig()
 * console.log('Base URL:', currentConfig.baseURL)
 * ```
 */
export function getCurrentApiConfig() {
  return getConfig()
}

/**
 * Update specific headers without affecting other config
 *
 * @param headers - Headers to merge with existing headers
 *
 * @example
 * ```typescript
 * // Add authorization token after login
 * updateApiHeaders({
 *   'Authorization': `Bearer ${token}`
 * })
 * ```
 */
export function updateApiHeaders(headers: Record<string, string>) {
  const currentConfig = getConfig()
  return setConfig({
    ...currentConfig,
    headers: {
      ...(currentConfig.headers || {}),
      ...headers,
    },
  } as RequestConfig)
}

/**
 * Export axios instance for advanced use cases
 * (e.g., adding interceptors, modifying defaults)
 *
 * @example
 * ```typescript
 * import { apiAxiosInstance } from './api/client-config'
 *
 * // Add request interceptor
 * apiAxiosInstance.interceptors.request.use(
 *   (config) => {
 *     const token = localStorage.getItem('token')
 *     if (token) {
 *       config.headers.Authorization = `Bearer ${token}`
 *     }
 *     return config
 *   }
 * )
 *
 * // Add response interceptor
 * apiAxiosInstance.interceptors.response.use(
 *   (response) => response,
 *   (error) => {
 *     if (error.response?.status === 401) {
 *       // Handle unauthorized
 *     }
 *     return Promise.reject(error)
 *   }
 * )
 * ```
 */
export const apiAxiosInstance = axiosInstance
