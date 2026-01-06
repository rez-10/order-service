import test from "node:test";
import assert from "node:assert";

import { CompleteOrderHandler } from "../../src/application/commands/complete-order/handler.js";
import { FakeUnitOfWork } from "../repositories/fake-unit-of-work.js";
import { createFakeRepositories } from "../fakes/fake-repositories.js";

test("CompleteOrder transitions CONFIRMED → COMPLETED", async () => {
  const uow = new FakeUnitOfWork();
  const repos = createFakeRepositories();

  await repos.orderRepository.create({
    id: "o1",
    sessionId: "s1",
    status: "CONFIRMED",
    createdAt: new Date()
  });

  const handler = new CompleteOrderHandler({
    uow,
    ...repos,
    logger: console
  });

  await handler.execute({
    metadata: { commandId: "cmd-1", issuedAt: new Date() },
    command: { type: "CompleteOrder", orderId: "o1" }
  });

  const order = await repos.orderRepository.findById("o1");

  assert.equal(order.status, "COMPLETED");
  assert.equal(repos.outboxRepository.events.length, 1);
});
