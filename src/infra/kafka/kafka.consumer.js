import { logger } from "../../shared/index.js";

export async function createKafkaConsumer(kafka, { groupId }, onMessage) {
  const consumer = kafka.consumer({
    groupId,
    allowAutoTopicCreation: false,
  });

  await consumer.connect();

  logger.info({ groupId }, "Kafka consumer connected");

  return {
    async subscribe(topics) {
      for (const topic of topics) {
        await consumer.subscribe({ topic, fromBeginning: false });
      }
    },

    async run() {
      await consumer.run({
        autoCommit: false,
        eachMessage: async (payload) => {
          try {
            await onMessage(payload);
            await consumer.commitOffsets([
              {
                topic: payload.topic,
                partition: payload.partition,
                offset: String(Number(payload.message.offset) + 1),
              },
            ]);
          } catch (err) {
            logger.error({ err, topic: payload.topic }, "Kafka message processing failed");
            throw err; // let Kafka retry
          }
        },
      });
    },

    async disconnect() {
      await consumer.disconnect();
      logger.info({ groupId }, "Kafka consumer disconnected");
    },
  };
}
