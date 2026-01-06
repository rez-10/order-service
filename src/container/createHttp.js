/**
 * createHttp
 *
 * Exposes dependencies required by HTTP layer.
 * No Express wiring here.
 */
export function createHttp({ commands, repositories, logger }) {
  return {
    commands,
    queries: {
      sessionOrders: repositories.redis.sessionOrders,
      orderDetail: repositories.redis.orderDetail,
      queues: repositories.redis.queues,
      completedOrders: repositories.redis.completedOrders,
    },
    logger,
  };
}
