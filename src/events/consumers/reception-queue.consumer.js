import { BaseConsumer } from "./base-consumer.js";

export class ReceptionQueueConsumer extends BaseConsumer {
  constructor({ consumer, projection, logger }) {
    super({ consumer, logger });
    this.projection = projection;
  }

  async start() {
    await super.start({
      topics: ["order.events"],
      groupId: "reception-queue-projection",
      handler: async (event) => {
        switch (event.eventType) {
          case "OrderCreated":
            return this.projection.onOrderCreated(event);

          case "OrderConfirmed":
            return this.projection.onOrderConfirmed(event);

          default:
            return;
        }
      },
    });
  }
}
