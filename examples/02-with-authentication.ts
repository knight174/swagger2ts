/**
 * Authentication Example
 *
 * This example shows how to add authentication headers
 * to your API requests.
 */

import { getUsersIdClient } from "./api/clients/fetch";

async function withAuthentication() {
  const token = "your-auth-token";

  // Add authentication
  const response = await getUsersIdClient({
    params: { id: "123" },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const user = await response.json();
    console.log(user);
  } else {
    console.error("Authentication failed:", response.status);
  }
}

withAuthentication();
