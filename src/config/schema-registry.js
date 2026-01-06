/**
 * Schema Registry config
 *
 * HTTP dependency parameters only.
 */
export function createSchemaRegistryConfig(env) {
  return {
    baseUrl: env.SCHEMA_REGISTRY_URL,
    timeoutMs: env.SCHEMA_REGISTRY_TIMEOUT_MS,
    cacheTtlMs: env.SCHEMA_REGISTRY_CACHE_TTL_MS,
    allowBypass: env.SCHEMA_REGISTRY_ALLOW_BYPASS,
  };
}
