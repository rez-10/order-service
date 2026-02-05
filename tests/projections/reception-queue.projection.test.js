import { test } from "node:test";
import assert from "node:assert";

import { ReceptionQueueProjection } from "../../src/projections/reception-queue.projection.js";

test("OrderCreated adds order to reception queue", async () => {
  const repo = {
    add: (key, id) => {
      repo.key = key;
      repo.value = id;
    }
  };
  const projection = new ReceptionQueueProjection({ repo });

  await projection.onOrderCreated({
    payload: { orderId: "o1" },
    occurredAt: new Date().toISOString()
  });

  assert.equal(repo.value, "o1");
  assert.equal(repo.key, "queue:reception");
});
