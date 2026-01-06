// import { createClient } from "redis";
// import { logger } from "../../shared/index.js";

// export function createRedisClient(config) {
//   const client = createClient({
//     socket: {
//       host: config.host,
//       port: config.port,
//       reconnectStrategy: (retries) => {
//         if (retries >= config.maxReconnectAttempts) {
//           logger.error(
//             { retries },
//             "Redis reconnect attempts exhausted"
//           );
//           return new Error("Redis reconnect failed");
//         }

//         return Math.min(retries * 100, 2000);
//       }
//     },
//     password: config.password,
//     database: config.db
//   });

//   client.on("connect", () => {
//     logger.info("Redis client connected");
//   });

//   client.on("error", (err) => {
//     logger.error({ err }, "Redis client error");
//   });

//   return client;
// }

import { createClient } from "redis";

export function createRedisClient({ connection, client, logger }) {
  const redis = createClient({
    socket: {
      host: connection.host,
      port: connection.port,
      connectTimeout: client.connectTimeout,
    },
    username: connection.username,
    password: connection.password,
    maxRetriesPerRequest: client.maxRetriesPerRequest,
  });

  redis.on("error", (err) => {
    logger.error({ err }, "Redis client error");
  });

  return redis;
}
