import { loadEnv } from "./env.js";
import { createPostgresConfig } from "./postgres.js";
import { createRedisConfig } from "./redis.js";
import { createKafkaConfig } from "./kafka.js";
import { createSchemaRegistryConfig } from "./schema-registry.js";

/**
 * loadConfig
 *
 * Builds and freezes validated configuration.
 */
export function loadConfig() {
  const env = loadEnv();

  const config = {
    postgres: createPostgresConfig(env),
    redis: createRedisConfig(env),
    kafka: createKafkaConfig(env),
    schemaRegistry: createSchemaRegistryConfig(env),
  };

  return Object.freeze(config);
}
