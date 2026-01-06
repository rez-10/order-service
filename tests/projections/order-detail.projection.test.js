import { test } from "node:test";
import assert from "node:assert";

import { OrderDetailProjection } from "../../src/projections/order-detail.projection.js";

test("OrderCreated writes order detail", async () => {
  const repo = {
    upsert: (doc) => (repo.doc = doc)
  };

  const projection = new OrderDetailProjection(repo);

  await projection.project({
    type: "OrderCreated",
    orderId: "o1",
    sessionId: "s1"
  });

  assert.equal(repo.doc.orderId, "o1");
});
