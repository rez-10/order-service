import { ErrorStore } from "../shared/errors/errorStore.js";
import { ORDER_STATUS, canTransition } from "./order.lifecycle.js";

/**
 * Assert valid order state transition
 */
export function assertValidOrderTransition(order, nextStatus) {
  if (!canTransition(order.status, nextStatus)) {
    throw ErrorStore.domain(`Invalid order transition: ${order.status} → ${nextStatus}`);
  }
}

/**
 * Assert order allows item mutation
 */
export function assertOrderAllowsItemMutation(order) {
  if (order.status !== ORDER_STATUS.CREATED) {
    throw ErrorStore.domain(`Cannot modify items when order status is ${order.status}`);
  }
}
