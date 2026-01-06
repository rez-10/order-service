import { UnitOfWork } from "../persistence/unit-of-work.js";

import { OrderRepository } from "../persistence/repositories/order.repository.js";
import { OrderItemRepository } from "../persistence/repositories/order-item.repository.js";
import { CommandDedupRepository } from "../persistence/repositories/command-dedup.repository.js";
import { OutboxRepository } from "../persistence/repositories/outbox.repository.js";

import { SessionOrdersRedisRepo } from "../read-models/redis/session-orders.repo.js";
import { OrderDetailRedisRepo } from "../read-models/redis/order-detail.repo.js";
import { QueuesRedisRepo } from "../read-models/redis/queues.repo.js";
import { CompletedOrdersRedisRepo } from "../read-models/redis/completed-orders.repo.js";

/**
 * createRepositories
 *
 * Wires persistence layer.
 */
export function createRepositories({ infra, logger }) {
  const unitOfWork = new UnitOfWork({
    postgres: infra.postgres,
  });

  const orderRepository = new OrderRepository({
    postgres: infra.postgres,
  });

  const orderItemRepository = new OrderItemRepository({
    postgres: infra.postgres,
  });

  const commandDedupRepository = new CommandDedupRepository({
    postgres: infra.postgres,
  });

  const outboxRepository = new OutboxRepository({
    postgres: infra.postgres,
  });

  const sessionOrdersRepo = new SessionOrdersRedisRepo({
    redis: infra.redis,
  });

  const orderDetailRepo = new OrderDetailRedisRepo({
    redis: infra.redis,
  });

  const queuesRepo = new QueuesRedisRepo({
    redis: infra.redis,
  });

  const completedOrdersRepo = new CompletedOrdersRedisRepo({
    redis: infra.redis,
  });

  return {
    unitOfWork,
    repositories: {
      order: orderRepository,
      orderItem: orderItemRepository,
      commandDedup: commandDedupRepository,
      outbox: outboxRepository,
      redis: {
        sessionOrders: sessionOrdersRepo,
        orderDetail: orderDetailRepo,
        queues: queuesRepo,
        completedOrders: completedOrdersRepo,
      },
    },
  };
}
