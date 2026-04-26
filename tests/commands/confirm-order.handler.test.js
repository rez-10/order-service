import test from "node:test";
import assert from "node:assert";

import { ConfirmOrderHandler } from "../../src/application/commands/confirm-order/handler.js";
import { FakeUnitOfWork } from "../repositories/fake-unit-of-work.js";
import { createFakeRepositories } from "../fakes/fake-repositories.js";

test("ConfirmOrder transitions CREATED → CONFIRMED and emits event", async () => {
  const uow = new FakeUnitOfWork();
  const repos = createFakeRepositories();

  // seed order
  await repos.orderRepository.create({
    id: "o1",
    sessionId: "s1",
    status: "CREATED",
    createdAt: new Date()
  });

  const handler = new ConfirmOrderHandler({
    unitOfWork: uow,
    ...repos,
    logger: console
  });

  await handler.execute({
    metadata: { commandId: "cmd-1", issuedAt: new Date() },
    command: { type: "ConfirmOrder", orderId: "o1" }
  });

  const order = await repos.orderRepository.getById("o1");

  assert.equal(order.status, "CONFIRMED");
  assert.equal(repos.outboxRepository.events.length, 1);
  assert.ok(uow.committed);
});
