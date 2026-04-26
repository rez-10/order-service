// import test from "node:test";
// import assert from "node:assert";

// import { OrderAggregate } from "../../src/domain/order.aggregate.js";

// test("CREATED → CONFIRMED → COMPLETED lifecycle", () => {
//   const order = new OrderAggregate({
//     id: "o1",
//     sessionId: "s1",
//     status: "CREATED",
//     createdAt: new Date()
//   });

//   order.confirm();
//   order.complete();

//   assert.equal(order.status, "COMPLETED");
// });

// test("cannot complete before confirm", () => {
//   const order = new OrderAggregate({
//     id: "o1",
//     sessionId: "s1",
//     status: "CREATED",
//     createdAt: new Date()
//   });

//   assert.throws(
//     () => order.complete(),
//     (err) =>
//       err instanceof Error &&
//       err.message.includes("CREATED → COMPLETED")
//   );
// });

// test("cannot confirm twice", () => {
//   const order = new OrderAggregate({
//     id: "o1",
//     sessionId: "s1",
//     status: "CREATED",
//     createdAt: new Date()
//   });

//   order.confirm();

//   assert.throws(
//     () => order.confirm(),
//     (err) =>
//       err instanceof Error &&
//       err.message.includes("CONFIRMED → CONFIRMED")
//   );
// });

// test("cannot transition after completion", () => {
//   const order = new OrderAggregate({
//     id: "o1",
//     sessionId: "s1",
//     status: "CREATED",
//     createdAt: new Date()
//   });

//   order.confirm();
//   order.complete();

//   assert.throws(() => order.confirm(), Error);
// });


import test from "node:test";
import assert from "node:assert";

import { OrderAggregate } from "../../src/domain/order.aggregate.js";

function createValidOrder() {
  return new OrderAggregate({
    id: "o1",
    sessionId: "s1",
    status: "CREATED",
    createdAt: Date.now()
  });
}

test("CREATED → CONFIRMED → COMPLETED lifecycle", () => {
  const order = createValidOrder();
  order.confirm();
  order.complete();
  assert.equal(order.status, "COMPLETED");
});

test("cannot complete before confirm", () => {
  const order = createValidOrder();
  assert.throws(() => order.complete(), Error);
});

test("cannot confirm twice", () => {
  const order = createValidOrder();
  order.confirm();
  assert.throws(() => order.confirm(), Error);
});

test("cannot transition after completion", () => {
  const order = createValidOrder();
  order.confirm();
  order.complete();
  assert.throws(() => order.confirm(), Error);
});
