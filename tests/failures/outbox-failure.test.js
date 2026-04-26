import test from "node:test";
import assert from "node:assert";
import { CreateOrderHandler } from "../../src/application/commands/create-order/handler.js";
import { FakeUnitOfWork } from "../repositories/fake-unit-of-work.js";
import { createFakeRepositories } from "../fakes/fake-repositories.js";
test("outbox failure aborts transaction", async () => {
  const uow = new FakeUnitOfWork();
  const repos = createFakeRepositories();

  repos.outboxRepository.failNext = true;

  const handler = new CreateOrderHandler({
    unitOfWork: uow,
    ...repos,
    logger: console
  });

  await assert.rejects(() =>
    handler.execute({
      metadata: { commandId: "cmd-1", issuedAt: new Date() },
      command: { type: "CreateOrder", sessionId: "s1" }
    })
  );

  assert.equal(uow.committed, false);
  assert.equal(uow.rolledBack, true);
});
