/**
 * Runtime BaseURL Configuration Example
 *
 * This example demonstrates how to configure baseURL at runtime
 * using environment variables, similar to GraphQL Client setup.
 */

import { configureApiClient, getCurrentApiConfig } from "./api/client-config";
import { getUsersIdClient } from "./api/clients/fetch";

/**
 * Example 1: Client-side configuration (React/Next.js)
 */
function clientSideSetup() {
  // Configure once at app initialization
  configureApiClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.example.com",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("Client configured:", getCurrentApiConfig());
}

/**
 * Example 2: Server-side configuration (Node.js/SSR)
 */
function serverSideSetup() {
  configureApiClient({
    baseURL: process.env.SERVER_API_URL || "https://internal-api.example.com",
    credentials: "include",
  });
}

/**
 * Example 3: Multi-environment configuration
 */
function multiEnvSetup() {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";

  configureApiClient({
    baseURL: isDevelopment
      ? "http://localhost:3000/api"
      : isProduction
        ? "https://api.production.com"
        : "https://api.staging.com",
  });
}

/**
 * Example 4: Dynamic baseURL switching
 */
function switchApiVersion(version: "v1" | "v2") {
  configureApiClient({
    baseURL: `https://api.example.com/${version}`,
  });
}

/**
 * Example 5: Use the configured client
 */
async function makeApiCall() {
  // The baseURL is automatically prepended to all requests
  const response = await getUsersIdClient({ params: { id: "123" } });

  if (response.ok) {
    const user = await response.json();
    console.log("User:", user);
  }
}

// Setup in your app entry point
clientSideSetup();

// Then make API calls anywhere in your app
makeApiCall();
