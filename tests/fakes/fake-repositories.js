import { FakeOrderRepository } from "../repos/fake-order-repository.js";
import { FakeOrderItemRepository } from "../repos/fake-order-item.repository.js";
import { FakeCommandDedupRepository } from "../repos/fake-command-dedup.repository.js";
import { FakeOutboxRepository } from "../repos/fake-outbox.repository.js";

class FakePricingService {
  async snapshot() {
    return { price: 100, tax: 10 };
  }
}

export function createFakeRepositories(overrides = {}) {
  const orderRepository = new FakeOrderRepository();
  const orderItemRepository = new FakeOrderItemRepository();
  const commandDedupRepository = new FakeCommandDedupRepository();
  const outboxRepository = new FakeOutboxRepository();
  const pricingService = new FakePricingService();

  return {
    orderRepository,
    orderItemRepository,
    commandDedupRepository,
    outboxRepository,
    pricingService,
    ...overrides,
  };
}
