# Phase 8 — Read Side (Redis Projections)

## Objective

Implement **Redis-only, rebuildable read models** derived from Kafka events, with explicit failure semantics and no database fallback.

---

## Scope

- Consume domain events from Kafka (Redpanda)
- Build query-optimized projections in Redis
- Serve all reads exclusively from Redis
- Support replay and rebuild from event log

---

## Preconditions

- Event definitions frozen (Phase 7)
- Redis is authoritative for reads
- At-least-once delivery accepted
- No DB fallback for queries
- Projections are disposable and rebuildable

---

## Projection Set

| Projection       | Purpose                      | Redis Structure |
| ---------------- | ---------------------------- | --------------- |
| Session Orders   | Orders per dining session    | HASH            |
| Order Detail     | Full order snapshot          | STRING (JSON)   |
| Reception Queue  | Orders awaiting confirmation | ZSET            |
| Kitchen Queue    | Orders awaiting preparation  | ZSET            |
| Completed Orders | Historical completed orders  | ZSET            |

---

## Redis Modeling Decisions

- **HASH** → mutable records keyed by `orderId`
- **STRING (JSON)** → single authoritative document
- **ZSET** → ordered, idempotent queues
- **LIST / SET** deliberately avoided (non-idempotent or unordered)

---

## Consumer Architecture

- One **consumer group per projection**
- Independent failure and scaling per projection
- Offset committed **only after Redis write succeeds**
- Any error → throw → Redpanda retries
- No swallow-and-continue logic

---

## Idempotency Strategy

- No read-side dedup tables
- Idempotency enforced via Redis operations:
  - `HSET` overwrites
  - `ZADD` overwrites by member
  - `ZREM` safe if missing
  - `SET` full document overwrite

---

## Query Surface & Failure Semantics

| Condition            | Response                        |
| -------------------- | ------------------------------- |
| Redis unavailable    | `503 Service Unavailable`       |
| Key missing (entity) | `404 Not Found`                 |
| Empty projection     | `200 OK` with empty result      |
| Projection lag       | Accepted (eventual consistency) |

No fallback to Postgres.

---

## Rebuild Strategy

- Redis treated as disposable
- Rebuild = flush Redis + replay Kafka from offset 0
- No write-side involvement
- Duplicate events safe

---

## Operational Scenarios

| Scenario                   | Outcome                        |
| -------------------------- | ------------------------------ |
| Redis flush                | Rebuild via Kafka replay       |
| Kafka replay               | Redis overwritten idempotently |
| Duplicate events           | No corruption                  |
| Partial projection failure | Isolated impact                |
| Consumer crash mid-event   | Retry, safe overwrite          |

---

## Directory Structure
