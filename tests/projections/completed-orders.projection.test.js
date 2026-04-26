import { test } from "node:test";
import assert from "node:assert";

import { CompletedOrdersProjection } from "../../src/projections/completed-orders.projection.js";

test("OrderCompleted adds order to completed orders", async () => {
  const repo = {
    add: (key, id) => {
      repo.key = key;
      repo.value = id;
    }
  };
  const projection = new CompletedOrdersProjection({ repo });

  await projection.onOrderCompleted({
    payload: { orderId: "o1" },
    occurredAt: new Date().toISOString()
  });

  assert.equal(repo.value, "o1");
  assert.equal(repo.key, "orders:completed");
});
