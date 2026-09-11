# NodeGuard

> AI-Powered SLA Arbitration for Decentralized Infrastructure built on GenLayer

NodeGuard is a decentralized Service Level Agreement (SLA) arbitration protocol that enables clients and infrastructure providers to create trustless service agreements backed by GEN collateral, independent telemetry providers, and AI-powered dispute resolution.

Instead of relying on centralized support teams or manual dispute handling, NodeGuard leverages **GenLayer Intelligent Contracts** to independently fetch telemetry data, evaluate SLA compliance, and automatically determine whether a provider has violated their contractual obligations.

---

# Why NodeGuard?

Infrastructure providers often promise guarantees such as:

- 99.9% uptime
- Low latency
- Fast RPC response times
- Reliable APIs
- Fresh blockchain indexing
- GPU availability

Today, when these guarantees are violated, customers typically:

- Collect screenshots manually
- Open lengthy support tickets
- Argue over monitoring results
- Wait weeks for refunds
- Depend on centralized arbitration

NodeGuard removes the human bottleneck by making SLA enforcement autonomous, transparent, and verifiable.

---

# Features

## 🛡 Provider Registry

Providers register by staking GEN tokens as collateral.

Each provider profile includes:

- Wallet address
- Name
- Description
- Website
- Total GEN staked
- Reputation score
- Total agreements
- Active agreements
- Total slashes
- Total GEN slashed
- Current status

Provider stake serves as collateral that can be slashed when SLA violations are confirmed.

---

## 👤 Client Registry

Clients are automatically registered when interacting with the protocol.

Each client tracks:

- Agreements created
- Disputes filed
- Disputes won

---

## 📜 Service Agreements

Clients create agreements directly with providers.

Each agreement contains:

- Provider
- Client
- Service endpoint
- Service type
- Monthly GEN payment
- Locked provider collateral
- Telemetry monitoring sources
- Structured SLA terms
- Plain-English SLA
- Agreement duration

Supported services include:

- RPC Nodes
- GPU Clusters
- APIs
- Blockchain Indexers
- Other Infrastructure Services

---

## 📋 SLA Terms

Each agreement defines measurable performance guarantees.

Examples include:

- Required uptime percentage
- Maximum latency
- Maximum error rate
- Maximum blockchain freshness
- Measurement region
- Penalty per incident
- Maximum penalty

Additionally, every agreement stores a complete plain-English SLA, allowing AI to reason about contractual intent rather than relying solely on numeric thresholds.

---

## 📡 Telemetry Sources

NodeGuard supports independent monitoring providers.

Examples include:

- Uptime APIs
- RPC monitoring services
- Public dashboards
- Block explorers
- Infrastructure monitoring APIs

Only protocol-approved telemetry providers may be registered.

Using multiple monitoring sources reduces manipulation and increases confidence in arbitration decisions.

---

## 📈 Telemetry Recording

Telemetry snapshots can be submitted throughout an agreement's lifetime.

When telemetry is recorded:

- Raw monitoring URLs are provided
- GenLayer fetches the telemetry
- AI extracts structured performance metrics
- Parsed metrics are stored permanently on-chain

Metrics include:

- Uptime percentage
- Average latency
- Maximum latency
- Error rate
- Blocks behind latest chain

This creates a transparent performance history for every provider.

---

## ⚖ AI Arbitration

AI arbitration is the core feature of NodeGuard.

When a dispute is opened, GenLayer validators independently:

- Fetch telemetry from monitoring providers
- Read submitted evidence
- Analyze service performance
- Compare metrics against the SLA
- Evaluate plain-English contract terms
- Reach consensus on the outcome

Possible verdicts include:

- Breach Confirmed
- Partial Breach
- No Breach
- Inconclusive

Each verdict contains:

- Verdict
- Breach type
- SLA term violated
- Measured uptime
- Measured latency
- Measured error rate
- Confidence level
- Detailed reasoning
- Recommended slash amount

---

## 📁 Evidence Submission

Both clients and providers may submit evidence during disputes.

Supported evidence includes:

- Telemetry URLs
- Monitoring dashboards
- Transaction proofs
- Server logs
- Screenshots

During arbitration, GenLayer automatically retrieves and evaluates submitted evidence.

---

## 💰 Automatic Slashing

When a provider is found responsible for violating the SLA:

- Provider stake is reduced
- Reputation decreases
- Slash statistics are updated
- Client receives the slashed GEN automatically

Everything happens inside the intelligent contract without requiring a centralized administrator.

---

## 🔄 Appeals

Providers may appeal arbitration decisions.

Appeals allow:

- Additional evidence
- New monitoring data
- AI re-evaluation

A second arbitration is performed using the original evidence together with any newly submitted information.

Possible appeal outcomes:

- Verdict upheld
- Verdict modified
- Verdict overturned

---

## ⭐ Reputation System

Providers build reputation over time.

Successful service:

- Maintains reputation

Confirmed SLA breaches:

- Reduce reputation
- Increase slash count
- Reduce available collateral

This creates strong economic incentives for reliable infrastructure providers.

---

# Protocol Flow

```text
Provider
    │
    ▼
Stake GEN
    │
    ▼
Register Provider
    │
    ▼
Client Creates Agreement
    │
    ▼
Telemetry Recorded
    │
    ▼
Service Operates
    │
    ▼
Client Files Dispute
    │
    ▼
Evidence Submitted
    │
    ▼
GenLayer Fetches Telemetry
    │
    ▼
AI Evaluates SLA
    │
    ▼
Consensus Arbitration
    │
 ┌──┴─────────────┐
 │                │
 ▼                ▼
No Breach     Breach Confirmed
 │                │
 │                ▼
 │          Provider Slashed
 │                │
 │                ▼
 │       Client Compensated
 │
 ▼
Agreement Continues
```

---

# Smart Contract Architecture

The protocol consists of the following core storage models:

## Provider

Represents infrastructure providers who stake GEN as collateral.

## Client

Represents consumers purchasing infrastructure services.

## Agreement

Defines the SLA contract between client and provider.

## SLATerms

Stores structured performance guarantees.

## TelemetrySource

Approved monitoring providers.

## TelemetryReading

Historical performance measurements.

## Dispute

Records SLA violation claims.

## DisputeEvidence

Evidence submitted by both parties.

## ArbitrationVerdict

AI-generated arbitration results.

---

# Built With GenLayer

NodeGuard showcases several unique GenLayer capabilities.

### Intelligent Contracts

The contract performs reasoning rather than simple conditional execution.

### Web Access

The contract independently fetches:

- Monitoring APIs
- Telemetry endpoints
- Dashboard URLs
- Submitted evidence

### AI Consensus

Validators independently execute arbitration prompts and reach consensus on:

- SLA interpretation
- Breach determination
- Slash amount
- Final reasoning

### Natural Language Contracts

NodeGuard supports human-readable SLAs rather than requiring only rigid machine-readable rules.

---

# Example Use Cases

NodeGuard can secure virtually any infrastructure service, including:

- Blockchain RPC providers
- AI inference APIs
- GPU marketplaces
- Blockchain indexers
- Oracle providers
- Cloud infrastructure
- CDN providers
- WebSocket providers
- Database providers
- Infrastructure-as-a-Service platforms

---
# nodeguard-fe
