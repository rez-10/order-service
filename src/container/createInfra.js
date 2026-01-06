import { createPostgresInfra } from "../infra/postgres/index.js";
import { createRedisInfra } from "../infra/redis/index.js";
import { createKafkaInfra } from "../infra/kafka/index.js";
import { createSchemaRegistryInfra } from "../infra/schema-registry/index.js";

/**
 * createInfra
 *
 * Creates all infrastructure dependencies.
 */
export function createInfra({ config, logger }) {
  const postgres = createPostgresInfra({
    ...config.postgres,
    logger,
  });

  const redis = createRedisInfra({
    ...config.redis,
    logger,
  });

  const kafka = createKafkaInfra({
    ...config.kafka,
    logger,
  });

  const schemaRegistry = createSchemaRegistryInfra({
    ...config.schemaRegistry,
    logger,
  });

  return {
    postgres,
    redis,
    kafka,
    schemaRegistry,
  };
}
