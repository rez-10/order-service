// import { createRedisClient } from "./redis.client.js";
// import { createRedisBreaker } from "./redis.breaker.js";
// import { checkRedisHealth } from "./redis.health.js";

// export async function createRedisInfra(config) {
//   const client = createRedisClient(config);
//   await client.connect();

//   const breaker = createRedisBreaker(client, config.breaker);

//   return {
//     client,
//     exec: breaker.exec,
//     health: () => checkRedisHealth(client)
//   };
// }

import { createRedisClient } from "./redis.client.js";
import { checkRedisHealth } from "./redis.health.js";

export function createRedisInfra({ connection, client }, logger) {
  const redis = createRedisClient({
    connection,
    client,
    logger,
  });

  return {
    client: redis,
    health: () => checkRedisHealth(redis),
  };
}
