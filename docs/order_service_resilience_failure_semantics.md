# Order Service – Resilience & Failure Semantics

> **Purpose**  
> This document explains how the Order Service behaves when things are **not ideal**: partial outages, slow dependencies, retries, backpressure, and inconsistencies.  
> It is written for **developers and operators** who need to understand _why the system does not fail easily_ and _where resilience is intentionally enforced_.

This is **not theoretical**. Every rule here maps directly to decisions already taken in this service.

---

## 1. Design Principles (Non‑Negotiable)

1. **Correctness before availability (for writes)**  
   Orders must never enter an invalid state.

2. **Availability before freshness (for reads)**  
   Users may see stale or empty data, but the system must stay responsive.

3. **Local failures must not cascade**  
   A failure in Redis, Kafka, or Schema Registry must not corrupt Order state.

4. **No hidden fallbacks**  
   Every fallback is explicit, documented, and observable.

5. **Resilience logic never leaks into domain logic**  
   Domain rules stay pure. Resilience lives at infrastructure boundaries.

---

## 2. Dependency Classification

The Order Service interacts with several systems. Each dependency has a **defined failure contract**.

| Dependency         | Role                     | Criticality      |
| ------------------ | ------------------------ | ---------------- |
| PostgreSQL         | Write‑side truth         | Hard dependency  |
| Redis              | Authoritative read store | Soft dependency  |
| Kafka / Redpanda   | Event transport          | Async dependency |
| Schema Registry    | Event schema validation  | Async dependency |
| API Gateway / Auth | Access control           | Edge dependency  |

---

## 3. PostgreSQL (Write Master)

### Role

- Stores **orders**, **order_items**, and **outbox_events**
- Enforces transactional integrity

### Failure Semantics

- **Fail fast**
- No retries inside request handling
- No fallbacks

### Why

- Retrying writes risks duplicate state
- Clients or orchestration can retry safely (idempotency)
- Domain correctness is more important than availability

### Result

- If PostgreSQL is unavailable:
  - Write APIs return error immediately
  - No partial state is committed
  - No events are emitted

---

## 4. Redis (Authoritative Read Store)

### Role

- Serves all query APIs
- Holds denormalized, event‑driven views

### Failure Semantics

- **Circuit breaker enabled**
- Strict timeouts
- No fallback to PostgreSQL

### Behavior on Failure

- Query APIs return either:
  - `503 Service Unavailable`, or
  - empty / partial responses (endpoint‑specific)

### Why

- Falling back to DB re‑introduces layered architecture
- Prevents read amplification on write store
- Makes staleness explicit instead of hidden

### Result

- Read availability may degrade
- Write path remains unaffected
- System remains consistent

---

## 5. Kafka / Redpanda (Event Transport)

### Role

- Propagates domain events
- Drives projections and cross‑service communication

### Failure Semantics

- **Never part of HTTP request path**
- Protected by transactional outbox

### Behavior on Failure

- Events accumulate in outbox table
- Dispatcher retries asynchronously
- No write API ever fails due to Kafka

### Why

- Prevents lost events
- Decouples availability of messaging from core writes

### Result

- Temporary projection lag is acceptable
- System self‑heals once Kafka is available

---

## 6. Schema Registry

### Role

- Ensures event schema compatibility

### Failure Semantics

- Used only during publish / consume
- Cached aggressively
- Protected by circuit breaker

### Behavior on Failure

- Event publishing is skipped
- Outbox rows remain unpublished
- No data loss ques: or can we proceed without validation if we're aware of evolution state?

### Why

- Schema validation must not block writes
- Outbox guarantees eventual publication

---

## 7. API Gateway & Auth

### Role

- Authentication
- Authorization
- Rate limiting

### Service‑Level Assumptions

- Order Service **trusts** validated identity context
- upd: retries or circuit breakers inside the service at service level, orcestration level resilience will be taken care of separately, cherries (services) will just maintain the fine line between it.

### Why

- Auth is an edge concern
- Keeps service logic focused on domain

---

## 8. Circuit Breakers (Where They Exist)

Circuit breakers exist **only at outbound integration points**:

- Redis client
- Kafka producer
- Schema Registry client

They **do not** wrap:

- Domain logic
- Command handlers
- Repositories

---

## 9. Retry Policy

### Inside the Service

- Only for:
  - idempotent reads
  - schema fetches
- Never for business commands

### Outside the Service

- Client / orchestration retries are allowed
- Commands are idempotent

---

## 10. Bulkheads & Isolation

- Separate connection pools for:
  - PostgreSQL
  - Redis
  - Kafka

Failure in one pool must not exhaust others.

---

## 11. Health Checks

### Liveness

- Process up
- Event loop responsive

### Readiness

- PostgreSQL reachable → **required**
- Redis reachable → **optional**
- Kafka reachable → **optional**

This allows:

- Safe deployments
- Controlled traffic routing

---

## 12. Eventual Consistency & Lag

- Projections may lag behind writes
- Redis may show stale data
- This is **expected and acceptable**

Monitoring focuses on:

- outbox backlog
- projection lag

---

## 13. Explicit Non‑Goals

The Order Service will **not**:

- Fall back to DB for reads
- Call other services synchronously for decisions
- Retry domain mutations internally
- Guess or infer missing state

---

## 14. Mental Model for Developers

> **Writes are sacred.**  
> **Reads are expendable.**  
> **Events heal the system.**

If something fails:

- stop locally
- preserve correctness
- let the system converge later

---

## 15. Summary

This service is resilient because:

- failures are isolated
- correctness boundaries are respected
- async paths absorb instability
- no hidden fallbacks exist

If behavior is unclear during failure, **this document is the source of truth**.
