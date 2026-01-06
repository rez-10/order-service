import test from "node:test";
import assert from "node:assert";

import { FakeRedis } from "../fakes/fake-redis.js";

test("redis down causes hard failure (no fallback)", async () => {
  const redis = new FakeRedis();
  redis.down = true;

  await assert.rejects(() => redis.get("order:1"));
});
