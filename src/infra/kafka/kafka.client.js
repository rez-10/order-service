// import { Kafka } from "kafkajs";
// import { logger } from "../../shared/index.js";

// export function createKafkaClient(config) {
//   const kafka = new Kafka({
//     clientId: config.clientId,
//     brokers: config.brokers,
//     connectionTimeout: config.connectionTimeoutMs,
//     requestTimeout: config.requestTimeoutMs,
//     retry: {
//       retries: config.retries
//     }
//   });

//   logger.info(
//     { brokers: config.brokers },
//     "Kafka client created"
//   );

//   return kafka;
// }

import { Kafka } from "kafkajs";

export function createKafkaClient(clientConfig, logger) {
  return new Kafka({
    ...clientConfig,
    logCreator:
      () =>
      ({ log }) => {
        logger.debug(log, "Kafka log");
      },
  });
}
