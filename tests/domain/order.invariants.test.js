// import test from "node:test";
// import assert from "node:assert";

// import { OrderAggregate } from "../../src/domain/order.aggregate.js";

// test("order must not confirm without required fields", () => {
//   const order = new OrderAggregate({
//     id: null,
//     sessionId: "s1",
//     status: "CREATED",
//     createdAt: new Date()
//   });

//   assert.throws(
//     () => order.confirm(),
//     (err) =>
//       err instanceof Error &&
//       err.message.includes("Invalid order"),
//     "Expected plain Error on invalid invariant"
//   );
// });

// test("order must have sessionId before lifecycle transition", () => {
//   const order = new OrderAggregate({
//     id: "o1",
//     sessionId: null,
//     status: "CREATED",
//     createdAt: new Date()
//   });

//   assert.throws(() => order.confirm(), Error);
// });

// test("order must have createdAt timestamp", () => {
//   const order = new OrderAggregate({
//     id: "o1",
//     sessionId: "s1",
//     status: "CREATED",
//     createdAt: null
//   });

//   assert.throws(() => order.confirm(), Error);
// });


import test from "node:test";
import assert from "node:assert";

import { OrderAggregate } from "../../src/domain/order.aggregate.js";

test("order must have an id", () => {
  assert.throws(() => {
    new OrderAggregate({
      sessionId: "s1",
      status: "CREATED",
      createdAt: Date.now()
    });
  }, Error);
});

test("order must have a sessionId", () => {
  assert.throws(() => {
    new OrderAggregate({
      id: "o1",
      status: "CREATED",
      createdAt: Date.now()
    });
  }, Error);
});

test("order must have createdAt timestamp", () => {
  assert.throws(() => {
    new OrderAggregate({
      id: "o1",
      sessionId: "s1",
      status: "CREATED"
    });
  }, Error);
});
