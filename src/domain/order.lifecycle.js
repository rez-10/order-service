/**
 * Order Lifecycle
 *
 * Allowed states and transitions
 */

export const ORDER_STATUS = {
  CREATED: "CREATED",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
};

const TRANSITIONS = {
  [ORDER_STATUS.CREATED]: [ORDER_STATUS.CONFIRMED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COMPLETED]: [],
};

/**
 * Validate state transition
 */
export function canTransition(from, to) {
  return TRANSITIONS[from]?.includes(to) ?? false;
}
