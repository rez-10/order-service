import { FakeOrderRepository } from "../repos/fake-order.repository.js";
import { FakeOrderItemRepository } from "../repos/fake-order-item.repository.js";
import { FakeCommandDedupRepository } from "../repos/fake-command-dedup.repository.js";
import { FakeOutboxRepository } from "../repos/fake-outbox.repository.js";
import { FakeUnitOfWork } from "./fake-unit-of-work.js";
import { FakeClock } from "./fake-clock.js";

export function buildCommandDeps(overrides = {}) {
  const orderRepo = new FakeOrderRepository();
  const orderItemRepo = new FakeOrderItemRepository();
  const dedupRepo = new FakeCommandDedupRepository();
  const outboxRepo = new FakeOutboxRepository();
  const clock = new FakeClock();

  const uow = new FakeUnitOfWork({
    orderRepo,
    orderItemRepo,
    dedupRepo,
    outboxRepo
  });

  return {
    unitOfWork: uow,
    clock,
    repos: {
      orderRepo,
      orderItemRepo,
      dedupRepo,
      outboxRepo
    },
    ...overrides
  };
}
