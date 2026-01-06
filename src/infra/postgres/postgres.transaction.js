// import { isRetryablePostgresError } from "./postgres.errors.js";
// import { logger } from "../../shared/index.js";

// const MAX_RETRIES = 3;

// export function createTransactionManager(pool) {
//   return {
//     async withTransaction(fn) {
//       let attempt = 0;

//       while (true) {
//         const client = await pool.connect();

//         try {
//           await client.query("BEGIN");

//           const result = await fn(client);

//           await client.query("COMMIT");
//           return result;
//         } catch (err) {
//           await client.query("ROLLBACK");

//           attempt += 1;

//           if (isRetryablePostgresError(err) && attempt < MAX_RETRIES) {
//             logger.warn(
//               { attempt, code: err.code },
//               "Retrying Postgres transaction"
//             );
//             continue;
//           }

//           throw err;
//         } finally {
//           client.release();
//         }
//       }
//     }
//   };
// }

export function createTransactionManager({ pool, logger }) {
  async function withTransaction(fn) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  return { withTransaction };
}
