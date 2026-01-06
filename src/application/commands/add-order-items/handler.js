// /**
//  * AddOrderItemsHandler
//  *
//  * Command:
//  *   AddOrderItems
//  *
//  * Lifecycle:
//  *   CREATED → CREATED
//  *
//  * Guarantees:
//  * - Idempotent via commandId
//  * - Price & tax snapshot per item
//  * - Transactional write (items + dedup + outbox)
//  */
// export class AddOrderItemsHandler {
//   constructor({
//     unitOfWork,
//     orderRepository,
//     orderItemRepository,
//     commandDedupRepository,
//     outboxRepository,
//     pricingService,
//     logger
//   }) {
//     this.uow = unitOfWork;
//     this.orderRepository = orderRepository;
//     this.orderItemRepository = orderItemRepository;
//     this.commandDedupRepository = commandDedupRepository;
//     this.outboxRepository = outboxRepository;
//     this.pricingService = pricingService;
//     this.logger = logger;
//   }

//   async execute(envelope) {
//     const { command, metadata } = envelope;
//     const { commandId, requestId } = metadata;

//     this.logger.info(
//       { commandId, requestId, orderId: command.orderId },
//       "AddOrderItems command received"
//     );

//     await this.uow.withTransaction(async (tx) => {
//       const alreadyProcessed =
//         await this.commandDedupRepository.exists(commandId, { tx });

//       if (alreadyProcessed) {
//         this.logger.info(
//           { commandId, requestId },
//           "AddOrderItems command already processed (idempotent noop)"
//         );
//         return;
//       }

//       // 1️⃣ Load order (write model, not Redis)
//       const order =
//         await this.orderRepository.getById(command.orderId, { tx });

//       if (!order) {
//         throw new Error("Order not found");
//       }

//       if (order.status !== "CREATED") {
//         throw new Error("Cannot add items to non-CREATED order");
//       }

//       // 2️⃣ Snapshot pricing per item
//       const items = [];

//       for (const item of command.items) {
//         const pricing =
//           await this.pricingService.snapshot(item.itemId);

//         items.push({
//           id: crypto.randomUUID(),
//           orderId: order.id,
//           itemId: item.itemId,
//           quantity: item.quantity,
//           price: pricing.price,
//           tax: pricing.tax,
//           createdAt: metadata.issuedAt
//         });
//       }

//       // 3️⃣ Persist items (bulk insert)
//       await this.orderItemRepository.bulkCreate(items, { tx });

//       // 4️⃣ Dedup record
//       await this.commandDedupRepository.record(
//         {
//           commandId,
//           commandType: command.type,
//           aggregateId: order.id,
//           processedAt: metadata.issuedAt
//         },
//         { tx }
//       );

//       // 5️⃣ Outbox event
//       await this.outboxRepository.add(
//         {
//           eventType: "OrderItemsAdded",
//           aggregateId: order.id,
//           payload: {
//             orderId: order.id,
//             itemCount: items.length
//           },
//           metadata
//         },
//         { tx }
//       );

//       this.logger.info(
//         { orderId: order.id, commandId },
//         "Order items added successfully"
//       );
//     });
//   }
// }

import crypto from "crypto";
import { OrderAggregate } from "../../../domain/order.aggregate.js";
import { ErrorStore } from "../../../shared/errors/errorStore.js";
import { ERROR_CODES } from "../../../shared/errors/errorCodes.js";

/**
 * AddOrderItemsHandler (FINAL)
 *
 * Lifecycle:
 *   CREATED → CREATED
 */
export class AddOrderItemsHandler {
  constructor({
    unitOfWork,
    orderRepository,
    orderItemRepository,
    commandDedupRepository,
    outboxRepository,
    pricingService,
    logger,
  }) {
    this.uow = unitOfWork;
    this.orderRepository = orderRepository;
    this.orderItemRepository = orderItemRepository;
    this.commandDedupRepository = commandDedupRepository;
    this.outboxRepository = outboxRepository;
    this.pricingService = pricingService;
    this.logger = logger;
  }

  async execute(envelope) {
    const { command, metadata } = envelope;
    const { commandId, requestId } = metadata;

    this.logger.info(
      { commandId, requestId, orderId: command.orderId },
      "AddOrderItems command received"
    );

    await this.uow.withTransaction(async (tx) => {
      const exists = await this.commandDedupRepository.exists(commandId, { tx });

      if (exists) {
        this.logger.info(
          { commandId, requestId },
          "AddOrderItems already processed (idempotent noop)"
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
        order.assertItemsCanBeAdded();
      } catch (err) {
        throw ErrorStore.domain(ERROR_CODES.DOMAIN_ITEMS_NOT_MODIFIABLE, err.message, {
          orderId: order.id,
          status: order.status,
        });
      }

      const items = [];

      for (const item of command.items) {
        const pricing = await this.pricingService.snapshot(item.itemId);

        items.push({
          id: crypto.randomUUID(),
          orderId: order.id,
          itemId: item.itemId,
          quantity: item.quantity,
          price: pricing.price,
          tax: pricing.tax,
          createdAt: metadata.issuedAt,
        });
      }

      await this.orderItemRepository.bulkCreate(items, { tx });

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
          eventType: "OrderItemsAdded",
          aggregateId: order.id,
          payload: {
            orderId: order.id,
            itemCount: items.length,
          },
          metadata,
        },
        { tx }
      );

      this.logger.info(
        { orderId: order.id, commandId, requestId },
        "Order items added successfully"
      );
    });
  }
}
