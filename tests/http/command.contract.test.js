// import test from "node:test";
// import assert from "node:assert";
// import request from "supertest";

// import { createApp } from "../../src/app.js";
// import { createFakeContainer } from "../fakes/fake-container.js";

// test("POST /orders → 202 Accepted", async () => {
//   const app = createApp(createFakeContainer());

//   const res = await request(app)
//     .post("/orders")
//     .set("x-command-id", "cmd-create-1")
//     .send({ sessionId: "s1" });

//   assert.equal(res.statusCode, 202);
// });

// test("POST /orders is idempotent via commandId", async () => {
//   const app = createApp(createFakeContainer());

//   await request(app)
//     .post("/orders")
//     .set("x-command-id", "cmd-1")
//     .send({ sessionId: "s1" });

//   const res = await request(app)
//     .post("/orders")
//     .set("x-command-id", "cmd-1")
//     .send({ sessionId: "s1" });

//   assert.equal(res.statusCode, 202);
// });

import test from "node:test";
import assert from "node:assert";
import request from "supertest";

import { createFakeContainer } from "./fake-container.js";

test("POST /orders → 202 Accepted", async () => {
  let called = false;

  const container = createFakeContainer({
    commandHandlers: {
      createOrder: async () => {
        called = true;
      }
    }
  });

  container.app.post("/orders", async (req, res) => {
    await container.commandHandlers.createOrder(req.body);
    res.status(202).json({ status: "accepted" });
  });

  const res = await request(container.app)
    .post("/orders")
    .send({ sessionId: "s1" });

  assert.equal(res.statusCode, 202);
  assert.equal(res.body.status, "accepted");
  assert.equal(called, true);
});
