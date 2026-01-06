import test from "node:test";
import assert from "node:assert";

import { CreateOrderHandler } from "../../src/application/commands/create-order/handler.js";
import { FakeUnitOfWork } from "../repositories/fake-unit-of-work.js";
import { createFakeRepositories } from "../fakes/fake-repositories.js";

test("dedup hit causes idempotent noop", async () => {
  const uow = new FakeUnitOfWork();
  const repos = createFakeRepositories();

  // Simulate dedup hit
  repos.commandDedupRepository.has = async () => true;

  const handler = new CreateOrderHandler({
    uow,
    ...repos,
    logger: console
  });

  await handler.execute({
    metadata: { commandId: "cmd-1" },
    command: { sessionId: "s1" }
  });

  assert.equal(repos.orderRepository.created.length, 0);
  assert.equal(repos.outboxRepository.events.length, 0);
});
