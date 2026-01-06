# Order Service — Lifecycle Hardening Artifacts (Authoritative)

This document complements the **Order Service CQRS – 3-State Lifecycle** contract.
It captures **enforcement rules, edge-case handling, and architectural decisions**
required for production correctness.

---

## 1. Order State Machine (Explicit & Closed)

The Order Service supports **exactly three states**:

```
CREATED → CONFIRMED → COMPLETED
```

No other states are permitted.

---

## 2. State Transition Table (Enforcement Source)

This table is used for:

- Runtime guards
- Aggregate validation
- Automated tests
- Audit verification

| Current State | Trigger      | Type    | Allowed | Next State   | Notes                  |
| ------------- | ------------ | ------- | ------- | ------------ | ---------------------- |
| —             | CreateOrder  | Command | ✅      | CREATED      | Order birth            |
| CREATED       | AddOrderItem | Command | ✅      | CREATED      | Mutates aggregate      |
| CREATED       | CancelOrder  | Command | ✅      | — (terminal) | Emits `OrderCancelled` |
| CREATED       | ConfirmOrder | Command | ✅      | CONFIRMED    | Payment pre-verified   |
| CREATED       | MealPrepared | Event   | ❌      | —            | Invalid                |
| CONFIRMED     | AddOrderItem | Command | ❌      | —            | Hard reject            |
| CONFIRMED     | CancelOrder  | Command | ❌      | —            | Hard reject            |
| CONFIRMED     | ConfirmOrder | Command | ❌      | —            | Idempotent reject      |
| CONFIRMED     | MealPrepared | Event   | ✅      | COMPLETED    | External fact          |
| COMPLETED     | Any Command  | —       | ❌      | —            | Terminal               |
| COMPLETED     | MealPrepared | Event   | ❌      | —            | Idempotent ignore      |

**Invariant**

> There is only one forward path.  
> Backward or lateral transitions are impossible.

---

## 3. Command Idempotency Rules

All write APIs must support **client-supplied idempotency keys**.

| Command      | Idempotency Key                | Duplicate Behavior            |
| ------------ | ------------------------------ | ----------------------------- |
| CreateOrder  | `(sessionId, clientRequestId)` | Return existing order         |
| AddOrderItem | `(orderId, clientRequestId)`   | No-op, return success         |
| CancelOrder  | `orderId`                      | Ignore if already cancelled   |
| ConfirmOrder | `orderId`                      | Reject unless state = CREATED |

**Rule**

> Commands are never retried blindly by the server.  
> Clients own retry semantics.

---

## 4. Event Idempotency Rules

Events are processed **at-least-once** and must be safe to re-consume.

| Event          | Idempotency Key                      | Handling          |
| -------------- | ------------------------------------ | ----------------- |
| OrderCreated   | `orderId`                            | Exactly once      |
| OrderItemAdded | `orderItemId`                        | Ignore duplicates |
| OrderConfirmed | `orderId`                            | Ignore duplicates |
| MealPrepared   | `tokenId` or `(orderId, preparedAt)` | Ignore duplicates |
| OrderCompleted | `orderId`                            | Exactly once      |

**Critical**

> Kitchen systems retry aggressively — `MealPrepared` must be idempotent.

---

## 5. Out-of-Order Event Handling

### MealPrepared arrives early

| Order State | Handling                      |
| ----------- | ----------------------------- |
| NOT FOUND   | Park / retry via dead-letter  |
| CREATED     | Reject (confirmation missing) |
| CONFIRMED   | Accept → COMPLETE             |
| COMPLETED   | Ignore                        |

**Design Choice**

> Order Service does not buffer or reorder events.  
> Temporal correctness is enforced externally.

---

## 6. Payment Reversal Handling (Explicit Non-Responsibility)

### Event: `PaymentReversed`

**Decision**

- Order Service **does not mutate order state**

**Rationale**

- Order lifecycle models **operational intent**, not money
- Payment is asynchronous and reversible
- Kitchen execution may already be complete

| Scenario                     | Outcome                      |
| ---------------------------- | ---------------------------- |
| Reversal before confirmation | Reception never confirms     |
| Reversal after confirmation  | Billing / Accounting concern |
| Reversal after completion    | Audit & settlement issue     |

**Rejected Designs**

- `OrderSuspended`
- `PAYMENT_FAILED` state
- Dual order+payment state machines

---

## 7. End-to-End Sequence (Operational View)

```
Guest / Client
    |
    | CreateOrder
    v
Order Service
    |-- OrderCreated ------------------> Event Bus
    |
    | AddOrderItem (0..n)
    |
Payment Service
    |-- PaymentVerified (signal only)
    |
Reception
    | ConfirmOrder
    v
Order Service
    |-- OrderConfirmed ---------------> Event Bus
    |
Kitchen / Meal Token Service
    |-- MealPrepared (fact)
    v
Order Service
    |-- OrderCompleted ---------------> Event Bus
```

---

## 8. Runtime Enforcement Checklist

- Reject illegal state transitions
- Enforce command idempotency keys
- Ignore duplicate events
- Redis-only reads
- Emit exactly one event per state change

---

## 9. Architectural Decision Record (ADR)

**Title**: Exclusion of Payment State from Order Lifecycle

**Context**

- Payments are async, reversible, multi-instrument
- Orders model fulfillment intent

**Decision**

- Payment state is excluded from Order Service

**Consequences**

- Minimal, stable lifecycle
- No service coupling
- Financial inconsistency resolved elsewhere

**Status**

- Accepted (non-negotiable)

---

## 10. Final Status

- Lifecycle: **Closed, deterministic**
- Transitions: **Fully enforced**
- Idempotency: **Defined**
- Event ordering: **Handled**
- Payment coupling: **Explicitly rejected**

This document is **final and authoritative**.
