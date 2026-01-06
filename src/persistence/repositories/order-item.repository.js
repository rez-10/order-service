import { ErrorStore } from "../../shared/errors/errorStore.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";

export class OrderItemRepository {
  async bulkCreate(items, { tx }) {
    if (!items.length) return;

    try {
      const values = [];
      const placeholders = items.map((item, index) => {
        const base = index * 7;
        values.push(
          item.id,
          item.orderId,
          item.itemId,
          item.quantity,
          item.price,
          item.tax,
          item.createdAt
        );
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
      });

      await tx.query(
        `
        INSERT INTO order_items (
          id,
          order_id,
          item_id,
          quantity,
          price,
          tax,
          created_at
        )
        VALUES ${placeholders.join(",")}
        `,
        values
      );
    } catch (err) {
      throw ErrorStore.infra(ERROR_CODES.INFRA_DB_UNAVAILABLE, "Failed to create order items", {
        count: items.length,
      });
    }
  }
}

// /**
//  * OrderItemRepository
//  *
//  * Supports:
//  * - Single insert
//  * - Bulk insert (preferred)
//  */
// export class OrderItemRepository {
//   async addMany(orderId, items, { client }) {
//     if (!items.length) return;

//     const values = [];
//     const placeholders = items.map((item, i) => {
//       const base = i * 5;
//       values.push(orderId, item.itemId, item.quantity, item.price, item.tax);
//       return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
//     });

//     await client.query(
//       `
//       INSERT INTO order_items (
//         order_id,
//         item_id,
//         quantity,
//         price,
//         tax
//       ) VALUES ${placeholders.join(",")}
//       `,
//       values
//     );
//   }
// }
