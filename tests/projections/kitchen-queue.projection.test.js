import { test } from "node:test";
import assert from "node:assert";

import { KitchenQueueProjection } from "../../src/projections/kitchen-queue.projection.js";

test("OrderConfirmed adds order to kitchen queue", async () => {
  const repo = {
    add: (key, id) => {
      repo.key = key;
      repo.value = id;
    }
  };
  const projection = new KitchenQueueProjection({ repo });

  await projection.onOrderConfirmed({
    payload: { orderId: "o1" },
    occurredAt: new Date().toISOString()
  });

  assert.equal(repo.value, "o1");
  assert.equal(repo.key, "queue:kitchen");
});
