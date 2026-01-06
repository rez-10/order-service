import { test } from "node:test";
import assert from "node:assert";

import { KitchenQueueProjection } from "../../src/projections/kitchen-queue.projection.js";

test("OrderConfirmed adds order to kitchen queue", async () => {
  const repo = { add: (id) => (repo.value = id) };
  const projection = new KitchenQueueProjection(repo);

  await projection.project({ type: "OrderConfirmed", orderId: "o1" });

  assert.equal(repo.value, "o1");
});
