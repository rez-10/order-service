// // /**
// //  * UnitOfWork
// //  *
// //  * Responsibility:
// //  * - Provide a transactional execution boundary
// //  *
// //  * Guarantees:
// //  * - Either all operations inside succeed
// //  * - Or none are committed
// //  *
// //  * This is an interface / contract.
// //  */
// // export class UnitOfWork {
// //   /**
// //    * Execute work inside a transaction.
// //    *
// //    * @param {Function} work - async function receiving transaction context
// //    */
// //   async withTransaction(work) {
// //     throw new Error("UnitOfWork.withTransaction not implemented");
// //   }
// // }
// /**
//  * PostgresUnitOfWork
//  *
//  * Provides a transactional boundary for write operations.
//  *
//  * Responsibilities:
//  * - Acquire DB client
//  * - Begin transaction
//  * - Commit on success
//  * - Rollback on failure
//  * - Release client
//  *
//  * Does NOT:
//  * - Translate errors
//  * - Retry
//  * - Log business context
//  */
// export class PostgresUnitOfWork {
//   constructor({ pool, logger }) {
//     this.pool = pool;
//     this.logger = logger;
//   }

//   async withTransaction(work) {
//     const client = await this.pool.connect();

//     try {
//       await client.query("BEGIN");

//       // tx is intentionally opaque
//       const result = await work(client);

//       await client.query("COMMIT");
//       return result;
//     } catch (err) {
//       try {
//         await client.query("ROLLBACK");
//       } catch (rollbackErr) {
//         // rollback failure is critical, log it
//         this.logger.error({ err: rollbackErr }, "Transaction rollback failed");
//       }

//       // rethrow original error
//       throw err;
//     } finally {
//       client.release();
//     }
//   }
// }

/**
 * UnitOfWork
 *
 * Responsibilities:
 * - Provide a transactional boundary
 * - Delegate transaction lifecycle to Postgres infra
 *
 * Does NOT:
 * - Create DB connections
 * - Retry transactions
 * - Handle infra errors
 */
export class UnitOfWork {
  constructor({ transactionManager }) {
    this.transactionManager = transactionManager;
  }

  async withTransaction(work) {
    return this.transactionManager.withTransaction(async (client) => {
      return work(client);
    });
  }
}
