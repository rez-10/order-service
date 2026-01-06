import { BaseConsumer } from "./base-consumer.js";

export class CompletedOrdersConsumer extends BaseConsumer {
  constructor({ consumer, projection, logger }) {
    super({ consumer, logger });
    this.projection = projection;
  }

  async start() {
    await super.start({
      topics: ["order.events"],
      groupId: "completed-orders-projection",
      handler: async (event) => {
        if (event.eventType === "OrderCompleted") {
          return this.projection.onOrderCompleted(event);
        }
      },
    });
  }
}
