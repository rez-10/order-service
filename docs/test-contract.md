# Order Service — Test Contract (T1)

> **Purpose**
>
> This document locks the testing rules for T1 (skeleton-level tests).
> Its goal is to prevent drift between:
> - src code
> - tests
> - architectural intent (CQRS + DDD-lite)
>
> Any test or code change that violates this contract is considered invalid.

---

## 1. Scope of T1 (What We Are Testing)

T1 tests validate **structural correctness**, not production behavior.

Included:
- Domain rules & lifecycle correctness
- Command handler orchestration
- Projection logic (via repository effects)
- Idempotency semantics (command-dedup)
- Outbox write semantics (not dispatch)
- HTTP contract shape (status codes + payload shape)

Excluded:
- Real Redis / Postgres / Kafka behavior
- Network failures
- Infra availability (redis-down, kafka-down, etc.)
- Performance or concurrency

---

## 2. Error Semantics (LOCKED)

### 2.1 Domain Layer

**Domain throws plain `Error`, NOT `AppError`.**

Reason:
- Domain is pure business logic
- No transport, infra, or error-code awareness
- Keeps domain reusable and testable in isolation

Therefore:
- Domain tests MUST assert `Error`
- Domain tests MUST NOT import `AppError` or error codes

Example:
```js
assert.throws(() => order.confirm(), Error);
### 2.2 Application / Command Layer

Command handlers MAY wrap domain errors into AppError

Error mapping is the responsibility of:

command handlers

HTTP layer

Domain remains unaware of this

3. Domain Responsibilities (LOCKED)
Domain DOES:

Enforce lifecycle transitions:

CREATED → CONFIRMED → COMPLETED

Reject invalid transitions

Domain DOES NOT:

Validate presence of:

id

sessionId

createdAt

Validate request shape

Generate IDs

Throw AppError

Therefore:

Tests asserting missing id, sessionId, createdAt
must NOT exist in domain tests

These validations belong to:

Command handlers

HTTP validation middleware

4. Command Handler Testing Rules
What command tests assert:

Correct domain interaction

Repository calls

Dedup behavior

Outbox write

What command tests DO NOT assert:

SQL correctness

Redis correctness

Kafka publishing

Infra retries or failures

5. Fake Infrastructure Rules
5.1 FakeUnitOfWork

FakeUnitOfWork accepts NO constructor arguments

It is purely in-memory

It simulates transaction boundaries logically, not technically

Reason:

T1 is infra-agnostic

Postgres wiring is tested later

5.2 Fake Repositories (LOCKED LIST)

Fake repositories MUST mirror src repositories exactly:

Required fakes:

fake-order.repository.js

fake-order-item.repository.js

fake-command-dedup.repository.js

fake-outbox.repository.js

No additional fake repos are allowed.

6. Projections Testing Rules
Projections are tested via repository effects, not Redis directly.

Allowed:

projection.project(event);
assert.equal(repo.get(...), expected);


Not allowed:

Calling Redis APIs directly in tests

Inspecting internal projection state

Projection API (LOCKED)

All projections expose:

project(event)


They do NOT expose:

onOrderCreated

onOrderConfirmed

etc. (internal only)

7. Redis / ZSET Semantics in T1

FakeRedis only implements minimal semantics

Enough to validate ordering & idempotency

Not a full Redis emulator

ZSET guarantees in T1:

Ordering by score

Deterministic read order

8. HTTP Contract Tests

HTTP tests validate:

Status codes (200 / 202 / 404)

Response shape

Error format

HTTP tests DO NOT validate:

Database writes

Projection freshness

Redis availability

9. Explicit Exclusions (IMPORTANT)

The following tests are explicitly excluded from T1:

Redis-down failure tests

Kafka-down failure tests

Outbox-dispatch retry logic

Circuit breaker behavior

These belong to T2 / T3, not T1.

10. Rule of Change
If any of the following need to change:
Domain error type
Projection API
Repository list
Fake infra behavior
Then:
Update THIS document first
Get agreement
Only then update code/tests
No exceptions.

### 11. Summary (Non-negotiable)

-Domain throws Error
-Tests adapt to domain, not vice versa
-Projections tested via repos
-Fake infra mirrors src shape
-T1 stays infra-agnostic
-This document exists to stop drift.

