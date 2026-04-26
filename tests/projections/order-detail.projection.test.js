import { test } from "node:test";
import assert from "node:assert";

import { OrderDetailProjection } from "../../src/projections/order-detail.projection.js";

test("OrderCreated writes order detail", async () => {
  const repo = {
    store: new Map(),
    set: (key, doc) => repo.store.set(key, doc),
    get: (key) => repo.store.get(key)
  };

  const projection = new OrderDetailProjection({ repo });

  await projection.onOrderCreated({
    payload: { orderId: "o1", sessionId: "s1" },
    occurredAt: new Date().toISOString()
  });

  assert.equal(repo.store.get("o1").orderId, "o1");
});
