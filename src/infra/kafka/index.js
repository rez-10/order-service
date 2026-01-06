import { createKafkaClient } from "./kafka.client.js";
import { createKafkaProducer } from "./kafka.producer.js";
import { createKafkaConsumer } from "./kafka.consumer.js";
import { checkKafkaHealth } from "./kafka.health.js";

/**
 * createKafkaInfra
 *
 * Factory-only. No consumers started.
 */
export function createKafkaInfra(config, logger) {
  const kafka = createKafkaClient(config.client, logger);

  return {
    kafka,
    createProducer: (producerConfig = {}) =>
      createKafkaProducer(kafka, { ...config.producer, ...producerConfig }, logger),

    createConsumer: (consumerConfig, handler) =>
      createKafkaConsumer(kafka, { ...config.consumer, ...consumerConfig }, handler, logger),

    health: () => checkKafkaHealth(kafka),
  };
}
