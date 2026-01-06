import { buildCommandDeps } from "../support/build-command-deps.js";

import { CreateOrderHandler } from "../../src/application/commands/create-order/handler.js";
import { ConfirmOrderHandler } from "../../src/application/commands/confirm-order/handler.js";
import { CompleteOrderHandler } from "../../src/application/commands/complete-order/handler.js";
import { AddOrderItemsHandler } from "../../src/application/commands/add-order-items/handler.js";

import { commandController } from "../../src/http/controllers/command.controller.js";
import { queryController } from "../../src/http/controllers/query.controller.js";

export function createFakeContainer() {
  const deps = buildCommandDeps();

  const handlers = {
    createOrder: new CreateOrderHandler(deps),
    confirmOrder: new ConfirmOrderHandler(deps),
    completeOrder: new CompleteOrderHandler(deps),
    addOrderItems: new AddOrderItemsHandler(deps)
  };

  return {
    deps,
    handlers,
    controllers: {
      commandController: commandController(handlers),
      queryController
    }
  };
}
