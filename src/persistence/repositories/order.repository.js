import { ErrorStore } from "../../shared/errors/errorStore.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";

export class OrderRepository {
  async create(order, { tx }) {
    try {
      await tx.query(
        `
        INSERT INTO orders (
          id,
          session_id,
          status,
          created_at
        )
        VALUES ($1, $2, $3, $4)
        `,
        [order.id, order.sessionId, order.status, order.createdAt]
      );
    } catch (err) {
      if (err.code === "23505") {
        // Duplicate order id — should never happen, but safe guard
        return;
      }

      throw ErrorStore.infra(ERROR_CODES.INFRA_DB_UNAVAILABLE, "Failed to create order", {
        orderId: order.id,
      });
    }
  }

  async getById(orderId, { tx }) {
    try {
      const result = await tx.query(
        `
        SELECT id, session_id, status, created_at
        FROM orders
        WHERE id = $1
        `,
        [orderId]
      );

      return result.rows[0] || null;
    } catch (err) {
      throw ErrorStore.infra(ERROR_CODES.INFRA_DB_UNAVAILABLE, "Failed to fetch order", {
        orderId,
      });
    }
  }

  async updateStatus(orderId, status, updatedAt, { tx }) {
    try {
      const result = await tx.query(
        `
        UPDATE orders
        SET status = $1, updated_at = $2
        WHERE id = $3
        `,
        [status, updatedAt, orderId]
      );

      if (result.rowCount === 0) {
        throw ErrorStore.notFound("Order not found", { orderId });
      }
    } catch (err) {
      if (err.code) throw err;

      throw ErrorStore.infra(ERROR_CODES.INFRA_DB_UNAVAILABLE, "Failed to update order status", {
        orderId,
        status,
      });
    }
  }
}

