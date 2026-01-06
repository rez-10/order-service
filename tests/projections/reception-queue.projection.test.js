import { test } from "node:test";
import assert from "node:assert";

import { ReceptionQueueProjection } from "../../src/projections/reception-queue.projection.js";

test("OrderCreated adds order to reception queue", async () => {
  const repo = { add: (id) => (repo.value = id) };
  const projection = new ReceptionQueueProjection(repo);

  await projection.project({ type: "OrderCreated", orderId: "o1" });

  assert.equal(repo.value, "o1");
});
