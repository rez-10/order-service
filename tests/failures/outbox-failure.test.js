import test from "node:test";
import assert from "node:assert";
import { FakeUnitOfWork } from "../repositories/fake-unit-of-work.js";
test("outbox failure aborts transaction", async () => {
  const uow = new FakeUnitOfWork();
  const repos = createFakeRepositories();

  repos.outboxRepository.failNext = true;

  const handler = new CreateOrderHandler({
    uow,
    ...repos,
    logger: console
  });

  await assert.rejects(() =>
    handler.execute({
      metadata: { commandId: "cmd-1" },
      command: { sessionId: "s1" }
    })
  );

  assert.equal(uow.committed, false);
  assert.equal(uow.rolledBack, true);
});
