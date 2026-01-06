import crypto from "crypto";
import { clock } from "../../shared/index.js";

export const ORDER_ITEMS_ADDED = {
  eventType: "OrderItemsAdded",
  eventVersion: 1,
  schemaVersion: "v1",

  build({ orderId, items }, metadata) {
    return {
      eventId: crypto.randomUUID(),
      eventType: this.eventType,
      eventVersion: this.eventVersion,
      schemaVersion: this.schemaVersion,
      aggregateId: orderId,
      occurredAt: clock.now().toISOString(),
      payload: {
        orderId,
        items,
        /*
          items[] snapshot:
          {
            itemId,
            quantity,
            price,
            tax
          }
        */
      },
      metadata,
    };
  },
};
