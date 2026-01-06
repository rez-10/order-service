import { z } from "zod";

/**
 * ENV SCHEMA
 *
 * Rules:
 * - Explicit allowlist
 * - Fail on unknown keys
 * - No hidden defaults
 */
const EnvSchema = z
  .object({
    /* ---------- Service ---------- */
    NODE_ENV: z.enum(["development", "staging", "production"]),

    /* ---------- Postgres ---------- */
    PG_HOST: z.string().min(1),
    PG_PORT: z.coerce.number().int().positive(),
    PG_DATABASE: z.string().min(1),
    PG_USER: z.string().min(1),
    PG_PASSWORD: z.string().min(1),

    PG_POOL_MIN: z.coerce.number().int().nonnegative(),
    PG_POOL_MAX: z.coerce.number().int().positive(),
    PG_IDLE_TIMEOUT_MS: z.coerce.number().int().positive(),
    PG_CONN_TIMEOUT_MS: z.coerce.number().int().positive(),
    PG_MAX_LIFETIME_MS: z.coerce.number().int().positive(),
    PG_STATEMENT_TIMEOUT_MS: z.coerce.number().int().positive(),

    /* ---------- Redis ---------- */
    REDIS_HOST: z.string().min(1),
    REDIS_PORT: z.coerce.number().int().positive(),
    REDIS_USERNAME: z.string().optional(),
    REDIS_PASSWORD: z.string().optional(),

    REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive(),
    REDIS_COMMAND_TIMEOUT_MS: z.coerce.number().int().positive(),
    REDIS_MAX_RETRIES_PER_REQUEST: z.coerce.number().int().nonnegative(),

    /* ---------- Kafka / Redpanda ---------- */
    KAFKA_BROKERS: z.string().min(1), // comma-separated
    KAFKA_CLIENT_ID: z.string().min(1),

    KAFKA_CONN_TIMEOUT_MS: z.coerce.number().int().positive(),
    KAFKA_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive(),

    KAFKA_PRODUCER_IDEMPOTENT: z.coerce.boolean(),
    KAFKA_PRODUCER_MAX_IN_FLIGHT: z.coerce.number().int().positive(),

    KAFKA_CONSUMER_GROUP_ID: z.string().min(1),
    KAFKA_CONSUMER_SESSION_TIMEOUT_MS: z.coerce.number().int().positive(),
    KAFKA_CONSUMER_HEARTBEAT_INTERVAL_MS: z.coerce.number().int().positive(),

    /* ---------- Schema Registry ---------- */
    SCHEMA_REGISTRY_URL: z.string().url(),
    SCHEMA_REGISTRY_TIMEOUT_MS: z.coerce.number().int().positive(),
    SCHEMA_REGISTRY_CACHE_TTL_MS: z.coerce.number().int().positive(),
    SCHEMA_REGISTRY_ALLOW_BYPASS: z.coerce.boolean(),
  })
  .strict(); // fail on unknown env vars

export function loadEnv() {
  const parsed = EnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(" Invalid environment configuration");
    console.error(parsed.error.format());
    process.exit(1);
  }

  return parsed.data;
}
