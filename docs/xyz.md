# Order Service Developer Guide

## Purpose
The Order Service is responsible for creating orders, managing their state transitions, and emitting domain events that drive read models and downstream workflows. It uses a command-driven write model paired with projections for query patterns.

## Architecture Overview
1. **Write model (commands + domain)**
   - Command handlers validate idempotency, load aggregates, enforce invariants, persist changes, and publish outbox events.
   - The `OrderAggregate` enforces lifecycle transitions and item mutation rules.
2. **Outbox + projections (read models)**
   - Outbox events are emitted by handlers and consumed to update projection repositories.
   - Projections translate events into query-focused data structures (queues, order detail, session orders).
3. **HTTP API**
   - HTTP handlers accept requests, validate inputs, and dispatch commands.
   - Reads are served from projection-backed repositories.

## Core Concepts
### Order Lifecycle
Orders move through a fixed lifecycle:
1. `CREATED`
2. `CONFIRMED`
3. `COMPLETED`

Only specific transitions are allowed (`CREATED → CONFIRMED → COMPLETED`). Attempts to skip or repeat transitions are rejected by domain invariants.

### Commands
Each command is handled inside a unit-of-work transaction:
1. **Idempotency check** using the command dedup repository.
2. **Aggregate load** from the write repository.
3. **Invariant enforcement** via the domain aggregate.
4. **State changes** persisted in write repositories.
5. **Outbox event** recorded for projections/consumers.

Commands implemented in `src/application/commands`:
- `CreateOrder`
- `ConfirmOrder`
- `CompleteOrder`
- `AddOrderItems`

### Events and Projections
Outbox events are consumed by projections in `src/projections`:
- **Reception queue**: tracks orders awaiting confirmation.
- **Kitchen queue**: tracks orders awaiting preparation.
- **Completed orders**: records finished orders.
- **Order detail**: materialized view of a single order.
- **Session orders**: session-centric view of a user’s orders.

Each projection exposes event handlers (for example, `onOrderCreated`) that update its backing repository.

## Directory Guide
- `src/application/commands`: command handlers and orchestration.
- `src/domain`: aggregates, lifecycle, and invariants.
- `src/projections`: event-driven read model updaters.
- `src/http`: REST endpoints and HTTP wiring.
- `src/infra` / `src/persistence`: persistence adapters.
- `tests`: unit, integration, projection, and contract tests.
- `docs`: design and operational documentation.

## Local Development
### Install
```bash
npm install
```

### Run the Service
```bash
npm start
```

### Run Tests
```bash
npm run test
```

## Working on the Service
1. **Pick a workflow**: command handler, projection, or HTTP layer.
2. **Update domain rules first** if invariants or lifecycle change.
3. **Adjust handlers** to honor idempotency and state transitions.
4. **Update projections** if event payloads or read models change.
5. **Maintain tests** in `tests/` alongside changes.

## Common Change Scenarios
### Adding a New Command
1. Define the command handler in `src/application/commands`.
2. Implement aggregate/invariant changes in `src/domain` if needed.
3. Persist state changes in write repositories.
4. Emit an outbox event to reflect the new change.
5. Add/adjust projection handlers and tests.

### Modifying a Projection
1. Update the projection handler in `src/projections`.
2. Ensure repository method signatures match the projection changes.
3. Update projection tests to assert repository side effects.

### Changing an Event Payload
1. Update command handler outbox payloads.
2. Update projection handlers that consume the payload.
3. Update tests for both the command and the projection.

## Operational Notes
- **Idempotency** is required for all commands.
- **Transactions** should wrap write model and outbox updates.
- **Read models** are eventually consistent with the write model.
