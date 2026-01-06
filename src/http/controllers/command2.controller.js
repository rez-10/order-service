import { asyncHandler, successResponse, clock } from "../../shared/index.js";

/**
 * Command Controller (Write Side)
 *
 * Implements ONLY the command APIs defined in:
 * order_service_api_cqrs_simplified_3_state_lifecycle.md
 *
 * Guarantees:
 * - Builds Command Envelopes
 * - Enforces async safety
 * - Delegates to command handlers
 * - Returns 202 Accepted (CQRS)
 *
 * Does NOT:
 * - Read from DB / Redis
 * - Apply business rules
 * - Perform idempotency checks
 */

export const commandController = {
  /**
   * C1. Create Order
   * POST /orders
   *
   * Lifecycle:
   *   ∅ → CREATED
   *
   * Notes:
   * - Creates an empty order
   * - Session-scoped
   */
  createOrder: asyncHandler(async (req, res) => {
    const envelope = buildEnvelope(req, {
      type: "CreateOrder",
      sessionId: req.body.sessionId,
    });

    await req.container.createOrderHandler.execute(envelope);

    res.status(202).json(successResponse());
  }),

  /**
   * C2. Add Order Items (Bulk)
   * POST /orders/:orderId/items
   *
   * Lifecycle:
   *   CREATED → CREATED
   *
   * Notes:
   * - Bulk add supported
   * - Each item snapshots price + tax
   */
  addOrderItems: asyncHandler(async (req, res) => {
    const envelope = buildEnvelope(req, {
      type: "AddOrderItems",
      orderId: req.params.orderId,
      items: req.body.items,
    });

    await req.container.addOrderItemsHandler.execute(envelope);

    res.status(202).json(successResponse());
  }),

  /**
   * C3. Confirm Order
   * POST /orders/:orderId/confirm
   *
   * Lifecycle:
   *   CREATED → CONFIRMED
   *
   * Notes:
   * - Payment is treated as input
   * - Order Service is the decision authority
   */
  confirmOrder: asyncHandler(async (req, res) => {
    const envelope = buildEnvelope(req, {
      type: "ConfirmOrder",
      orderId: req.params.orderId,
    });

    await req.container.confirmOrderHandler.execute(envelope);

    res.status(202).json(successResponse());
  }),

  /**
   * C4. Complete Order
   * POST /orders/:orderId/complete
   *
   * Lifecycle:
   *   CONFIRMED → COMPLETED
   *
   * Notes:
   * - Usually triggered via Meal Token Service event
   * - Can also be triggered manually (staff)
   */
  completeOrder: asyncHandler(async (req, res) => {
    const envelope = buildEnvelope(req, {
      type: "CompleteOrder",
      orderId: req.params.orderId,
    });

    await req.container.completeOrderHandler.execute(envelope);

    res.status(202).json(successResponse());
  }),
};

/**
 * Helper: Build Command Envelope
 *
 * Contract:
 * - Metadata comes from validated headers & middlewares
 * - Command payload is pure business intent
 */
function buildEnvelope(req, commandPayload) {
  const { commandId, source, actorId, actorRole } = req.commandMetadata;

  return {
    metadata: {
      commandId,
      requestId: req.requestId,
      source,
      actorId,
      actorRole,
      issuedAt: clock.now(),
      service: "order-service",
      version: 1,
    },
    command: commandPayload,
  };
}
