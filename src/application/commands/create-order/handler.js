import crypto from "crypto";
import { OrderAggregate } from "../../../domain/order.aggregate.js";
import { ErrorStore } from "../../../shared/errors/errorStore.js";

/**
 * CreateOrderHandler (FINAL)
 *
 * Lifecycle:
 *   ∅ → CREATED
 */
export class CreateOrderHandler {
  constructor({ unitOfWork, orderRepository, commandDedupRepository, outboxRepository, logger }) {
    this.uow = unitOfWork;
    this.orderRepository = orderRepository;
    this.commandDedupRepository = commandDedupRepository;
    this.outboxRepository = outboxRepository;
    this.logger = logger;
  }

  async execute(envelope) {
    const { command, metadata } = envelope;
    const { commandId, requestId } = metadata;

    this.logger.info(
      { commandId, requestId, sessionId: command.sessionId },
      "CreateOrder command received"
    );

    await this.uow.withTransaction(async (tx) => {
      // 1️⃣ Idempotency guard
      const exists = await this.commandDedupRepository.exists(commandId, { tx });

      if (exists) {
        this.logger.info(
          { commandId, requestId },
          "CreateOrder already processed (idempotent noop)"
        );
        return;
      }

      // 2️⃣ Domain creation
      const order = OrderAggregate.create({
        id: crypto.randomUUID(),
        sessionId: command.sessionId,
        createdAt: metadata.issuedAt,
      });

      // 3️⃣ Persist order
      await this.orderRepository.create(
        {
          id: order.id,
          sessionId: order.sessionId,
          status: order.status,
          createdAt: order.createdAt,
        },
        { tx }
      );

      // 4️⃣ Record dedup
      await this.commandDedupRepository.record(
        {
          commandId,
          commandType: command.type,
          aggregateId: order.id,
          processedAt: metadata.issuedAt,
        },
        { tx }
      );

      // 5️⃣ Outbox event
      await this.outboxRepository.add(
        {
          eventType: "OrderCreated",
          aggregateId: order.id,
          payload: {
            orderId: order.id,
            sessionId: order.sessionId,
          },
          metadata,
        },
        { tx }
      );

      this.logger.info({ orderId: order.id, commandId, requestId }, "Order created successfully");
    });
  }
}
