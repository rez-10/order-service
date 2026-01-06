/**
 * Redis config
 *
 * Client-level connection + behavior parameters.
 */
export function createRedisConfig(env) {
  return {
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
    },

    client: {
      connectTimeout: env.REDIS_CONNECT_TIMEOUT_MS,
      commandTimeout: env.REDIS_COMMAND_TIMEOUT_MS,
      maxRetriesPerRequest: env.REDIS_MAX_RETRIES_PER_REQUEST,
    },
  };
}

//:: we still need something to manage ttls
