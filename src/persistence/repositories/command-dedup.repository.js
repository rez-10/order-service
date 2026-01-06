import { ErrorStore } from "../../shared/errors/errorStore.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";

export class CommandDedupRepository {
  async exists(commandId, { tx }) {
    try {
      const result = await tx.query(`SELECT 1 FROM command_dedup WHERE command_id = $1`, [
        commandId,
      ]);

      return result.rowCount > 0;
    } catch (err) {
      throw ErrorStore.infra(
        ERROR_CODES.INFRA_DB_UNAVAILABLE,
        "Failed to check command deduplication",
        { commandId }
      );
    }
  }

  async record({ commandId, commandType, aggregateId, processedAt }, { tx }) {
    try {
      await tx.query(
        `
        INSERT INTO command_dedup (
          command_id,
          command_type,
          aggregate_id,
          processed_at
        )
        VALUES ($1, $2, $3, $4)
        `,
        [commandId, commandType, aggregateId, processedAt]
      );
    } catch (err) {
      // Unique violation here means idempotent race — safe to ignore
      if (err.code === "23505") return;

      throw ErrorStore.infra(
        ERROR_CODES.INFRA_DB_UNAVAILABLE,
        "Failed to record command deduplication",
        { commandId }
      );
    }
  }
}

