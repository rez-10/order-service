import { ORDER_STATUS } from "./order.lifecycle.js";
import { assertValidOrderTransition, assertOrderAllowsItemMutation } from "./invariants.js";

/**
 * Order Aggregate
 *
 * This is NOT an ORM entity.
 * It enforces domain rules only.
 */
export class OrderAggregate {
  constructor({ id, sessionId, status, createdAt }) {
    this.id = id;
    this.sessionId = sessionId;
    this.status = status;
    this.createdAt = createdAt;
  }

  static create({ id, sessionId, createdAt }) {
    return new OrderAggregate({
      id,
      sessionId,
      status: ORDER_STATUS.CREATED,
      createdAt,
    });
  }

  confirm() {
    assertValidOrderTransition(this, ORDER_STATUS.CONFIRMED);
    this.status = ORDER_STATUS.CONFIRMED;
  }

  complete() {
    assertValidOrderTransition(this, ORDER_STATUS.COMPLETED);
    this.status = ORDER_STATUS.COMPLETED;
  }

  assertItemsCanBeAdded() {
    assertOrderAllowsItemMutation(this);
  }
}
