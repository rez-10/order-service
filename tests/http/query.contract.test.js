import test from "node:test";
import assert from "node:assert";
import request from "supertest";

import { createFakeContainer } from "./fake-container.js";

test("GET /orders/:id → 200 with order payload", async () => {
  const container = createFakeContainer({
    queryHandlers: {
      getOrderDetail: async (orderId) => ({
        orderId,
        status: "CREATED"
      })
    }
  });

  container.app.get("/orders/:id", async (req, res) => {
    const result = await container.queryHandlers.getOrderDetail(req.params.id);
    res.status(200).json(result);
  });

  const res = await request(container.app).get("/orders/o1");

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.orderId, "o1");
  assert.equal(res.body.status, "CREATED");
});
