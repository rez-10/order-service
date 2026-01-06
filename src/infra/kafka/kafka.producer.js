import { logger } from "../../shared/index.js";

export async function createKafkaProducer(kafka, config) {
  const producer = kafka.producer({
    allowAutoTopicCreation: false,
    idempotent: config.idempotent,
    maxInFlightRequests: config.maxInFlightRequests,
    retry: {
      retries: config.retries,
    },
  });

  await producer.connect();

  logger.info("Kafka producer connected");

  return {
    async send(topic, messages) {
      return producer.send({
        topic,
        messages,
      });
    },

    async disconnect() {
      await producer.disconnect();
      logger.info("Kafka producer disconnected");
    },
  };
}
