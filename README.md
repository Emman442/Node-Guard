# SLAArbitrator

A decentralized SLA enforcement and arbitration protocol built as a **GenLayer Intelligent Contract**.

SLAArbitrator allows infrastructure providers to stake GEN as collateral, enter service agreements with clients, and commit to measurable service-level guarantees such as uptime, latency, error rate, and data freshness.

When a client disputes an alleged SLA breach, GenLayer validators independently fetch telemetry and evidence, analyze the incident against the agreed SLA terms, and reach consensus on whether a breach occurred.

If a breach is confirmed, the provider's staked GEN can be slashed and paid to the affected client.

---

## The Problem

Decentralized infrastructure creates an important trust problem.

A client using an RPC node, GPU cluster, indexer, or API needs to know:

* Was the service actually available?
* Did it meet the agreed uptime?
* Was latency within the promised limits?
* Were error rates acceptable?
* Was the provider serving sufficiently fresh data?
* What happens when the provider disputes a breach?

Traditional SLA systems rely heavily on centralized monitoring providers and centralized arbitration.

SLAArbitrator moves the arbitration layer on-chain using **GenLayer Intelligent Contracts**, allowing AI validators to evaluate real-world telemetry and evidence and reach a decentralized consensus.

---

## How It Works

The protocol follows this lifecycle:

```text
Provider
   │
   │ Stake GEN
   ▼
Provider Registry
   │
   │
   ▼
Client creates SLA Agreement
   │
   │ Pays first month's fee
   ▼
Active Agreement
   │
   ├── Telemetry monitoring
   │
   └── Service operation
   │
   ▼
SLA incident occurs
   │
   ▼
Client files dispute
   │
   ▼
Evidence submitted
   │
   ▼
GenLayer AI Arbitration
   │
   ├── Fetch telemetry
   ├── Fetch evidence
   ├── Analyze SLA terms
   └── Reach validator consensus
   │
   ▼
Arbitration Verdict
   │
   ├── No breach
   │
   ├── Partial breach
   │
   ├── Breach confirmed
   │
   └── Inconclusive
   │
   ▼
If breach confirmed
   │
   ├── Provider stake slashed
   ├── Provider reputation reduced
   └── Client receives compensation
```

---

# Core Concepts

## Providers

Infrastructure providers register with the protocol by staking GEN.

The stake acts as economic collateral against SLA violations.

Each provider has a reputation score that starts at `100` and changes based on arbitration outcomes.

Supported provider services include:

* RPC nodes
* GPU clusters
* Indexers
* APIs
* Other infrastructure services

### Provider Lifecycle

```text
Register
   ↓
Stake GEN
   ↓
Create agreements
   ↓
Provide infrastructure
   ↓
Maintain SLA
   ↓
Withdraw stake after agreements end
```

Providers can also add additional stake, update their profile, or exit by withdrawing their collateral once they have no active agreements.

---

# Clients

Clients create service agreements with registered providers.

A client specifies exactly what the provider is expected to deliver.

For example:

```text
Service: Ethereum RPC
Required uptime: 99.9%
Maximum latency: 200ms
Maximum error rate: 0.1%
Maximum blocks behind: 2
Measurement region: global
```

The client also provides plain-English SLA terms describing the agreement.

---

# SLA Agreements

An agreement connects a client and provider and defines the rules used during arbitration.

Each agreement contains:

* Provider
* Client
* Service name
* Service type
* Service endpoint
* Uptime requirement
* Maximum latency
* Maximum error rate
* Data freshness requirement
* Measurement region
* Plain-English SLA
* Penalty per incident
* Maximum penalty
* Monthly fee
* Duration
* Approved telemetry sources

The provider must have enough staked GEN to cover the agreement's maximum possible penalty.

---

# Telemetry Sources

SLAArbitrator uses registered telemetry sources to provide external infrastructure data to the Intelligent Contract.

Only the protocol administrator can register telemetry sources.

Supported source types include:

* `uptime_api`
* `latency_api`
* `rpc_health`
* `public_dashboard`
* `block_explorer`

Example:

```text
Source:
Ethereum RPC Monitor

Type:
rpc_health

URL:
https://monitor.example.com/ethereum

Description:
Independent monitoring endpoint for RPC availability and latency.
```

Multiple telemetry sources can be attached to an agreement.

This allows arbitration to use independent monitoring data rather than relying exclusively on claims made by either party.

---

# Telemetry Recording

Anyone can submit a telemetry reading for an active agreement.

The contract's AI layer fetches the supplied telemetry URL as well as registered monitoring sources.

The AI extracts:

