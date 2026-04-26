import { FakeOrderRepository } from "../repos/fake-order-repository.js";
import { FakeOrderItemRepository } from "../repos/fake-order-item.repository.js";
import { FakeCommandDedupRepository } from "../repos/fake-command-dedup.repository.js";
import { FakeOutboxRepository } from "../repos/fake-outbox.repository.js";
import { FakeUnitOfWork } from "./fake-unit-of-work.js";

export function buildCommandDeps(overrides = {}) {
  const orderRepo = new FakeOrderRepository();
  const orderItemRepo = new FakeOrderItemRepository();
  const dedupRepo = new FakeCommandDedupRepository();
  const outboxRepo = new FakeOutboxRepository();

  return {
    unitOfWork: new FakeUnitOfWork(),
    orderRepository: orderRepo,
    orderItemRepository: orderItemRepo,
    commandDedupRepository: dedupRepo,
    outboxRepository: outboxRepo,
    ...overrides
  };
}
