import { ORDER_STATUS, canTransition } from "./order.lifecycle.js";

/**
 * Assert valid order state transition
 */
export function assertValidOrderTransition(order, nextStatus) {
  if (!canTransition(order.status, nextStatus)) {
    throw new Error(`Invalid order transition: ${order.status} → ${nextStatus}`);
  }
}

/**
 * Assert order allows item mutation
 */
export function assertOrderAllowsItemMutation(order) {
  if (order.status !== ORDER_STATUS.CREATED) {
    throw new Error(`Cannot modify items when order status is ${order.status}`);
  }
}
