# Engineering Pitfalls & Recommendations

This document reviews key modules under `src/` and highlights common or long-term pitfalls along with recommended changes.

## Infrastructure & Connectivity
### Redis Infra Initialization
**Pitfall**: `createRedisInfra` is invoked with a single object that already contains `logger`, but its signature expects a second `logger` argument. As written, `logger` is `undefined` inside `createRedisInfra`, so Redis client errors are not logged and no `exec` helper is exposed. This also skips `connect()` and breaker protection.

**Recommendation**:
1. Align the function signature to `createRedisInfra({ connection, client, logger })` and pass `logger` through to `createRedisClient`.
2. Reintroduce a consistent `exec` wrapper (or breaker) and explicitly connect the client during boot.
3. Ensure callers in `createInfra` match the final signature.

Files: `src/infra/redis/index.js`, `src/infra/redis/redis.client.js`, `src/container/createInfra.js`.

### Outbox Dispatcher Loop
**Pitfall**: `_loop` is an infinite loop with a fixed sleep. It does not guard against overlapping iterations if `_dispatchOnce` is slow, and `stop()` only flips a flag (does not break early if a sleep is in-flight).

**Recommendation**:
1. Track the in-flight sleep promise so `stop()` can cancel or short-circuit.
2. Consider exponential backoff or jitter on errors to reduce noisy failure loops.
3. Add a shutdown hook to flush pending publishes before exit.

Files: `src/events/outbox/outbox-dispatcher.job.js`.

## Domain & Command Handling
### Domain Invariants vs. Aggregate Construction
**Pitfall**: `OrderAggregate` accepts raw fields without validation. Invariants are only checked on transitions, so invalid aggregates can exist in memory if loaded from storage with missing fields.

**Recommendation**:
1. Add a lightweight validation method invoked by command handlers after loading order data.
2. Optionally enforce required fields in the constructor or through a factory to prevent invalid instances.

Files: `src/domain/order.aggregate.js`, `src/domain/invariants.js`, `src/application/commands/*/handler.js`.

### Command Idempotency Metadata
**Pitfall**: Dedup logic depends on `commandId` existence. If middleware fails to attach metadata, idempotency is silently bypassed.

**Recommendation**:
1. Validate command metadata at the middleware boundary and reject requests without `commandId`.
2. Add test coverage for missing metadata to ensure consistent behavior.

Files: `src/http/middlewares/command-metadata.js`, `src/http/controllers/command.controller.js`.

## Event Semantics & Projections
### Event Payload Consistency
**Pitfall**: Projections depend on `event.payload` and `event.metadata` (sessionId in particular). If the producer omits `sessionId` in metadata, `SessionOrdersProjection` will write under `undefined`.

**Recommendation**:
1. Ensure all events that update session orders include `sessionId` in metadata or payload.
2. Add a guard in the projection to skip updates when sessionId is missing.

Files: `src/projections/session-orders.projection.js`, `src/events/definitions/*`.

### Ordering & Time Semantics
**Pitfall**: Projections use `Date.parse(event.occurredAt)` without enforcing time format or monotonic ordering. Malformed timestamps can result in incorrect ordering in queues.

**Recommendation**:
1. Validate timestamp format before enqueuing.
2. Consider source-of-truth clocks for event creation.

Files: `src/projections/reception-queue.projection.js`, `src/projections/kitchen-queue.projection.js`, `src/projections/completed-orders.projection.js`.

## HTTP & API Boundaries
### Controller Duplication
**Pitfall**: Both `command.controller.js` and `command2.controller.js` exist, which can lead to drift in behavior if both are routed.

**Recommendation**:
1. Remove the unused controller or document why both exist.
2. Ensure only one command controller is wired in routing.

Files: `src/http/controllers/command.controller.js`, `src/http/controllers/command2.controller.js`, `src/http/routes.js`.

### Error Response Consistency
**Pitfall**: Errors can bubble from infra and domain layers without unified mapping, leading to inconsistent HTTP responses.

**Recommendation**:
1. Consolidate error mapping in `errorHandler` to enforce stable API error shapes.
2. Add tests for common failure modes (not found, invalid state, infra failure).

Files: `src/shared/errors/errorHandler.js`, `src/shared/response/errorResponse.js`, `src/http/middlewares/validate.js`.

## Persistence & Data Shape
### Repository Contract Drift
**Pitfall**: Command handlers depend on repository method names (`create`, `updateStatus`, etc.). If repository contracts change, failures can occur silently at runtime.

**Recommendation**:
1. Define and enforce repository interfaces (TypeScript types or JSDoc contracts).
2. Add integration tests that exercise repository methods used by each handler.

Files: `src/persistence/repositories/*.js`, `src/application/commands/*/handler.js`.

---

## Suggested Next Steps
1. Decide which infra gaps (Redis exec/connect/breaker) should be addressed first.
2. Add lightweight aggregate validation for loaded orders.
3. Consolidate controllers to avoid duplicated behavior.
4. Strengthen event payload guarantees for session-aware projections.
   