* Uptime percentage
* Average latency
* Maximum latency
* Error rate
* Blocks behind latest

The extracted metrics are stored on-chain as a `TelemetryReading`.

Example:

```json
{
  "uptime_percentage": "99.72",
  "avg_latency_ms": "148",
  "max_latency_ms": "842",
  "error_rate": "0.08",
  "blocks_behind": "1"
}
```

The original telemetry URL is retained so the underlying data can be referenced later.

---

# Disputes

If a client believes a provider violated an SLA, they can file a dispute.

A dispute includes:

* Agreement ID
* Incident start
* Incident end
* Description
* Business impact
* Claimant
* Respondent

Example:

```text
Incident:
2026-09-05 13:00 → 2026-09-05 14:00

Claim:
RPC service experienced prolonged downtime.

Impact:
Transactions could not be submitted during the incident.
```

The agreement moves into the `disputed` state.

---

# Evidence

Both the client and provider can submit evidence during the dispute.

Supported evidence types include:

* `telemetry_url`
* `transaction_proof`
* `log_url`
* `screenshot_url`
* `monitoring_dashboard`

Evidence is stored on-chain as a `DisputeEvidence` record while the underlying data can remain accessible through its URL.

This allows both sides of a dispute to provide information before arbitration.

---

# AI Arbitration

The core of SLAArbitrator is the `render_verdict()` function.

When arbitration is triggered, the Intelligent Contract gathers:

### SLA Information

* Plain-English SLA
* Uptime requirement
* Latency requirement
* Error-rate requirement
* Data-freshness requirement

### Incident Information

* Incident timeframe
* Client's description
* Claimed business impact

### Telemetry

The contract fetches data from the agreement's registered monitoring sources.

### Evidence

The contract also fetches evidence submitted by both parties.

The information is passed to an AI arbitrator that evaluates whether the provider violated the agreed SLA.

---

# GenLayer Consensus

The arbitration itself is executed through GenLayer's non-deterministic execution and Equivalence Principle.

The arbitration logic performs external web requests and LLM evaluation.

Conceptually:

```text
Telemetry + Evidence + SLA
             │
             ▼
       AI Arbitration
             │
             ▼
    GenLayer Validators
             │
             ▼
     Equivalence Check
             │
             ▼
       Consensus Result
```

Validators independently evaluate the arbitration task.

The Equivalence Principle allows semantically equivalent results to reach consensus even when individual AI outputs are not byte-for-byte identical.

The final arbitration result is then persisted by the contract.

---

# Arbitration Verdicts

The arbitrator can produce four outcomes:

### `breach_confirmed`

The available evidence clearly demonstrates that the provider violated the SLA.

### `no_breach`

The available evidence indicates that the provider met the SLA requirements.

### `partial_breach`

Some SLA requirements were violated while others were satisfied.

### `inconclusive`

The available telemetry or evidence is insufficient to reliably determine whether a breach occurred.

Each verdict records:

* Verdict
* Breach type
* Violated SLA term
* Measured uptime
* Measured latency
* Measured error rate
* Reasoning
* Confidence
* Slash amount
* Timestamp
* Arbitrator

---

# Automated Slashing

When a breach is confirmed, the provider's collateral can be slashed.

The protocol supports different penalty levels based on breach severity.

```text
Minor breach
     ↓
Penalty per incident

Moderate breach
     ↓
2 × penalty

Severe breach / total outage
     ↓
Maximum penalty

Latency-only breach
     ↓
Reduced penalty

Data freshness breach
     ↓
Penalty per incident
```

The final slash is capped by the agreement's `max_penalty_per_dispute`.

Slashed GEN is transferred to the affected client.

---

# Reputation

Providers maintain an on-chain reputation score.

New providers begin with:

```text
Reputation = 100
```

When a breach results in a slash:

```text
Reputation decreases
```

When a dispute does not result in a breach:

```text
Reputation can recover gradually
```

This creates an additional incentive for providers to maintain reliable infrastructure.

---

# Appeals

Providers can appeal a breach verdict.

An appeal can include:

* Appeal context
* Additional evidence

The contract runs a second AI arbitration using the original verdict and the newly submitted information.

The appeal has a high bar for overturning the original decision.

Possible outcomes include:

* Verdict upheld
* Verdict overturned
* Verdict modified

If a breach is overturned, the original slash can be restored to the provider's stake and their reputation can be adjusted accordingly.

---

# Contract Architecture

The contract is organized around several core data structures.

## Provider

Stores:

```text
wallet
name
description
website
staked_gen
active_agreements
total_agreements
total_slashes
total_slashed_gen
reputation_score
registered_at
status
```

