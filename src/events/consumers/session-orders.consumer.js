import { BaseConsumer } from "./base-consumer.js";

export class SessionOrdersConsumer extends BaseConsumer {
  constructor({ consumer, projection, logger }) {
    super({ consumer, logger });
    this.projection = projection;
  }

  async start() {
    await super.start({
      topics: ["order.events"],
      groupId: "session-orders-projection",
      handler: async (event) => {
        switch (event.eventType) {
          case "OrderCreated":
            return this.projection.onOrderCreated(event);
          case "OrderConfirmed":
            return this.projection.onOrderStatusUpdated(event, "CONFIRMED");
          case "OrderCompleted":
            return this.projection.onOrderStatusUpdated(event, "COMPLETED");
        }
      },
    });
  }
}
