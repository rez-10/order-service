import { asyncHandler, successResponse } from "../../shared/index.js";

/**
 * Query Controller
 *
 * Rules:
 * - Redis-only reads
 * - No business logic
 * - No retries
 * - No fallback to DB
 * - Pagination handled in repos
 *
 * Error Mapping:
 * - Redis error -> throw (503 handled by errorHandler)
 * - Missing projection -> 404
 * - Empty projection -> 200 []
 */
export const queryController = {
  /**
   * GET /sessions/:sessionId/orders
   */
  getSessionOrders: asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { cursor, limit } = req.query;

    const result = await req.container.sessionOrdersQueryRepo.getBySession(sessionId, {
      cursor,
      limit: limit ? Number(limit) : undefined,
    });

    // Key missing semantics:
    // If hash doesn't exist, HSCAN returns empty with cursor "0".
    // We treat that as 404 only when explicitly missing.
    if (!result || (result.data.length === 0 && !result.nextCursor)) {
      // Optional: if you want strict "missing vs empty" distinction,
      // the repo can expose an `exists(sessionId)` check.
      // For now, accept empty as valid.
    }

    res.status(200).json(
      successResponse(result.data, {
        nextCursor: result.nextCursor,
      })
    );
  }),

  /**
   * GET /orders/:orderId
   */
  getOrderDetail: asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await req.container.orderDetailQueryRepo.getById(orderId);

    if (!order) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json(successResponse(order));
  }),

  /**
   * GET /queues/reception
   */
  getReceptionQueue: asyncHandler(async (req, res) => {
    const { offset, limit } = req.query;

    const result = await req.container.queuesQueryRepo.getQueue("queue:reception", {
      offset: offset ? Number(offset) : 0,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(200).json(
      successResponse(result.data, {
        nextOffset: result.nextOffset,
      })
    );
  }),

  /**
   * GET /queues/kitchen
   */
  getKitchenQueue: asyncHandler(async (req, res) => {
    const { offset, limit } = req.query;

    const result = await req.container.queuesQueryRepo.getQueue("queue:kitchen", {
      offset: offset ? Number(offset) : 0,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(200).json(
      successResponse(result.data, {
        nextOffset: result.nextOffset,
      })
    );
  }),

  /**
   * GET /orders/completed
   */
  getCompletedOrders: asyncHandler(async (req, res) => {
    const { offset, limit } = req.query;

    const result = await req.container.completedOrdersQueryRepo.getCompleted({
      offset: offset ? Number(offset) : 0,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(200).json(
      successResponse(result.data, {
        nextOffset: result.nextOffset,
      })
    );
  }),
};