## Client

Stores:

```text
wallet
name
total_agreements
total_disputes_filed
total_disputes_won
registered_at
```

## SLATerms

Stores:

```text
uptime_percentage
max_latency_ms
max_error_rate
data_freshness_blocks
measurement_region
plain_english_sla
penalty_per_incident
max_penalty_per_dispute
```

## Agreement

Stores:

```text
agreement_id
provider
client
service_name
service_type
service_endpoint
sla_terms
telemetry_source_ids
stake_locked
monthly_fee_gen
start_date
end_date
status
dispute_ids
created_at
```

## TelemetryReading

Stores:

```text
reading_id
agreement_id
timeframe_start
timeframe_end
uptime_percentage
avg_latency_ms
max_latency_ms
error_rate
blocks_behind
raw_data_url
recorded_at
recorded_by
```

## Dispute

Stores:

```text
dispute_id
agreement_id
claimant
respondent
incident_start
incident_end
description
impact_description
status
verdict_id
appeal_verdict_id
slash_executed
slashed_amount
filed_at
resolved_at
evidence_ids
```

## ArbitrationVerdict

Stores:

```text
verdict_id
dispute_id
verdict
breach_type
sla_term_violated
measured_uptime
measured_latency
measured_error_rate
reasoning
confidence
slash_amount
is_appeal
rendered_at
rendered_by
```

---

# Main Contract Functions

## Provider Management

```python
register_provider()
add_stake()
withdraw_stake()
update_provider_profile()
```

## Client Management

```python
update_client_name()
```

## Telemetry Sources

```python
register_telemetry_source()
get_telemetry_source()
get_all_telemetry_sources()
```

## Agreements

```python
create_agreement()
terminate_agreement()
get_agreement()
get_all_agreements()
get_provider_agreements()
get_client_agreements()
```

## Telemetry

```python
record_telemetry()
get_telemetry_reading()
```

## Disputes

```python
file_dispute()
submit_evidence()
get_dispute()
get_all_disputes()
get_evidence_item()
```

## Arbitration

```python
render_verdict()
get_verdict()
```

## Appeals

```python
appeal_verdict()
```

## Administration

```python
admin_suspend_provider()
admin_update_min_stake()
```

---

# Example

Imagine an infrastructure provider operates an Ethereum RPC service.

The provider registers with:

```text
Minimum stake: 100 GEN
```

A client creates an agreement:

```text
Service:
Ethereum RPC

Uptime:
99.9%

Maximum latency:
200ms

Maximum error rate:
0.1%

Maximum penalty:
50 GEN
```

The provider's 100 GEN stake acts as collateral.

Later, the RPC service experiences an outage.

The client files a dispute:

```text
Incident:
14:00 → 15:00 UTC

Claim:
RPC service was unavailable for a significant portion of the incident.
```

The client submits monitoring evidence.

The provider can also submit logs or other evidence.

The client then triggers:

```python
render_verdict("dispute_1")
```

GenLayer validators independently evaluate the telemetry and evidence.

Suppose the consensus result is:

```json
{
  "verdict": "breach_confirmed",
  "breach_type": "uptime",
  "sla_term_violated": "99.9% uptime",
  "measured_uptime": "96.8",
  "confidence": "high",
  "slash_amount": 50
}
```

The protocol then:

```text
Provider stake
100 GEN
   │
   │ 50 GEN slash
   ▼
50 GEN remaining

50 GEN
   │
   ▼
Client compensation
```

The provider's reputation is also reduced.

---

# Technology

SLAArbitrator is built using:

* **GenLayer Intelligent Contracts**
* Python
* GenVM
* GenLayer non-deterministic execution
* Equivalence Principle
* `gl.nondet.web.get`
* `gl.nondet.exec_prompt`
* GEN staking and transfers

---

# Security & Trust Model

SLAArbitrator does not assume that either the client or provider is automatically truthful.

Instead, arbitration considers:

1. The SLA agreed by both parties
2. The incident timeframe
3. Independent telemetry
4. Evidence submitted by both parties
5. AI analysis
6. GenLayer validator consensus

The goal is to make SLA enforcement **data-driven, economically enforced, and decentralized**.

---

# Current Design Considerations

The protocol currently relies on externally accessible telemetry endpoints and evidence URLs.

Web content fetched by the Intelligent Contract is intentionally truncated before being passed into AI evaluation to control execution size.

Telemetry accuracy therefore depends partly on the quality and availability of registered monitoring sources.

The system is designed around the principle that **multiple independent sources and decentralized AI consensus can provide a stronger arbitration layer than relying on a single centralized authority**.

