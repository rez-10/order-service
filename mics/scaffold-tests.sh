#!/bin/bash
set -euo pipefail
echo "Running under: $SHELL"
echo "BASH version: $BASH_VERSION"


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$SERVICE_ROOT"

ROOT=tests

FILES=(
  domain/order.lifecycle.test.js
  domain/order.invariants.test.js
  commands/create-order.handler.test.js
  commands/confirm-order.handler.test.js
  commands/complete-order.handler.test.js
  commands/add-order-items.handler.test.js
  http/command.contract.test.js
  http/query.contract.test.js
  projections/session-orders.projection.test.js
  projections/order-detail.projection.test.js
  projections/zset-pattern.test.js
  projections/replay-safety.test.js
  projections/completed-orders.projection.test.js
  projections/reception-queue.projection.test.js
  projections/kitchen-queue.projection.test.js
  failures/redis-down.test.js
  failures/dedup-hit.test.js
  failures/outbox-failure.test.js
  fakes/fake-redis.js
  fakes/fake-postgres.js
  fakes/fake-unit-of-work.js
  fakes/fake-repositories.js
  fakes/fake-outbox.js
  fakes/fake-handler.js
  fakes/fake-container.js
  fakes/index.js
)

for f in "${FILES[@]}"; do
  mkdir -p "$ROOT/$(dirname "$f")"
  touch "$ROOT/$f"
done

echo "tests/ scaffolded at $SERVICE_ROOT/tests"
