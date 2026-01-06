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
