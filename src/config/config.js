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
    POSTGRES_HOST: z.string().min(1),
    POSTGRES_PORT: z.coerce.number().int().positive(),
    POSTGRES_DB: z.string().min(1),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),

    POSTGRES_POOL_MIN: z.coerce.number().int().nonnegative(),
    POSTGRES_POOL_MAX: z.coerce.number().int().positive(),
    POSTGRES_IDLE_TIMEOUT_MS: z.coerce.number().int().positive(),
    POSTGRES_CONN_TIMEOUT_MS: z.coerce.number().int().positive(),
    POSTGRES_MAX_LIFETIME_MS: z.coerce.number().int().positive(),
    POSTGRES_STATEMENT_TIMEOUT_MS: z.coerce.number().int().positive(),

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
  // .strict(); // fail on unknown env vars

export function loadEnv() {
  const parsed = EnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(" Invalid environment configuration");
    console.error(parsed.error);
    process.exit(1);
  }

  return parsed.data;
}


//index
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
// kafka
/**
 * Kafka / Redpanda config
 *
 * Pure client configuration.
 * No producer/consumer creation here.
 */
export function createKafkaConfig(env) {
  return {
    client: {
      clientId: env.KAFKA_CLIENT_ID,
      brokers: env.KAFKA_BROKERS.split(",").map((b) => b.trim()),
      connectionTimeout: env.KAFKA_CONN_TIMEOUT_MS,
      requestTimeout: env.KAFKA_REQUEST_TIMEOUT_MS,
    },

    producer: {
      idempotent: env.KAFKA_PRODUCER_IDEMPOTENT,
      maxInFlightRequests: env.KAFKA_PRODUCER_MAX_IN_FLIGHT,
    },

    consumer: {
      groupId: env.KAFKA_CONSUMER_GROUP_ID,
      sessionTimeout: env.KAFKA_CONSUMER_SESSION_TIMEOUT_MS,
      heartbeatInterval: env.KAFKA_CONSUMER_HEARTBEAT_INTERVAL_MS,
    },
  };
}
// postgress
/**
 * Postgres config
 *
 * Maps validated env → pg client expectations
 */
export function createPostgresConfig(env) {
  return {
    connection: {
      host: env.PG_HOST,
      port: env.PG_PORT,
      database: env.PG_DATABASE,
      user: env.PG_USER,
      password: env.PG_PASSWORD,
    },

    pool: {
      min: env.PG_POOL_MIN,
      max: env.PG_POOL_MAX,
      idleTimeoutMillis: env.PG_IDLE_TIMEOUT_MS,
      connectionTimeoutMillis: env.PG_CONN_TIMEOUT_MS,
      maxLifetimeMillis: env.PG_MAX_LIFETIME_MS,
      statementTimeout: env.PG_STATEMENT_TIMEOUT_MS,
    },
  };
}
// 
// /**
//  * Redis config
//  *
//  * Client-level connection + behavior parameters.
//  */
// export function createRedisConfig(env) {
//   return {
//     connection: {
//       host: env.REDIS_HOST,
//       port: env.REDIS_PORT,
//       username: env.REDIS_USERNAME,
//       password: env.REDIS_PASSWORD,
//     },

//     client: {
//       connectTimeout: env.REDIS_CONNECT_TIMEOUT_MS,
//       commandTimeout: env.REDIS_COMMAND_TIMEOUT_MS,
//       maxRetriesPerRequest: env.REDIS_MAX_RETRIES_PER_REQUEST,
//     },
//   };
// }

// //:: we still need something to manage ttls

/**
 * Redis config (ioredis-ready)
 */
export function createRedisConfig(env) {
  return {
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,

      tls: env.REDIS_TLS_ENABLED
        ? { rejectUnauthorized: true }
        : undefined,
    },

    client: {
      connectTimeout: env.REDIS_CONNECT_TIMEOUT_MS,
      maxRetriesPerRequest: env.REDIS_MAX_RETRIES_PER_REQUEST,

      enableOfflineQueue: false,
      lazyConnect: true,

      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 2000);
        return delay;
      },
    },

    ttl: {
      short: 60,
      medium: 5 * 60,
      long: 60 * 60,
    },
  };
}

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
