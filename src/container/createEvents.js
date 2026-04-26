import { OutboxPublisher } from "../events/outbox/outbox.publisher.js";
import { OutboxDispatcher } from "../events/outbox/outbox-dispatcher.job.js";

// Consumers
import { SessionOrdersConsumer } from "../events/consumers/session-orders.consumer.js";
import { OrderDetailConsumer } from "../events/consumers/order-detail.consumer.js";
import { ReceptionQueueConsumer } from "../events/consumers/reception-queue.consumer.js";
import { KitchenQueueConsumer } from "../events/consumers/kitchen-queue.consumer.js";
import { CompletedOrdersConsumer } from "../events/consumers/completed-orders.consumer.js";

// Projections
import { SessionOrdersProjection } from "../projections/session-orders.projection.js";
import { OrderDetailProjection } from "../projections/order-detail.projection.js";
import { ReceptionQueueProjection } from "../projections/reception-queue.projection.js";
import { KitchenQueueProjection } from "../projections/kitchen-queue.projection.js";
import { CompletedOrdersProjection } from "../projections/completed-orders.projection.js";

// import { resolveTopicForEvent } from "../events/topic-resolver.js";

/**
 * createEvents
 *
 * Wires:
 * - OutboxPublisher
 * - OutboxDispatcher
 * - Kafka consumers
 * - Projections
 *
 */
export function createEvents({ infra, repositories, unitOfWork, logger, clock }) {
  /* ---------- Projections ---------- */

  const sessionOrdersProjection = new SessionOrdersProjection({
    repo: repositories.redis.sessionOrders,
    clock,
    logger,
  });

  const orderDetailProjection = new OrderDetailProjection({
    repo: repositories.redis.orderDetail,
    clock,
    logger,
  });

  const receptionQueueProjection = new ReceptionQueueProjection({
    repo: repositories.redis.queues,
    clock,
    logger,
  });

  const kitchenQueueProjection = new KitchenQueueProjection({
    repo: repositories.redis.queues,
    clock,
    logger,
  });

  const completedOrdersProjection = new CompletedOrdersProjection({
    repo: repositories.redis.completedOrders,
    clock,
    logger,
  });

  /* ---------- Consumers ---------- */

  const consumers = {
    sessionOrders: new SessionOrdersConsumer({
      kafka: infra.kafka,
      handler: sessionOrdersProjection,
      logger,
    }),

    orderDetail: new OrderDetailConsumer({
      kafka: infra.kafka,
      handler: orderDetailProjection,
      logger,
    }),

    receptionQueue: new ReceptionQueueConsumer({
      kafka: infra.kafka,
      handler: receptionQueueProjection,
      logger,
    }),

    kitchenQueue: new KitchenQueueConsumer({
      kafka: infra.kafka,
      handler: kitchenQueueProjection,
      logger,
    }),

    completedOrders: new CompletedOrdersConsumer({
      kafka: infra.kafka,
      handler: completedOrdersProjection,
      logger,
    }),
  };

  /* ---------- Outbox ---------- */

  const outboxPublisher = new OutboxPublisher({
    kafkaProducerFactory: infra.kafka.createProducer,
    schemaRegistry: infra.schemaRegistry,
    // topicResolver: resolveTopicForEvent,
    logger,
  });

  const outboxDispatcher = new OutboxDispatcher({
    outboxRepository: repositories.outbox,
    outboxPublisher,
    unitOfWork,
    logger,
  });

  return {
    publisher: outboxPublisher,
    dispatcher: outboxDispatcher,
    consumers,
  };
}
