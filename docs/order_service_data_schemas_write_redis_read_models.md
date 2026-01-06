# Order Service – Data Schemas (Write & Redis Read Models)

This document consolidates **all authoritative data schemas** for the Order Service, derived from:

- **Order Service API (CQRS – Simplified 3‑State Lifecycle)** fileciteturn2file0
- **Order Service – Lifecycle Hardening Artifacts** fileciteturn2file1

Redis is the **authoritative read store**. Mongo/Postgres (or equivalent) are **write-only persistence** for command handling and event emission.

---

## 1. Write-Side Schemas (Authoritative)

> Used only by command handlers.  
> Never queried by read APIs.

### 1.1 `orders`

Aggregate root and lifecycle authority.

```json
{
  "_id": "orderId",
  "sessionId": "sessionId",
  "restaurantId": "restaurantId",
  "status": "CREATED | CONFIRMED | COMPLETED",
  "source": "QR | STAFF | API",
  "createdAt": "timestamp",
  "confirmedAt": "timestamp | null",
  "completedAt": "timestamp | null",
  "version": 1
}
```

Constraints:

- `status` transitions strictly follow: CREATED → CONFIRMED → COMPLETED
- No payment fields exist
- No derived totals exist

---

### 1.2 `order_items`

Immutable intent records attached to an order.

```json
{
  "_id": "orderItemId",
  "orderId": "orderId",
  "menuItemId": "menuItemId",
  "snapshot": {
    "name": "string",
    "price": 240,
    "tax": 12,
    "currency": "INR"
  },
  "qty": 2,
  "createdAt": "timestamp"
}
```

Rules:

- Items may be added **only while order.status = CREATED**
- Snapshots guarantee historical correctness

---

### 1.3 `outbox_events` (Transactional Outbox)

Ensures atomicity between state mutation and event publication.

```json
{
  "_id": "eventId",
  "aggregateType": "Order",
  "aggregateId": "orderId",
  "eventType": "OrderCreated | OrderItemAdded | OrderConfirmed | OrderCompleted | OrderCancelled",
  "payload": {},
  "occurredAt": "timestamp",
  "published": false
}
```

Rules:

- Written in the **same DB transaction** as business data
- Published asynchronously

---

## 2. Redis Read Schemas (Authoritative for Queries)

> Redis contains **fully materialized API responses**.  
> No DB fallback is allowed at runtime.

---

### 2.1 Session Orders View

**Redis Key**: `session:{sessionId}:orders`

```json
{
  "sessionId": "sessionId",
  "orders": [
    {
      "orderId": "orderId",
      "status": "CREATED | CONFIRMED | COMPLETED",
      "itemCount": 3,
      "createdAt": "timestamp"
    }
  ]
}
```

Built from events:

- OrderCreated
- OrderItemAdded
- OrderConfirmed
- OrderCompleted
- OrderCancelled

---

### 2.2 Order Detail View

**Redis Key**: `order:{orderId}:detail`

```json
{
  "orderId": "orderId",
  "status": "CONFIRMED",
  "items": [
    {
      "orderItemId": "orderItemId",
      "name": "string",
      "qty": 2,
      "price": 240,
      "tax": 12
    }
  ]
}
```

Built from events:

- OrderCreated
- OrderItemAdded
- OrderConfirmed
- OrderCompleted

---

### 2.3 Reception – Pending Confirmation Queue

**Redis Key**: `reception:pending-confirmation`

```json
{
  "orders": [
    {
      "orderId": "orderId",
      "sessionId": "sessionId",
      "createdAt": "timestamp"
    }
  ]
}
```

Selection rule:

- order.status = CREATED

---

### 2.4 Kitchen – Active Orders Queue

**Redis Key**: `kitchen:queue`

```json
{
  "orders": [
    {
      "orderId": "orderId",
      "sessionId": "sessionId",
      "confirmedAt": "timestamp"
    }
  ]
}
```

Selection rule:

- order.status = CONFIRMED

---

### 2.5 Completed Orders View

**Redis Key**: `orders:completed`

```json
{
  "orders": [
    {
      "orderId": "orderId",
      "sessionId": "sessionId",
      "completedAt": "timestamp"
    }
  ]
}
```

Selection rule:

- order.status = COMPLETED

---

## 3. Event → Read Model Mapping

| Event          | Session Orders | Order Detail | Reception Queue | Kitchen Queue | Completed Orders |
| -------------- | -------------- | ------------ | --------------- | ------------- | ---------------- |
| OrderCreated   | ADD            | INIT         | ADD             | —             | —                |
| OrderItemAdded | UPDATE count   | ADD item     | —               | —             | —                |
| OrderConfirmed | UPDATE         | UPDATE       | REMOVE          | ADD           | —                |
| OrderCompleted | UPDATE         | UPDATE       | —               | REMOVE        | ADD              |
| OrderCancelled | UPDATE         | UPDATE       | REMOVE          | REMOVE        | —                |

---

## 4. Schema Evolution Rules

- Fields may only be **added**, never removed
- Read models must tolerate unknown fields
- Write schema changes require new events
- Redis schemas may be rebuilt at any time

---

## 5. Final Notes

- Mongo/Postgres = **write truth only**
- Redis = **query truth**
- Events = **integration truth**

This schema set is **complete, closed, and authoritative** for the Order Service.
