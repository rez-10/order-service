# Order Service – SLA, SLI, and Their Relationship to SLO

This document formalizes **Service Level Indicators (SLIs)** and **Service Level Agreements (SLAs)** for the Order Service, and explains how they relate to the already-defined **Service Level Objectives (SLOs)**.

It is written to avoid ambiguity between **engineering targets**, **measurement**, and **external commitments**.

---

## 1. Terminology (Precise Definitions)

These definitions align with industry-standard usage (Google SRE model and common cloud-provider contracts).

### 1.1 Service Level Indicator (SLI)

An **SLI** is a **quantitative measurement** of some aspect of service behavior.

Examples:

- Request success rate
- Request latency percentile
- Event processing delay
- Availability of a dependency

**Key property**:  
An SLI is a _measurement_, not a promise.

---

### 1.2 Service Level Objective (SLO)

An **SLO** is an **internal engineering target** defined over one or more SLIs.

Examples:

- 99.5% of read requests succeed over 30 days
- 95% of writes complete within 300 ms

**Key property**:  
An SLO is a _goal_, not a contractual obligation.

(You have already defined SLOs in a previous document.)

---

### 1.3 Service Level Agreement (SLA)

An **SLA** is a **formal or semi-formal commitment** made to consumers of the service.

Examples:

- Minimum availability guarantee
- Explicit support or remediation obligations
- Credit or escalation terms

**Key property**:  
An SLA is a _promise with consequences_.

---

## 2. Why All Three Exist (And Must Stay Separate)

| Concept | Audience            | Purpose             |
| ------- | ------------------- | ------------------- |
| SLI     | Engineers / SRE     | Observe reality     |
| SLO     | Engineering org     | Control reliability |
| SLA     | Product / Customers | Set expectations    |

Conflating these leads to:

- Over-engineering
- Broken promises
- Reliability theater

---

## 3. SLIs for the Order Service

SLIs are defined **per execution path**, not per service.

### 3.1 Write-Side SLIs (Command Path)

These SLIs measure **business-critical correctness**.

| SLI                    | Definition                                     |
| ---------------------- | ---------------------------------------------- |
| Write availability     | % of commands receiving an acknowledgement     |
| Write latency (p95)    | Time to validate + commit + emit event         |
| Write durability       | % of acknowledged writes never lost            |
| Command rejection rate | % of valid commands rejected by business rules |

Notes:

- Redis health is **not** part of any write SLI
- Projection lag does **not** affect write SLIs

---

### 3.2 Read-Side SLIs (Query Path)

These SLIs measure **user-facing experience**, not correctness.

| SLI                       | Definition                                       |
| ------------------------- | ------------------------------------------------ |
| Query availability        | % of queries served from Redis                   |
| Query latency (p95 / p99) | End-to-end Redis read latency                    |
| Empty response rate       | % of successful queries returning empty datasets |
| Cache error rate          | % of Redis timeouts or connection failures       |

Notes:

- Empty responses are **not errors**
- Cache misses are counted as successful queries

---

### 3.3 Event & Projection SLIs

These SLIs measure **eventual consistency health**.

| SLI                         | Definition                                  |
| --------------------------- | ------------------------------------------- |
| Event publish success       | % of committed writes that emit events      |
| Projection processing delay | Time from event commit to projection update |
| Projection backlog size     | Number of unprocessed events                |

---

## 4. Mapping SLIs → SLOs (Engineering Control Layer)

SLOs are defined by **selecting acceptable bounds** on SLIs.

Example mappings:

- _Read SLO_:  
  "99.5% of read requests return a response (including empty) over 30 days"

- _Write SLO_:  
  "99.9% of write commands are acknowledged and durably committed"

- _Projection SLO_:  
  "95% of projections update within 30 seconds"

SLOs:

- Consume error budget
- Drive alerting thresholds
- Guide engineering prioritization

---

## 5. Defining SLAs for the Order Service

### 5.1 Principle: SLA < SLO

An SLA must always be **weaker than internal SLOs**.

Reason:

- SLOs allow error budget consumption
- SLAs must survive worst-case conditions

---

### 5.2 Recommended External SLA (Order Service)

This is a **conservative, defensible SLA** suitable for production systems.

#### Availability SLA

- **Write APIs**: 99.5% monthly availability
- **Read APIs**: 99.0% monthly availability

Availability definition:

- Successful HTTP response (2xx or 4xx)
- 503 counts as unavailable

---

#### Latency SLA

- No strict latency SLA for reads
- Writes must respond within a reasonable bounded time

Rationale:

- Latency is an SLO concern, not an SLA guarantee

---

#### Consistency SLA

The service explicitly **does not guarantee**:

- Read-your-writes consistency
- Immediate UI reflection
- Zero projection lag

This must be documented wherever the SLA is exposed.

---

## 6. SLA Violation Handling

An SLA violation:

- Is measured using SLIs
- Is evaluated over a fixed window (e.g. 30 days)
- Triggers support or escalation actions

It does **not**:

- Trigger automatic rollbacks
- Override architectural constraints
- Force fallback-to-DB behavior

---

## 7. Relationship Summary

```
Reality ──► SLI ──► SLO ──► SLA
           (measure) (target) (promise)
```

- SLIs describe what _is happening_
- SLOs describe what _engineering aims for_
- SLAs describe what _others may rely on_

Breaking this chain causes reliability failures or broken trust.

---

## 8. Final Notes

- SLIs must be instrumented before SLOs are enforced
- SLAs must never be derived directly from raw SLIs
- Changing an SLA is a **product decision**, not an engineering refactor

This document completes the reliability contract for the Order Service.
