/**
 * Multiple API Sources Example
 *
 * This example shows how to use clients from multiple
 * API sources in the same application.
 */

// Import from main API
import { getUserClient } from "./api/main/clients/fetch";

// Import from admin API
import { getAdminStatsClient } from "./api/admin/clients/fetch";

async function multipleSourcesExample() {
  // Use main API
  const userResponse = await getUserClient({
    params: { id: "123" }
  });

  // Use admin API
  const statsResponse = await getAdminStatsClient();

  if (userResponse.ok && statsResponse.ok) {
    const user = await userResponse.json();
    const stats = await statsResponse.json();

    console.log("User:", user);
    console.log("Stats:", stats);
  }
}

multipleSourcesExample();
