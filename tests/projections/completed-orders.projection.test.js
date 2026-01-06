import { test } from "node:test";
import assert from "node:assert";

import { CompletedOrdersProjection } from "../../src/projections/completed-orders.projection.js";

test("OrderCompleted adds order to completed orders", async () => {
  const repo = { add: (id) => (repo.value = id) };
  const projection = new CompletedOrdersProjection(repo);

  await projection.project({ type: "OrderCompleted", orderId: "o1" });

  assert.equal(repo.value, "o1");
});
