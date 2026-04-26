import { asyncHandler, successResponse, clock } from "../../shared/index.js";

// /**
//  * Command Controller (Write Side)
//  *
//  * Responsibilities:
//  * - Build Command Envelope
//  * - Perform request-shape validation only
//  * - Delegate to command handlers
//  *
//  * Must NOT:
//  * - Read from DB / Redis
//  * - Apply business rules
//  * - Branch on context metadata
//  *
//  * Notes:
//  * - Authentication & authorization are handled at API Gateway
//  * - Idempotency is enforced in command handlers via commandId
//  */
// export const commandController = {
//   /**
//    * POST /orders
//    * ∅ → CREATED
//    */
//   createOrder: asyncHandler(async (req, res) => {
//     const envelope = buildEnvelope(req, {
//       type: "CreateOrder",
//       sessionId: req.body.sessionId,
//     });

//     await req.container.createOrderHandler.execute(envelope);

//     res.status(202).json(successResponse());
//   }),

//   /**
//    * POST /orders/:orderId/items
//    * CREATED → CREATED
//    */
//   addOrderItems: asyncHandler(async (req, res) => {
//     const envelope = buildEnvelope(req, {
//       type: "AddOrderItems",
//       orderId: req.params.orderId,
//       items: req.body.items,
//     });

//     await req.container.addOrderItemsHandler.execute(envelope);

//     res.status(202).json(successResponse());
//   }),

//   /**
//    * POST /orders/:orderId/confirm
//    * CREATED → CONFIRMED
//    */
//   confirmOrder: asyncHandler(async (req, res) => {
//     const envelope = buildEnvelope(req, {
//       type: "ConfirmOrder",
//       orderId: req.params.orderId,
//     });

//     await req.container.confirmOrderHandler.execute(envelope);

//     res.status(202).json(successResponse());
//   }),

//   /**
//    * POST /orders/:orderId/complete
//    * CONFIRMED → COMPLETED
//    */
//   completeOrder: asyncHandler(async (req, res) => {
//     const envelope = buildEnvelope(req, {
//       type: "CompleteOrder",
//       orderId: req.params.orderId,
//     });

//     await req.container.completeOrderHandler.execute(envelope);

//     res.status(202).json(successResponse());
//   }),
// };

// /**
//  * Build Command Envelope
//  *
//  * Contract:
//  * - req.commandMetadata is guaranteed by middleware
//  * - req.requestId is guaranteed by middleware
//  * - Domain will only receive `command`
//  */
// function buildEnvelope(req, commandPayload) {
//   const { commandId } = req.commandMetadata;
//   const { actorId, actorRole, source } = req.authContext;

//   return {
//     metadata: {
//       commandId,
//       requestId: req.requestId,
//       source,
//       actorId,
//       actorRole,
//       issuedAt: clock.now(),
//       service: "order-service",
//       version: 1,
//     },
//     command: commandPayload,
//   };
// }

export function commandController({ commands, logger }) {
  return {
    createOrder: asyncHandler(async (req, res) => {
      const envelope = buildEnvelope(req, {
        type: "CreateOrder",
        sessionId: req.body.sessionId,
      });

      await commands.createOrder.execute(envelope);

      res.status(202).json(successResponse());
    }),

    addOrderItems: asyncHandler(async (req, res) => {
      const envelope = buildEnvelope(req, {
        type: "AddOrderItems",
        orderId: req.params.orderId,
        items: req.body.items,
      });

      await commands.addOrderItems.execute(envelope);

      res.status(202).json(successResponse());
    }),

    confirmOrder: asyncHandler(async (req, res) => {
      const envelope = buildEnvelope(req, {
        type: "ConfirmOrder",
        orderId: req.params.orderId,
      });

      await commands.confirmOrder.execute(envelope);

      res.status(202).json(successResponse());
    }),

    completeOrder: asyncHandler(async (req, res) => {
      const envelope = buildEnvelope(req, {
        type: "CompleteOrder",
        orderId: req.params.orderId,
      });

      await commands.completeOrder.execute(envelope);

      res.status(202).json(successResponse());
    }),
  };
}