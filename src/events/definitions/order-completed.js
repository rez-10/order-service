import crypto from "crypto";
import { clock } from "../../shared/index.js";

export const ORDER_COMPLETED = {
  eventType: "OrderCompleted",
  eventVersion: 1,
  schemaVersion: "v1",

  build({ orderId }, metadata) {
    return {
      eventId: crypto.randomUUID(),
      eventType: this.eventType,
      eventVersion: this.eventVersion,
      schemaVersion: this.schemaVersion,
      aggregateId: orderId,
      occurredAt: clock.now().toISOString(),
      payload: {
        orderId,
      },
      metadata,
    };
  },
};

/**
 * event envelope
{
  eventId,        // UUID
  eventType,      // string
  eventVersion,   // integer (semantic)
  schemaVersion,  // string (payload shape)
  aggregateId,    // orderId
  occurredAt,     // ISO timestamp
  payload,        // event-specific
  metadata        // propagated command metadata
}

 */
