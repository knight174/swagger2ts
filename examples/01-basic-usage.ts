/**
 * Basic Usage Example
 *
 * This example shows how to use the generated API client
 * for basic API calls with type safety.
 */

// Import generated types
import type { GetUsersId } from "./api/types";

// Import generated client
import { getUsersIdClient } from "./api/clients/fetch";

async function basicExample() {
  // Use the client
  const response = await getUsersIdClient({
    params: { id: "123" }
  });

  // Response is fully typed
  if (response.ok) {
    const user: GetUsersId["response"] = await response.json();
    console.log(user);
  }
}

basicExample();
