// import pg from "pg";
// import { logger } from "../../shared/index.js";

// const { Pool } = pg;

// export function createPostgresPool(config) {
//   const pool = new Pool({
//     host: config.host,
//     port: config.port,
//     user: config.user,
//     password: config.password,
//     database: config.database,

//     max: config.poolSize,
//     idleTimeoutMillis: config.idleTimeoutMs,
//     connectionTimeoutMillis: config.connectionTimeoutMs
//   });

//   pool.on("connect", () => {
//     logger.info("Postgres connection acquired");
//   });

//   pool.on("error", (err) => {
//     logger.error({ err }, "Postgres pool error");
//   });

//   return pool;
// }

import pg from "pg";

export function createPool({ connection, pool, logger }) {
  const pgPool = new pg.Pool({
    ...connection,
    ...pool,
  });

  pgPool.on("error", (err) => {
    logger.error({ err }, "Postgres pool error");
  });

  return pgPool;
}
