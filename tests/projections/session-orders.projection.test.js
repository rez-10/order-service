import { test } from "node:test";
import assert from "node:assert";

import { SessionOrdersProjection } from "../../src/projections/session-orders.projection.js";

test("OrderCreated updates session orders", async () => {
  const repo = {
    upsert: (sid, oid) => (repo.value = { sid, oid })
  };

  const projection = new SessionOrdersProjection(repo);

  await projection.project({
    type: "OrderCreated",
    sessionId: "s1",
    orderId: "o1"
  });

  assert.deepEqual(repo.value, { sid: "s1", oid: "o1" });
});
