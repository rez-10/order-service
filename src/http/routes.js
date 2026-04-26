import express from "express";

// Controllers
// import { commandController } from "./controllers/command.controller.js";
// import { queryController } from "./controllers/query.controller.js";
import { commandController as createCommandController } from "./controllers/command.controller.js";
import { queryController as createQueryController } from "./controllers/query.controller.js";

// Middlewares
import { validate } from "./middlewares/validate.js";
import { validateParams } from "./middlewares/validate-params.js";
import { commandMetadataMiddleware } from "./middlewares/command-metadata.js";
import { authContextMiddleware } from "./middlewares/auth-context.js";

// Schemas (write)
import {
  createOrderSchema,
  addOrderItemsSchema,
  confirmOrderSchema,
  completeOrderSchema,
} from "./validation/command.schemas.js";

// Schemas (read)
import { orderIdParamSchema, sessionIdParamSchema } from "./validation/query.schemas.js";

// const router = express.Router();
export function createRoutes({ commands, queries, logger }) {
  const router = express.Router();

  // const commandController = commandController({ commands, logger });
  // const queryController = queryController({ queries, logger });
  // export function createRoutes({ commands, queries, logger }) {
  // const router = express.Router();

  const commandController = createCommandController({ commands, logger });
  const queryController = createQueryController({ queries, logger });

// router.use(authContextMiddleware);
/**
 * ============================
 * WRITE SIDE (COMMANDS)
 * ============================
 * Order of execution per route:
 *   requestId → authContext → commandMetadata → validate(body) → controller
 */

// C1. Create Order
router.post(
  "/orders",
  commandMetadataMiddleware,
  validate(createOrderSchema),
  commandController.createOrder
);

// C2. Add Order Items (Bulk)
router.post(
  "/orders/:orderId/items",
  commandMetadataMiddleware,
  validate(addOrderItemsSchema),
  commandController.addOrderItems
);

// C3. Confirm Order
router.post(
  "/orders/:orderId/confirm",
  commandMetadataMiddleware,
  validate(confirmOrderSchema),
  commandController.confirmOrder
);

// C4. Complete Order
router.post(
  "/orders/:orderId/complete",
  commandMetadataMiddleware,
  validate(completeOrderSchema),
  commandController.completeOrder
);

/**
 * ============================
 * READ SIDE (QUERIES)
 * ============================
 * Order of execution per route:
 *   requestId → authContext → validate(params) → controller
 */

// R1. Order Detail
router.get("/orders/:orderId", validateParams(orderIdParamSchema), queryController.getOrderDetail);

// R2. Orders by Session
// router.get(
//   "/sessions/:sessionId/orders",
//   validateParams(sessionIdParamSchema),
//   queryController.getOrdersBySession
// );

// R3. Reception Queue (CREATED)
// router.get("/reception/pending-confirmation", queryController.getPendingConfirmationQueue);

// R4. Kitchen Queue (CONFIRMED)
router.get("/kitchen/queue", queryController.getKitchenQueue);

// R5. Completed Orders
router.get("/orders/completed", queryController.getCompletedOrders);
  return router;
}
// export default router;

/**
✅ 1. Middleware order is intentional
Global middlewares (requestId, authContext) are assumed to be applied in app.js
Route-level middlewares apply only what’s needed
No over-validation.
 */

/*
router.get(
  "/sessions/:sessionId/orders",
  queryController.getSessionOrders
);

// Order Detail
router.get(
  "/orders/:orderId",
  queryController.getOrderDetail
);

// Reception Queue
router.get(
  "/queues/reception",
  queryController.getReceptionQueue
);

// Kitchen Queue
router.get(
  "/queues/kitchen",
  queryController.getKitchenQueue
);

// Completed Orders
router.get(
  "/orders/completed",
  queryController.getCompletedOrders
);

 */
