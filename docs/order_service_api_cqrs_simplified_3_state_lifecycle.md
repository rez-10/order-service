# Order Service API (CQRS – Simplified 3‑State Lifecycle)

> **Service Role**  
> The Order Service captures **order intent**, manages the **order lifecycle**, and is the **system of record for order history**.
>
> **Key Clarification (Authoritative)**  
> The order lifecycle is intentionally **simple and strict**:
>
> - `CREATED`
> - `CONFIRMED`
> - `COMPLETED`
>
> Payment is a **precondition signal**, not a state.  
> Kitchen completion is an **external fact**, not an internal workflow.

---

## 0. Architectural Contract (Non‑Negotiable)

- Commands express **intent**, never state replacement
- Events express **facts**, always published
- Order Service owns **order state transitions**
- Payment Service provides **signals**, never decisions
- Meal Token Service provides **completion facts**
- Read models are **Redis‑only** (no DB fallback)
- Write side never depends on query side
- Downstream systems consume **events only**

---

## 1. Order Lifecycle (Final)

```
CREATED
  ↓ (ConfirmOrder command, payment already verified)
CONFIRMED
  ↓ (MealPrepared event from Meal Token Service)
COMPLETED
```

Rules:

- An order **starts** in `CREATED`
- An order is **confirmed manually** by reception
- An order is **completed externally** by kitchen flow
- No other states exist

---

## 2. Read APIs (Query Side – Redis Only)

> All read APIs serve **pre‑materialized views from Redis only**.  
> Staleness is accepted. DB access is forbidden at runtime.

---

### R1. Orders by Session

**GET** `/sessions/{sessionId}/orders`

```json
{
  "sessionId": "string",
  "orders": [
    {
      "orderId": "string",
      "status": "CREATED | CONFIRMED | COMPLETED",
      "itemCount": 3,
      "createdAt": "timestamp"
    }
  ]
}
```

---

### R2. Order Detail View

**GET** `/orders/{orderId}`

```json
{
  "orderId": "string",
  "status": "CONFIRMED",
  "items": [
    {
      "orderItemId": "string",
      "name": "Paneer Tikka",
      "qty": 2,
      "price": 240,
      "tax": 12
    }
  ]
}
```

---

### R3. Reception – Pending Confirmation Queue

**GET** `/reception/pending-confirmation`

Selection rule:

- `status = CREATED`

Purpose:

- Orders ready to be confirmed by reception

---

### R4. Kitchen – Active Orders Queue

**GET** `/kitchen/queue`

Selection rule:

- `status = CONFIRMED`

Kitchen never sees:

- CREATED orders
- COMPLETED orders

---

### R5. Completed Orders (Audit / Analytics)

**GET** `/orders/completed`

Selection rule:

- `status = COMPLETED`

---

## 3. Write APIs (Command Side – Intent Only)

> Write APIs mutate **order state** and emit **domain events**.

---

### W1. Create Order

**POST** `/sessions/{sessionId}/orders`

```json
{
  "source": "QR | STAFF | API"
}
```

Behavior:

- Creates order in `CREATED`

Emits:

- `OrderCreated`

---

### W2. Add Order Item

**POST** `/orders/{orderId}/items`

```json
{
  "menuItemId": "string",
  "qty": 2
}
```

Rules:

- Allowed only in `CREATED`

Emits:

- `OrderItemAdded`

---

### W3. Cancel Order

**POST** `/orders/{orderId}/cancel`

```json
{
  "reason": "string"
}
```

Rules:

- Allowed only in `CREATED`

Emits:

- `OrderCancelled`

---

### W4. Confirm Order (Reception Decision)

**POST** `/orders/{orderId}/confirm`

```json
{
  "confirmedBy": "staffId"
}
```

Rules:

- Allowed only in `CREATED`
- Payment must already be verified externally

Emits:

- `OrderConfirmed`

---

## 4. External Events Consumed (Facts)

### E1. MealPrepared (from Meal Token Service)

```json
{
  "orderId": "string",
  "tokenId": "string",
  "preparedAt": "timestamp"
}
```

Handling:

- Validates order exists
- Transitions order → `COMPLETED`
- Emits internal domain event

---

## 5. Order‑Owned Domain Events

### OrderCreated

```json
{ "orderId": "string", "sessionId": "string" }
```

### OrderItemAdded

```json
{ "orderId": "string", "orderItemId": "string" }
```

### OrderConfirmed

```json
{ "orderId": "string", "confirmedBy": "staffId" }
```

### OrderCompleted

```json
{ "orderId": "string", "completedAt": "timestamp" }
```

### OrderCancelled

```json
{ "orderId": "string", "reason": "string" }
```

---

## 6. Event → Read Model Mapping

| Event          | Session Orders | Reception Queue | Kitchen Queue | Completed Orders |
| -------------- | -------------- | --------------- | ------------- | ---------------- |
| OrderCreated   | ADD            | ADD             | —             | —                |
| OrderItemAdded | UPDATE         | —               | —             | —                |
| OrderConfirmed | UPDATE         | REMOVE          | ADD           | —                |
| OrderCompleted | UPDATE         | —               | REMOVE        | ADD              |
| OrderCancelled | UPDATE         | REMOVE          | REMOVE        | —                |

---

## 7. Write Flow Summary

```
Client / Reception
 → Command API
 → Validation
 → State transition
 → Commit
 → Event publication
```

---

## 8. Read Flow Summary

```
Client
 → Read API
 → Redis only
 → Response
```

No synchronous dependencies. No DB fallback.

---

## 9. Explicit Non‑Goals

This service does **not**:

- Verify payments
- Query payment service
- Coordinate kitchen execution
- Retry kitchen actions
- Guarantee read freshness

---

## 10. Status

**Lifecycle**: 3‑state (CREATED → CONFIRMED → COMPLETED)  
**Confirmation Owner**: Order Service  
**Completion Source**: Meal Token Service  
**Read Strategy**: Redis‑only

This document is the authoritative API and lifecycle contract for the Order Service.
