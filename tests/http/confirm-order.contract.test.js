import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import { createFakeContainer } from "./fake-container.js";

test("POST /orders/:id/confirm → 202 Accepted", async () => {
  let calledWith;

  const container = createFakeContainer({
    commandHandlers: {
      confirmOrder: async (cmd) => {
        calledWith = cmd.orderId;
      }
    }
  });

  container.app.post("/orders/:id/confirm", async (req, res) => {
    await container.commandHandlers.confirmOrder({
      orderId: req.params.id
    });
    res.status(202).end();
  });

  const res = await request(container.app)
    .post("/orders/o1/confirm")
    .send();

  assert.equal(res.statusCode, 202);
  assert.equal(calledWith, "o1");
});
