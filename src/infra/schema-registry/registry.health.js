// export async function checkSchemaRegistryHealth(client) {
//   // minimal probe: list subjects
//   await client.http.get("/subjects");
//   return true;
// }

import fetch from "node-fetch";

/**
 * checkSchemaRegistryHealth
 *
 * Transport-level health check.
 *
 * Guarantees:
 * - Does NOT validate schemas
 * - Does NOT parse payloads
 * - Does NOT depend on registry client internals
 * - Only checks reachability
 */
export async function checkSchemaRegistryHealth({ baseUrl, timeoutMs, logger }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/subjects`, {
      method: "GET",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Schema Registry unhealthy: HTTP ${response.status}`);
    }

    return true;
  } catch (err) {
    logger.error({ err }, "Schema Registry health check failed");
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
