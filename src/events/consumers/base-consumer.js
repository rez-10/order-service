export class BaseConsumer {
  constructor({ consumer, logger }) {
    this.consumer = consumer;
    this.logger = logger;
  }

  async start({ topics, groupId, handler }) {
    await this.consumer.subscribe({
      topics,
      fromBeginning: false,
    });

    await this.consumer.run({
      groupId,
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());

          await handler(event);

          this.logger.debug(
            {
              topic,
              partition,
              offset: message.offset,
              eventType: event.eventType,
              aggregateId: event.aggregateId,
            },
            "Projection event processed"
          );
        } catch (err) {
          this.logger.error(
            {
              err,
              topic,
              partition,
              offset: message.offset,
            },
            "Projection consumer failed"
          );

          // IMPORTANT:
          // Throw → offset NOT committed → Redpanda retries
          throw err;
        }
      },
    });
  }
}
