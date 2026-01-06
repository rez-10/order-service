import test from "node:test";
import assert from "node:assert";

// import { CreateOrderHandler } from "../../src/application/commands/create-order/handler.js";
// import { FakeUnitOfWork } from "../repositories/fake-unit-of-work.js";
// import { createFakeRepositories } from "../repositories/fake-repositories.js";

// test("CreateOrder creates order, dedup entry, and outbox event", async () => {
//   const uow = new FakeUnitOfWork();
//   const repos = createFakeRepositories();

//   const handler = new CreateOrderHandler({
//     uow,
//     ...repos,
//     logger: console
//   });

//   const envelope = {
//     metadata: {
//       commandId: "cmd-1",
//       issuedAt: new Date()
//     },
//     command: {
//       type: "CreateOrder",
//       sessionId: "s1"
//     }
//   };

//   await handler.execute(envelope);
import { CreateOrderHandler } from "../../src/application/commands/create-order/handler.js";
import { buildCommandDeps } from "../fakes/build-command-handler.js";

test("CreateOrder creates order, dedup entry, and outbox event", async () => {
  const deps = buildCommandDeps();
  const handler = new CreateOrderHandler(deps);

  await handler.execute({
    metadata: { commandId: "cmd-1" },
    command: { sessionId: "s1" }
  });
  assert.equal(repos.orderRepository.created.length, 1);
  assert.equal(repos.outboxRepository.events.length, 1);
  assert.ok(uow.committed);
});
test("CreateOrder is idempotent on same commandId", async () => {
  const uow = new FakeUnitOfWork();
  const repos = createFakeRepositories();

  const handler = new CreateOrderHandler({
    uow,
    ...repos,
    logger: console
  });

  const envelope = {
    metadata: { commandId: "cmd-1", issuedAt: new Date() },
    command: { type: "CreateOrder", sessionId: "s1" }
  };

  await handler.execute(envelope);
  await handler.execute(envelope);

  assert.equal(repos.orderRepository.created.length, 1);
});
