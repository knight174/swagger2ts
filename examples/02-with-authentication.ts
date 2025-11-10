/**
 * Authentication Example
 *
 * This example shows how to configure authentication using
 * the runtime client configuration.
 */

import { configureApiClient } from "./api/client-config";
import { getUsersIdClient } from "./api/clients/fetch";

// Configure API client once at app startup
configureApiClient({
  baseURL: process.env.API_BASE_URL || "https://api.example.com",
  headers: {
    "Content-Type": "application/json",
  },
});

async function withAuthentication() {
  const token = "your-auth-token";

  // Method 1: Use per-request headers (recommended for dynamic tokens)
  const response = await getUsersIdClient(
    { params: { id: "123" } },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.ok) {
    const user = await response.json();
    console.log(user);
  } else {
    console.error("Authentication failed:", response.status);
  }
}

// Method 2: Update global headers after login
import { updateApiHeaders } from "./api/client-config";

function handleLogin(token: string) {
  updateApiHeaders({
    Authorization: `Bearer ${token}`,
  });
}

withAuthentication();
