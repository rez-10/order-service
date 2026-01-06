import { BaseConsumer } from "./base-consumer.js";

export class KitchenQueueConsumer extends BaseConsumer {
  constructor({ consumer, projection, logger }) {
    super({ consumer, logger });
    this.projection = projection;
  }

  async start() {
    await super.start({
      topics: ["order.events", "meal.events"],
      groupId: "kitchen-queue-projection",
      handler: async (event) => {
        switch (event.eventType) {
          case "OrderConfirmed":
            return this.projection.onOrderConfirmed(event);

          case "MealPrepared":
            return this.projection.onMealPrepared(event);

          default:
            return;
        }
      },
    });
  }
}
