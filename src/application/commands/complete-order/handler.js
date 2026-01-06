// /**
//  * CompleteOrderHandler
//  *
//  * Command:
//  *   CompleteOrder
//  *
//  * Lifecycle:
//  *   CONFIRMED → COMPLETED
//  *
//  * Guarantees:
//  * - Idempotent via commandId
//  * - Final state transition
//  * - Transactional write
//  */
// export class CompleteOrderHandler {
//   constructor({
//     unitOfWork,
//     orderRepository,
//     commandDedupRepository,
//     outboxRepository,
//     logger
//   }) {
//     this.uow = unitOfWork;
//     this.orderRepository = orderRepository;
//     this.commandDedupRepository = commandDedupRepository;
//     this.outboxRepository = outboxRepository;
//     this.logger = logger;
//   }

//   async execute(envelope) {
//     const { command, metadata } = envelope;
//     const { commandId, requestId } = metadata;

//     this.logger.info(
//       { commandId, requestId, orderId: command.orderId },
//       "CompleteOrder command received"
//     );

//     await this.uow.withTransaction(async (tx) => {
//       const alreadyProcessed =
//         await this.commandDedupRepository.exists(commandId, { tx });

//       if (alreadyProcessed) {
//         this.logger.info(
//           { commandId },
//           "CompleteOrder command already processed (idempotent noop)"
//         );
//         return;
//       }

//       // 1️⃣ Load order
//       const order =
//         await this.orderRepository.getById(command.orderId, { tx });

//       if (!order) {
//         throw new Error("Order not found");
//       }

//       if (order.status !== "CONFIRMED") {
//         throw new Error("Only CONFIRMED orders can be completed");
//       }

//       // 2️⃣ State transition
//       await this.orderRepository.updateStatus(
//         order.id,
//         "COMPLETED",
//         metadata.issuedAt,
//         { tx }
//       );

//       // 3️⃣ Dedup record
//       await this.commandDedupRepository.record(
//         {
//           commandId,
//           commandType: command.type,
//           aggregateId: order.id,
//           processedAt: metadata.issuedAt
//         },
//         { tx }
//       );

//       // 4️⃣ Outbox event
//       await this.outboxRepository.add(
//         {
//           eventType: "OrderCompleted",
//           aggregateId: order.id,
//           payload: { orderId: order.id },
//           metadata
//         },
//         { tx }
//       );

//       this.logger.info(
//         { orderId: order.id, commandId },
//         "Order completed successfully"
//       );
//     });
//   }
// }

import { OrderAggregate } from "../../../domain/order.aggregate.js";
import { ErrorStore } from "../../../shared/errors/errorStore.js";
import { ERROR_CODES } from "../../../shared/errors/errorCodes.js";

/**
 * CompleteOrderHandler (FINAL)
 *
 * Lifecycle:
 *   CONFIRMED → COMPLETED
 */
export class CompleteOrderHandler {
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
      { commandId, requestId, orderId: command.orderId },
      "CompleteOrder command received"
    );

    await this.uow.withTransaction(async (tx) => {
      const exists = await this.commandDedupRepository.exists(commandId, { tx });

      if (exists) {
        this.logger.info(
          { commandId, requestId },
          "CompleteOrder already processed (idempotent noop)"
        );
        return;
      }

      const orderData = await this.orderRepository.getById(command.orderId, { tx });

      if (!orderData) {
        throw ErrorStore.notFound("Order not found", {
          orderId: command.orderId,
        });
      }

      const order = new OrderAggregate(orderData);

      try {
        order.complete();
      } catch (err) {
        throw ErrorStore.domain(ERROR_CODES.DOMAIN_INVALID_ORDER_STATE, err.message, {
          orderId: order.id,
          status: order.status,
        });
      }

      await this.orderRepository.updateStatus(order.id, order.status, metadata.issuedAt, { tx });

      await this.commandDedupRepository.record(
        {
          commandId,
          commandType: command.type,
          aggregateId: order.id,
          processedAt: metadata.issuedAt,
        },
        { tx }
      );

      await this.outboxRepository.add(
        {
          eventType: "OrderCompleted",
          aggregateId: order.id,
          payload: { orderId: order.id },
          metadata,
        },
        { tx }
      );

      this.logger.info({ orderId: order.id, commandId, requestId }, "Order completed successfully");
    });
  }
}
