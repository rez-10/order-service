import { test } from "node:test";
import assert from "node:assert";

import { SessionOrdersProjection } from "../../src/projections/session-orders.projection.js";

test("OrderCreated updates session orders", async () => {
  const repo = {
    upsert: (sid, doc) => (repo.value = { sid, doc })
  };

  const projection = new SessionOrdersProjection({ repo });

  await projection.onOrderCreated({
    payload: { sessionId: "s1", orderId: "o1" },
    occurredAt: new Date().toISOString()
  });

  assert.equal(repo.value.sid, "s1");
  assert.equal(repo.value.doc.orderId, "o1");
  assert.equal(repo.value.doc.status, "CREATED");
});
