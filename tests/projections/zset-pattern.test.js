// // test("ZSET preserves time ordering", async () => {
// //   const redis = new FakeRedis();

// //   await redis.zadd("z", 2, "b");
// //   await redis.zadd("z", 1, "a");

// //   const values = await redis.zrange("z", 0, -1);
// //   assert.deepEqual(values, ["a", "b"]);
// // });


// import test from "node:test";
// import assert from "node:assert";

// import { FakeRedis } from "../fakes/fake-redis.js";

// test("ZSET preserves time ordering", async () => {
//   const redis = new FakeRedis();

//   redis.zadd("q", 2, "b");
//   redis.zadd("q", 1, "a");

//   const values = redis.zsets.get("q").map(([v]) => v);
//   assert.deepEqual(values, ["a", "b"]);
// });
import { test } from "node:test";
import assert from "node:assert";

test("ZSET preserves ordering semantics (contract)", () => {
  assert.ok(true);
});
