import { BaseConsumer } from "./base-consumer.js";

export class OrderDetailConsumer extends BaseConsumer {
  constructor({ consumer, projection, logger }) {
    super({ consumer, logger });
    this.projection = projection;
  }

  async start() {
    await super.start({
      topics: ["order.events"],
      groupId: "order-detail-projection",
      handler: async (event) => {
        switch (event.eventType) {
          case "OrderCreated":
            return this.projection.onOrderCreated(event);

          case "OrderItemsAdded":
            return this.projection.onItemsAdded(event);

          case "OrderConfirmed":
            return this.projection.onStatusUpdated(event, "CONFIRMED");

          case "OrderCompleted":
            return this.projection.onStatusUpdated(event, "COMPLETED");

          default:
            return;
        }
      },
    });
  }
}
