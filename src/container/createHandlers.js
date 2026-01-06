import { CreateOrderHandler } from "../application/commands/create-order/handler.js";
import { AddOrderItemsHandler } from "../application/commands/add-order-items/handler.js";
import { ConfirmOrderHandler } from "../application/commands/confirm-order/handler.js";
import { CompleteOrderHandler } from "../application/commands/complete-order/handler.js";

/**
 * createHandlers
 *
 * Wires command handlers.
 */
export function createHandlers({ repositories, unitOfWork, logger, clock }) {
  return {
    createOrder: new CreateOrderHandler({
      repositories,
      unitOfWork,
      logger,
      clock,
    }),

    addOrderItems: new AddOrderItemsHandler({
      repositories,
      unitOfWork,
      logger,
      clock,
    }),

    confirmOrder: new ConfirmOrderHandler({
      repositories,
      unitOfWork,
      logger,
      clock,
    }),

    completeOrder: new CompleteOrderHandler({
      repositories,
      unitOfWork,
      logger,
      clock,
    }),
  };
}
