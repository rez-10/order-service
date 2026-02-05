import test from "node:test";
import assert from "node:assert";

import { AddOrderItemsHandler } from "../../src/application/commands/add-order-items/handler.js";
import { FakeUnitOfWork } from "../support/fake-unit-of-work.js";
import { createFakeRepositories } from "../fakes/fake-repositories.js";

test("AddOrderItems adds items and emits event", async () => {
  const uow = new FakeUnitOfWork();
  const repos = createFakeRepositories();

  await repos.orderRepository.create({
    id: "o1",
    sessionId: "s1",
    status: "CREATED",
    createdAt: new Date()
  });

  const handler = new AddOrderItemsHandler({
    uow,
    ...repos,
    logger: console
  });

  await handler.execute({
    metadata: { commandId: "cmd-1", issuedAt: new Date() },
    command: {
      type: "AddOrderItems",
      orderId: "o1",
      items: [{ itemId: "i1", quantity: 2, price: 100 }]
    }
  });

  assert.equal(repos.orderItemRepository.items.length, 1);
  assert.equal(repos.outboxRepository.events.length, 1);
});
