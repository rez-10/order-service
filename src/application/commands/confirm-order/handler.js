// /**
//  * ConfirmOrderHandler
//  *
//  * Command:
//  *   ConfirmOrder
//  *
//  * Lifecycle:
//  *   CREATED → CONFIRMED
//  *
//  * Guarantees:
//  * - Idempotent via commandId
//  * - State transition enforced
//  * - Transactional write
//  */
// export class ConfirmOrderHandler {
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
//       "ConfirmOrder command received"
//     );

//     await this.uow.withTransaction(async (tx) => {
//       const alreadyProcessed =
//         await this.commandDedupRepository.exists(commandId, { tx });

//       if (alreadyProcessed) {
//         this.logger.info(
//           { commandId },
//           "ConfirmOrder command already processed (idempotent noop)"
//         );
//         return;
//       }

//       // 1️⃣ Load order
//       const order =
//         await this.orderRepository.getById(command.orderId, { tx });

//       if (!order) {
//         throw new Error("Order not found");
//       }

//       if (order.status !== "CREATED") {
//         throw new Error("Only CREATED orders can be confirmed");
//       }

//       // 2️⃣ State transition
//       await this.orderRepository.updateStatus(
//         order.id,
//         "CONFIRMED",
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
//           eventType: "OrderConfirmed",
//           aggregateId: order.id,
//           payload: { orderId: order.id },
//           metadata
//         },
//         { tx }
//       );

//       this.logger.info(
//         { orderId: order.id, commandId },
//         "Order confirmed successfully"
//       );
//     });
//   }
// }
import { OrderAggregate } from "../../../domain/order.aggregate.js";
import { ErrorStore } from "../../../shared/errors/errorStore.js";
import { ERROR_CODES } from "../../../shared/errors/errorCodes.js";

/**
 * ConfirmOrderHandler (FINAL)
 *
 * Lifecycle:
 *   CREATED → CONFIRMED
 */
export class ConfirmOrderHandler {
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
      "ConfirmOrder command received"
    );

    await this.uow.withTransaction(async (tx) => {
      const exists = await this.commandDedupRepository.exists(commandId, { tx });

      if (exists) {
        this.logger.info(
          { commandId, requestId },
          "ConfirmOrder already processed (idempotent noop)"
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
        order.confirm();
      } catch (err) {
        throw ErrorStore.domain(ERROR_CODES.DOMAIN_ORDER_NOT_CONFIRMABLE, err.message, {
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
          eventType: "OrderConfirmed",
          aggregateId: order.id,
          payload: { orderId: order.id },
          metadata,
        },
        { tx }
      );

      this.logger.info({ orderId: order.id, commandId, requestId }, "Order confirmed successfully");
    });
  }
}
