import { ErrorStore } from "../../shared/errors/errorStore.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";

export class OutboxRepository {
  async add({ eventType, aggregateId, payload, metadata }, { tx }) {
    try {
      await tx.query(
        `
        INSERT INTO outbox (
          event_type,
          aggregate_id,
          payload,
          metadata,
          created_at,
          published
        )
        VALUES ($1, $2, $3, $4, $5, false)
        `,
        [
          eventType,
          aggregateId,
          JSON.stringify(payload),
          JSON.stringify(metadata),
          metadata.issuedAt,
        ]
      );
    } catch (err) {
      throw ErrorStore.infra(ERROR_CODES.INFRA_DB_UNAVAILABLE, "Failed to write outbox event", {
        eventType,
        aggregateId,
      });
    }
  }
}

