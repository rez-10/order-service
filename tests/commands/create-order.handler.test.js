import test from "node:test";
import assert from "node:assert";

import { CreateOrderHandler } from "../../src/application/commands/create-order/handler.js";
import { buildCommandDeps } from "../support/build-command-deps.js";

test("CreateOrder creates order, dedup entry, and outbox event", async () => {
  const deps = buildCommandDeps({ logger: console });
  const handler = new CreateOrderHandler(deps);

  await handler.execute({
    metadata: { commandId: "cmd-1", issuedAt: new Date() },
    command: { type: "CreateOrder", sessionId: "s1" }
  });

  assert.equal(deps.orderRepository.created.length, 1);
  assert.equal(deps.outboxRepository.events.length, 1);
  assert.ok(deps.unitOfWork.committed);
});
test("CreateOrder is idempotent on same commandId", async () => {
  const deps = buildCommandDeps({ logger: console });
  const handler = new CreateOrderHandler(deps);

  const envelope = {
    metadata: { commandId: "cmd-1", issuedAt: new Date() },
    command: { type: "CreateOrder", sessionId: "s1" }
  };

  await handler.execute(envelope);
  await handler.execute(envelope);

  assert.equal(deps.orderRepository.created.length, 1);
});
