// import { createPostgresPool } from "./postgres.pool.js";
// import { createTransactionManager } from "./postgres.transaction.js";
// import { checkPostgresHealth } from "./postgres.health.js";

// export function createPostgresInfra(config) {
//   const pool = createPostgresPool(config);
//   const transactionManager = createTransactionManager(pool);

//   return {
//     pool,
//     transactionManager,
//     health: () => checkPostgresHealth(pool)
//   };
// }

/*
const postgresInfra = createPostgresInfra(postgresConfig);

container.register("pool", postgresInfra.pool);
container.register("transactionManager", postgresInfra.transactionManager);
 */

import { createPool } from "./postgres.pool.js";
import { createTransactionManager } from "./postgres.transaction.js";
import { checkPostgresHealth } from "./postgres.health.js";

/**
 * createPostgresInfra
 *
 * Creates Postgres client primitives.
 */
export function createPostgresInfra({ connection, pool }, logger) {
  const pgPool = createPool({
    connection,
    pool,
    logger,
  });

  const transactionManager = createTransactionManager({
    pool: pgPool,
    logger,
  });

  return {
    pool: pgPool,
    transaction: transactionManager,
    health: () => checkPostgresHealth(pgPool),
  };
}
