import crypto from "crypto";
import { clock } from "../../shared/index.js";

export const ORDER_CREATED = {
  eventType: "OrderCreated",
  eventVersion: 1,
  schemaVersion: "v1",

  build({ orderId, sessionId }, metadata) {
    return {
      eventId: crypto.randomUUID(),
      eventType: this.eventType,
      eventVersion: this.eventVersion,
      schemaVersion: this.schemaVersion,
      aggregateId: orderId,
      occurredAt: clock.now().toISOString(),
      payload: {
        orderId,
        sessionId,
      },
      metadata,
    };
  },
};
