// import { SchemaRegistryClient } from "./registry.client.js";
// import { checkSchemaRegistryHealth } from "./registry.health.js";

// export function createSchemaRegistryInfra(config) {
//   const client = new SchemaRegistryClient(config);

//   return {
//     client,
//     health: () => checkSchemaRegistryHealth(client)
//   };
// }
import { createSchemaRegistryClient } from "./registry.client.js";
import { checkSchemaRegistryHealth } from "./registry.health.js";

export function createSchemaRegistryInfra(config, logger) {
  const client = createSchemaRegistryClient({
    ...config,
    logger,
  });

  return {
    client,
    health: () =>
      checkSchemaRegistryHealth({
        baseUrl: config.baseUrl,
        timeoutMs: config.timeoutMs,
        logger,
      }),

    // health: () => checkSchemaRegistryHealth(client)
  };
}
