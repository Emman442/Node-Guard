# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
from dataclasses import dataclass
from datetime import datetime, timezone
import json


@gl.evm.contract_interface
class _Recipient:
    class View:
        pass
    class Write:
        pass


# ─── Data Structures ──────────────────────────────────────────

@allow_storage
@dataclass
class Provider:
    wallet: str
    name: str
    description: str
    website: str
    staked_gen: i32
    active_agreements: i32
    total_agreements: i32
    total_slashes: i32
    total_slashed_gen: i32
    reputation_score: i32
    registered_at: str
    status: str             # "active" | "suspended" | "exited"


@allow_storage
@dataclass
class Client:
    wallet: str
    name: str
    total_agreements: i32
    total_disputes_filed: i32
    total_disputes_won: i32
    registered_at: str


@allow_storage
@dataclass
class SLATerms:
    uptime_percentage: str      # e.g. "99.9"
    max_latency_ms: str         # e.g. "200"
    max_error_rate: str         # e.g. "0.1" (percentage)
    data_freshness_blocks: str  # max blocks behind latest acceptable
    measurement_region: str     # e.g. "global" | "us-east" | "eu-west"
    plain_english_sla: str      # full human-readable SLA terms
    penalty_per_incident: i32   # GEN to slash per confirmed violation
    max_penalty_per_dispute: i32


@allow_storage
@dataclass
class TelemetrySource:
    source_id: str
    name: str
    url: str                    # monitoring endpoint URL
    auth_header: str            # optional auth header key (value stored off-chain)
    source_type: str            # "uptime_api" | "latency_api" | "rpc_health" | "public_dashboard"
    description: str


@allow_storage
@dataclass
class Agreement:
    agreement_id: str
    provider: str
    client: str
    service_name: str
    service_type: str           # "rpc_node" | "gpu_cluster" | "indexer" | "api" | "other"
    service_endpoint: str       # the actual RPC/API endpoint
    sla_terms: SLATerms
    telemetry_source_ids: DynArray[str]
    stake_locked: i32
    monthly_fee_gen: i32
    start_date: str
    end_date: str
    status: str                 # "active" | "disputed" | "terminated" | "expired"
    dispute_ids: DynArray[str]
    created_at: str


@allow_storage
@dataclass
class TelemetryReading:
    reading_id: str
    agreement_id: str
    timeframe_start: str
    timeframe_end: str
    uptime_percentage: str
    avg_latency_ms: str
    max_latency_ms: str
    error_rate: str
    blocks_behind: str
    raw_data_url: str           # URL where full telemetry JSON is accessible
    recorded_at: str
    recorded_by: str


@allow_storage
@dataclass
class DisputeEvidence:
    evidence_id: str
    dispute_id: str
    submitted_by: str
    evidence_type: str          # "telemetry_url" | "transaction_proof" | "log_url" | "screenshot_url"
    url: str
    description: str
    submitted_at: str


@allow_storage
@dataclass
class ArbitrationVerdict:
    verdict_id: str
    dispute_id: str
    verdict: str                # "breach_confirmed" | "no_breach" | "partial_breach" | "inconclusive"
    breach_type: str            # "uptime" | "latency" | "data_freshness" | "error_rate" | "multiple" | ""
    sla_term_violated: str      # which specific SLA term was breached
    measured_uptime: str        # what the telemetry showed
    measured_latency: str
    measured_error_rate: str
    reasoning: str
    confidence: str             # "high" | "medium" | "low"
    slash_amount: i32           # GEN to slash from provider stake
    is_appeal: bool
    rendered_at: str
    rendered_by: str


@allow_storage
@dataclass
class Dispute:
    dispute_id: str
    agreement_id: str
    claimant: str               # client filing the dispute
    respondent: str             # provider being disputed
    incident_start: str         # when the incident allegedly started
    incident_end: str           # when it ended
    description: str
    impact_description: str     # what impact did the breach have
    status: str                 # "open" | "under_review" | "verdict_rendered" | "appealed" | "resolved"
    verdict_id: str
    appeal_verdict_id: str
    slash_executed: bool
    slashed_amount: i32
    filed_at: str
    resolved_at: str
    evidence_ids: DynArray[str]


class SLAArbitrator(gl.Contract):

    # Providers
    providers: TreeMap[str, Provider]
    provider_ids: DynArray[str]

    # Clients
    clients: TreeMap[str, Client]

    # Agreements
    agreements: TreeMap[str, Agreement]
    agreement_ids: DynArray[str]
    agreement_counter: i32

    # Telemetry sources — registered monitoring endpoints
    telemetry_sources: TreeMap[str, TelemetrySource]
    telemetry_source_ids: DynArray[str]
    telemetry_source_counter: i32

    # Telemetry readings — keyed by reading_id
    telemetry_readings: TreeMap[str, TelemetryReading]
    reading_counter: i32

    # Disputes — keyed by dispute_id
    disputes: TreeMap[str, Dispute]
    dispute_ids: DynArray[str]
    dispute_counter: i32

    # Evidence — keyed by evidence_id
    evidence: TreeMap[str, DisputeEvidence]
    evidence_counter: i32

    # Verdicts — keyed by verdict_id
    verdicts: TreeMap[str, ArbitrationVerdict]
    verdict_counter: i32

    # Admin
    admin: str

    # Minimum stake to become a provider
    min_provider_stake: i32

    def __init__(self, admin_address: str, min_stake_gen: i32):
        self.admin = admin_address
        self.min_provider_stake = min_stake_gen
        self.agreement_counter = i32(0)
        self.telemetry_source_counter = i32(0)
        self.reading_counter = i32(0)
        self.dispute_counter = i32(0)
        self.evidence_counter = i32(0)
        self.verdict_counter = i32(0)

    # ─── Helpers ──────────────────────────────────────────────

    def _only_admin(self) -> None:
        assert str(gl.message.sender_address) == self.admin, "Only admin"

    def _ensure_client(self, wallet: str) -> None:
        if wallet not in self.clients:
            self.clients[wallet] = Client(
                wallet=wallet,
                name="",
                total_agreements=i32(0),
                total_disputes_filed=i32(0),
                total_disputes_won=i32(0),
                registered_at=gl.message_raw["datetime"]
            )

    # ─── Provider Registration & Staking ──────────────────────

    @gl.public.write.payable
    def register_provider(
        self,
        name: str,
        description: str,
        website: str
    ) -> None:
        """
        Providers stake GEN collateral to guarantee SLA performance.
        Minimum stake required. Stake is slashed if breaches are confirmed.
        """
        wallet = str(gl.message.sender_address)
        assert wallet not in self.providers, "Already registered as provider"
        assert len(name) >= 2, "Name required"

        staked = int(gl.message.value) // (10**18)
        assert staked >= int(self.min_provider_stake), \
            f"Minimum stake is {self.min_provider_stake} GEN"

        self.providers[wallet] = Provider(
            wallet=wallet,
            name=name,
            description=description,
            website=website,
            staked_gen=i32(staked),
            active_agreements=i32(0),
            total_agreements=i32(0),
            total_slashes=i32(0),
            total_slashed_gen=i32(0),
            reputation_score=i32(100),
            registered_at=gl.message_raw["datetime"],
            status="active"
        )

        self.provider_ids.append(wallet)

    @gl.public.write.payable
    def add_stake(self) -> None:
        """Provider adds more stake to their collateral."""
        wallet = str(gl.message.sender_address)
        assert wallet in self.providers, "Not a registered provider"

        additional = int(gl.message.value) // (10**18)
        assert additional > 0, "Must send GEN to stake"

        self.providers[wallet].staked_gen += i32(additional)

    @gl.public.write
    def withdraw_stake(self, amount: i32) -> None:
        """
        Provider withdraws stake. Cannot withdraw below minimum
        while active agreements exist.
        """
        wallet = str(gl.message.sender_address)
        assert wallet in self.providers, "Not a registered provider"
        p = self.providers[wallet]
        assert int(p.active_agreements) == 0, \
            "Cannot withdraw stake while active agreements exist"
        assert int(amount) <= int(p.staked_gen), "Insufficient stake"

        remaining = int(p.staked_gen) - int(amount)
        assert remaining >= int(self.min_provider_stake) or remaining == 0, \
            "Cannot withdraw below minimum stake while active"

        self.providers[wallet].staked_gen -= amount

        _Recipient(Address(wallet)).emit_transfer(
            value=u256(amount) * u256(10**18)
        )

    @gl.public.write
    def update_provider_profile(
        self,
        name: str,
        description: str,
        website: str
    ) -> None:
        wallet = str(gl.message.sender_address)
        assert wallet in self.providers, "Not a registered provider"
        if len(name) > 0:
            self.providers[wallet].name = name
        if len(description) > 0:
            self.providers[wallet].description = description
        if len(website) > 0:
            self.providers[wallet].website = website

    @gl.public.write
    def update_client_name(self, name: str) -> None:
        wallet = str(gl.message.sender_address)
        self._ensure_client(wallet)
        self.clients[wallet].name = name

    # ─── Telemetry Source Registry (Admin) ────────────────────

    @gl.public.write
    def register_telemetry_source(
        self,
        name: str,
        url: str,
        source_type: str,
        description: str
    ) -> str:
        """
        Admin registers approved monitoring endpoints.
        These are the independent data sources the AI uses
        to fetch real telemetry during arbitration.
        """
        self._only_admin()
        assert len(name) >= 2, "Name required"
        assert url.startswith("http"), "Valid URL required"
        assert source_type in [
            "uptime_api", "latency_api", "rpc_health",
            "public_dashboard", "block_explorer"
        ], "Invalid source type"

        self.telemetry_source_counter += i32(1)
        source_id = f"source_{self.telemetry_source_counter}"

        self.telemetry_sources[source_id] = TelemetrySource(
            source_id=source_id,
            name=name,
            url=url,
            auth_header="",
            source_type=source_type,
            description=description
        )

        self.telemetry_source_ids.append(source_id)
        return source_id

    # ─── Agreement Creation ───────────────────────────────────

    @gl.public.write.payable
    def create_agreement(
        self,
        provider_wallet: str,
        service_name: str,
        service_type: str,
        service_endpoint: str,
        uptime_percentage: str,
        max_latency_ms: str,
        max_error_rate: str,
        data_freshness_blocks: str,
        measurement_region: str,
        plain_english_sla: str,
        penalty_per_incident: i32,
        max_penalty_per_dispute: i32,
        monthly_fee_gen: i32,
        duration_days: i32,
        telemetry_source_ids: list[str]
    ) -> str:
        """
        Client creates a service agreement with a provider.
        Client pays the first month's fee upfront.
        Provider's stake acts as collateral for SLA guarantees.
        Telemetry sources are agreed upon at contract creation.
        """
        client = str(gl.message.sender_address)
        self._ensure_client(client)

        assert provider_wallet in self.providers, "Provider not registered"
        p = self.providers[provider_wallet]
        assert p.status == "active", "Provider not active"
        assert len(service_name) >= 2, "Service name required"
        assert service_type in [
            "rpc_node", "gpu_cluster", "indexer", "api", "other"
        ], "Invalid service type"
        assert len(plain_english_sla) >= 50, "SLA terms too short — be specific"
        assert len(telemetry_source_ids) >= 1, "At least one telemetry source required"

        # Verify all telemetry sources exist
        for sid in telemetry_source_ids:
            assert sid in self.telemetry_sources, f"Telemetry source {sid} not found"

        # Verify provider has enough stake to cover max penalty
        assert int(p.staked_gen) >= int(max_penalty_per_dispute), \
            "Provider stake insufficient to cover maximum penalty"

        expected_fee = u256(monthly_fee_gen) * u256(10**18)
        assert gl.message.value == expected_fee, "Must pay first month fee in GEN"

        self.agreement_counter += i32(1)
        agreement_id = f"agreement_{self.agreement_counter}"

        sla = SLATerms(
            uptime_percentage=uptime_percentage,
            max_latency_ms=max_latency_ms,
            max_error_rate=max_error_rate,
            data_freshness_blocks=data_freshness_blocks,
            measurement_region=measurement_region,
            plain_english_sla=plain_english_sla,
            penalty_per_incident=penalty_per_incident,
            max_penalty_per_dispute=max_penalty_per_dispute
        )

        source_array: DynArray[str] = []
        for sid in telemetry_source_ids:
            source_array.append(sid)

        now = int(datetime.now(timezone.utc).timestamp() * 1000)
        end_ts = now + int(duration_days) * 24 * 60 * 60 * 1000

        from datetime import datetime as dt
        end_date = dt.fromtimestamp(end_ts / 1000, tz=timezone.utc).strftime("%Y-%m-%d")

        self.agreements[agreement_id] = Agreement(
            agreement_id=agreement_id,
            provider=provider_wallet,
            client=client,
            service_name=service_name,
            service_type=service_type,
            service_endpoint=service_endpoint,
            sla_terms=sla,
            telemetry_source_ids=source_array,
            stake_locked=max_penalty_per_dispute,
            monthly_fee_gen=monthly_fee_gen,
            start_date=gl.message_raw["datetime"],
            end_date=end_date,
            status="active",
            dispute_ids=[],
            created_at=gl.message_raw["datetime"]
        )

        self.agreement_ids.append(agreement_id)
        self.providers[provider_wallet].active_agreements += i32(1)
        self.providers[provider_wallet].total_agreements += i32(1)
        self.clients[client].total_agreements += i32(1)

        # Pay provider the monthly fee
        _Recipient(Address(provider_wallet)).emit_transfer(
            value=u256(monthly_fee_gen) * u256(10**18)
        )

        return agreement_id

    @gl.public.write
    def terminate_agreement(self, agreement_id: str) -> None:
        caller = str(gl.message.sender_address)
        assert agreement_id in self.agreements, "Agreement not found"
        a = self.agreements[agreement_id]
        assert caller == a.client or caller == a.provider or caller == self.admin, \
            "Not authorized"
        assert a.status == "active", "Agreement not active"

        self.agreements[agreement_id].status = "terminated"
        self.providers[a.provider].active_agreements -= i32(1)

    # ─── Record Telemetry Reading ─────────────────────────────

    @gl.public.write
    def record_telemetry(
        self,
        agreement_id: str,
        timeframe_start: str,
        timeframe_end: str,
        raw_data_url: str
    ) -> str:
        """
        Anyone can submit a telemetry reading for an active agreement.
        The contract fetches the raw_data_url and parses the performance metrics.
        This builds an on-chain performance history for the provider.
        """
        recorder = str(gl.message.sender_address)
        assert agreement_id in self.agreements, "Agreement not found"
        a = self.agreements[agreement_id]
        assert a.status == "active", "Agreement not active"
        assert raw_data_url.startswith("http"), "Valid telemetry URL required"

        agreement_id_val = agreement_id
        sla = a.sla_terms
        endpoint = a.service_endpoint
        source_ids = list(a.telemetry_source_ids)
        uptime_threshold = sla.uptime_percentage
        latency_threshold = sla.max_latency_ms
        error_threshold = sla.max_error_rate

        def fetch_telemetry() -> str:
            # Fetch the raw telemetry data URL
            raw_content = ""
            try:
                resp = gl.nondet.web.get(raw_data_url)
                raw_content = resp.body.decode("utf-8")[:5000]
            except:
                raw_content = "Could not fetch telemetry data"

            # Also fetch from registered monitoring sources
            source_readings = ""
            for sid in source_ids[:3]:
                src = self.telemetry_sources.get(sid)
                if src:
                    try:
                        src_resp = gl.nondet.web.get(src.url)
                        src_data = src_resp.body.decode("utf-8")[:2000]
                        source_readings += f"\n{src.name} ({src.source_type}):\n{src_data}\n"
                    except:
                        source_readings += f"\n{src.name}: Could not fetch\n"

            prompt = f"""You are parsing infrastructure performance telemetry data.

Service Endpoint: {endpoint}
Measurement Period: {timeframe_start} to {timeframe_end}

Raw Telemetry Data:
{raw_content}

Additional Monitor Sources:
{source_readings if source_readings else "None available"}

SLA Thresholds for reference:
- Required uptime: {uptime_threshold}%
- Max latency: {latency_threshold}ms
- Max error rate: {error_threshold}%

Extract the following metrics from the telemetry data:
1. uptime_percentage: actual uptime observed (as a string like "99.2")
2. avg_latency_ms: average response latency (as a string like "145")
3. max_latency_ms: peak latency observed (as a string like "2400")
4. error_rate: error rate percentage (as a string like "0.3")
5. blocks_behind: how many blocks behind latest (as a string, "0" if not applicable)

If a metric cannot be determined from the data, use "unknown".

Return ONLY valid JSON:
{{"uptime_percentage":"<str>","avg_latency_ms":"<str>","max_latency_ms":"<str>","error_rate":"<str>","blocks_behind":"<str>"}}
"""
            result = gl.nondet.exec_prompt(prompt).strip()
            cleaned = result.replace("```json", "").replace("```", "").strip()
            try:
                parsed = json.loads(cleaned)
                return json.dumps({
                    "uptime_percentage": str(parsed.get("uptime_percentage", "unknown")),
                    "avg_latency_ms": str(parsed.get("avg_latency_ms", "unknown")),
                    "max_latency_ms": str(parsed.get("max_latency_ms", "unknown")),
                    "error_rate": str(parsed.get("error_rate", "unknown")),
                    "blocks_behind": str(parsed.get("blocks_behind", "0"))
                }, sort_keys=True, separators=(',', ':'))
            except:
                return json.dumps({
                    "uptime_percentage": "unknown",
                    "avg_latency_ms": "unknown",
                    "max_latency_ms": "unknown",
                    "error_rate": "unknown",
                    "blocks_behind": "0"
                }, sort_keys=True, separators=(',', ':'))

        raw = gl.eq_principle.prompt_non_comparative(
            fetch_telemetry,
            task="Parse infrastructure telemetry data and extract performance metrics",
            criteria="Extract numeric metrics accurately from the telemetry data. Use unknown if a metric cannot be determined."
        )

        try:
            data = json.loads(raw.strip().strip('"').replace('\\"', '"'))
            uptime = data.get("uptime_percentage", "unknown")
            avg_lat = data.get("avg_latency_ms", "unknown")
            max_lat = data.get("max_latency_ms", "unknown")
            err_rate = data.get("error_rate", "unknown")
            blocks = data.get("blocks_behind", "0")
        except:
            uptime = "unknown"
            avg_lat = "unknown"
            max_lat = "unknown"
            err_rate = "unknown"
            blocks = "0"

        self.reading_counter += i32(1)
        reading_id = f"reading_{self.reading_counter}"

        self.telemetry_readings[reading_id] = TelemetryReading(
            reading_id=reading_id,
            agreement_id=agreement_id,
            timeframe_start=timeframe_start,
            timeframe_end=timeframe_end,
            uptime_percentage=uptime,
            avg_latency_ms=avg_lat,
            max_latency_ms=max_lat,
            error_rate=err_rate,
            blocks_behind=blocks,
            raw_data_url=raw_data_url,
            recorded_at=gl.message_raw["datetime"],
            recorded_by=recorder
        )

        return reading_id

    # ─── File a Dispute ───────────────────────────────────────

    @gl.public.write
    def file_dispute(
        self,
        agreement_id: str,
        incident_start: str,
        incident_end: str,
        description: str,
        impact_description: str
    ) -> str:
        """
        Client files a dispute for an SLA breach.
        They must describe the incident timeframe and impact.
        Evidence URLs can be submitted after filing.
        """
        claimant = str(gl.message.sender_address)
        assert agreement_id in self.agreements, "Agreement not found"
        a = self.agreements[agreement_id]
        assert a.client == claimant, "Only the client can file a dispute"
        assert a.status == "active", "Agreement not active"
        assert len(description) >= 20, "Describe the incident"
        assert len(incident_start) > 0, "Incident start time required"
        assert len(incident_end) > 0, "Incident end time required"

        self.dispute_counter += i32(1)
        dispute_id = f"dispute_{self.dispute_counter}"

        self.disputes[dispute_id] = Dispute(
            dispute_id=dispute_id,
            agreement_id=agreement_id,
            claimant=claimant,
            respondent=a.provider,
            incident_start=incident_start,
            incident_end=incident_end,
            description=description,
            impact_description=impact_description,
            status="open",
            verdict_id="",
            appeal_verdict_id="",
            slash_executed=False,
            slashed_amount=i32(0),
            filed_at=gl.message_raw["datetime"],
            resolved_at="",
            evidence_ids=[]
        )

        self.dispute_ids.append(dispute_id)
        self.agreements[agreement_id].dispute_ids.append(dispute_id)
        self.agreements[agreement_id].status = "disputed"
        self.clients[claimant].total_disputes_filed += i32(1)

        return dispute_id

    # ─── Submit Evidence ──────────────────────────────────────

    @gl.public.write
    def submit_evidence(
        self,
        dispute_id: str,
        evidence_type: str,
        url: str,
        description: str,
        title: str
    ) -> str:
        submitter = str(gl.message.sender_address)
        assert dispute_id in self.disputes, "Dispute not found"
        d = self.disputes[dispute_id]
        assert submitter == d.claimant or submitter == d.respondent, \
            "Only parties can submit evidence"
        assert d.status in ["open", "under_review"], "Not accepting evidence"
        assert evidence_type in [
            "telemetry_url", "transaction_proof", "log_url",
            "screenshot_url", "monitoring_dashboard"
        ], "Invalid evidence type"
        assert url.startswith("http"), "Valid URL required"

        self.evidence_counter += i32(1)
        evidence_id = f"evidence_{self.evidence_counter}"

        self.evidence[evidence_id] = DisputeEvidence(
            evidence_id=evidence_id,
            dispute_id=dispute_id,
            submitted_by=submitter,
            evidence_type=evidence_type,
            url=url,
            description=description,
            submitted_at=gl.message_raw["datetime"]
        )

        self.disputes[dispute_id].evidence_ids.append(evidence_id)
        self.disputes[dispute_id].status = "under_review"

        return evidence_id

    # ─── AI Arbitration (Core GenLayer Logic) ─────────────────

    @gl.public.write
    def render_verdict(self, dispute_id: str) -> None:
        """
        Triggers AI arbitration. GenLayer validators:
        1. Fetch telemetry from all registered monitoring sources
        2. Parse performance metrics for the incident timeframe
        3. Compare against the plain English SLA terms
        4. Evaluate submitted evidence from both parties
        5. Reach consensus on breach determination
        6. If breach confirmed, calculate and execute stake slash
        """
        triggered_by = str(gl.message.sender_address)
        assert dispute_id in self.disputes, "Dispute not found"
        d = self.disputes[dispute_id]
        assert d.status in ["open", "under_review"], "Not eligible for arbitration"

        a = self.agreements[d.agreement_id]
        sla = a.sla_terms
        evidence_ids = list(d.evidence_ids)
        source_ids = list(a.telemetry_source_ids)

        incident_start = d.incident_start
        incident_end = d.incident_end
        complaint = d.description
        impact = d.impact_description
        endpoint = a.service_endpoint
        service_name = a.service_name
        service_type = a.service_type
        plain_sla = sla.plain_english_sla
        uptime_req = sla.uptime_percentage
        latency_req = sla.max_latency_ms
        error_req = sla.max_error_rate
        freshness_req = sla.data_freshness_blocks
        penalty = int(sla.penalty_per_incident)
        max_penalty = int(sla.max_penalty_per_dispute)

        def run_arbitration() -> str:
            # Fetch from all telemetry sources
            telemetry_data = ""
            for sid in source_ids[:4]:
                src = self.telemetry_sources.get(sid)
                if src:
                    try:
                        resp = gl.nondet.web.get(src.url)
                        content = resp.body.decode("utf-8")[:2000]
                        telemetry_data += f"\n=== {src.name} ({src.source_type}) ===\n{content}\n"
                    except:
                        telemetry_data += f"\n=== {src.name} ===\nCould not fetch\n"

            # Fetch evidence submitted by both parties
            evidence_content = ""
            for eid in evidence_ids[:6]:
                ev = self.evidence.get(eid)
                if ev:
                    role = "CLAIMANT" if ev.submitted_by == d.claimant else "PROVIDER"
                    try:
                        ev_resp = gl.nondet.web.get(ev.url)
                        ev_data = ev_resp.body.decode("utf-8")[:1500]
                        evidence_content += f"\n[{role}] {ev.title} ({ev.evidence_type}):\n"
                        evidence_content += f"Description: {ev.description}\n"
                        evidence_content += f"Data: {ev_data}\n---\n"
                    except:
                        evidence_content += f"\n[{role}] {ev.title}: Could not fetch\n---\n"

            prompt = f"""You are an impartial AI arbitrator evaluating a Service Level Agreement breach dispute
for decentralized infrastructure services.

SERVICE DETAILS:
Service Name: {service_name}
Service Type: {service_type}
Endpoint: {endpoint}

INCIDENT TIMEFRAME:
Start: {incident_start}
End: {incident_end}

SLA REQUIREMENTS (plain English):
{plain_sla}

SPECIFIC SLA THRESHOLDS:
- Required uptime: {uptime_req}%
- Maximum latency: {latency_req}ms
- Maximum error rate: {error_req}%
- Maximum blocks behind: {freshness_req}

CLAIMANT'S DESCRIPTION OF INCIDENT:
{complaint}

BUSINESS IMPACT CLAIMED:
{impact}

TELEMETRY DATA FROM MONITORING SOURCES:
{telemetry_data if telemetry_data else "No telemetry data could be fetched"}

EVIDENCE SUBMITTED BY PARTIES:
{evidence_content if evidence_content else "No evidence submitted"}

YOUR TASK:
Analyze the telemetry data and evidence to determine whether the provider
breached the SLA during the stated incident timeframe.

Be precise and data-driven. Extract specific metrics from the telemetry.
If the data clearly shows a breach, confirm it. If the data shows normal
operation, dismiss the claim. If data is insufficient, mark inconclusive.

Penalty scale (up to {max_penalty} GEN maximum):
- Minor breach (uptime 99.0-99.9%): {penalty} GEN
- Moderate breach (uptime 95-99%): {penalty * 2} GEN
- Severe breach (uptime below 95% or total outage): {max_penalty} GEN
- Latency breach only: {penalty // 2} GEN
- Data freshness breach: {penalty} GEN

Return ONLY valid JSON:
{{
  "verdict": "breach_confirmed" | "no_breach" | "partial_breach" | "inconclusive",
  "breach_type": "uptime" | "latency" | "data_freshness" | "error_rate" | "multiple" | "",
  "sla_term_violated": "which specific term from the SLA was violated or empty",
  "measured_uptime": "actual uptime observed as string or unknown",
  "measured_latency": "actual avg latency observed as string or unknown",
  "measured_error_rate": "actual error rate as string or unknown",
  "reasoning": "4-6 sentences with specific data points from telemetry",
  "confidence": "high" | "medium" | "low",
  "slash_amount": <int GEN to slash, 0 if no breach>
}}
"""
            result = gl.nondet.exec_prompt(prompt).strip()
            cleaned = result.replace("```json", "").replace("```", "").strip()
            try:
                parsed = json.loads(cleaned)
                verdict = parsed.get("verdict", "inconclusive")
                if verdict not in ["breach_confirmed", "no_breach", "partial_breach", "inconclusive"]:
                    verdict = "inconclusive"
                slash = min(max(0, int(parsed.get("slash_amount", 0))), max_penalty)
                return json.dumps({
                    "verdict": verdict,
                    "breach_type": str(parsed.get("breach_type", "")),
                    "sla_term_violated": str(parsed.get("sla_term_violated", "")),
                    "measured_uptime": str(parsed.get("measured_uptime", "unknown")),
                    "measured_latency": str(parsed.get("measured_latency", "unknown")),
                    "measured_error_rate": str(parsed.get("measured_error_rate", "unknown")),
                    "reasoning": str(parsed.get("reasoning", "")),
                    "confidence": str(parsed.get("confidence", "medium")),
                    "slash_amount": slash
                }, sort_keys=True, separators=(',', ':'))
            except:
                return json.dumps({
                    "verdict": "inconclusive",
                    "breach_type": "",
                    "sla_term_violated": "",
                    "measured_uptime": "unknown",
                    "measured_latency": "unknown",
                    "measured_error_rate": "unknown",
                    "reasoning": "Could not parse telemetry data",
                    "confidence": "low",
                    "slash_amount": 0
                }, sort_keys=True, separators=(',', ':'))

        raw = gl.eq_principle.prompt_non_comparative(
            run_arbitration,
            task="Evaluate an infrastructure SLA breach dispute using telemetry data and evidence",
            criteria="""Base verdict strictly on telemetry data and evidence.
Confirm breach only if data clearly shows SLA thresholds were exceeded.
Be precise about which metrics were violated and by how much.
Slash amount must be proportional to breach severity."""
        )

        try:
            data = json.loads(raw.strip().strip('"').replace('\\"', '"'))
            verdict = data.get("verdict", "inconclusive")
            breach_type = data.get("breach_type", "")
            sla_violated = data.get("sla_term_violated", "")
            uptime_measured = data.get("measured_uptime", "unknown")
            latency_measured = data.get("measured_latency", "unknown")
            error_measured = data.get("measured_error_rate", "unknown")
            reasoning = data.get("reasoning", "")
            confidence = data.get("confidence", "medium")
            slash_amount = int(data.get("slash_amount", 0))
        except:
            verdict = "inconclusive"
            breach_type = ""
            sla_violated = ""
            uptime_measured = "unknown"
            latency_measured = "unknown"
            error_measured = "unknown"
            reasoning = "Arbitration consensus failed"
            confidence = "low"
            slash_amount = 0

        if verdict not in ["breach_confirmed", "no_breach", "partial_breach", "inconclusive"]:
            verdict = "inconclusive"

        slash_amount = min(
            slash_amount,
            int(self.agreements[d.agreement_id].sla_terms.max_penalty_per_dispute)
        )

        self.verdict_counter += i32(1)
        verdict_id = f"verdict_{self.verdict_counter}"

        self.verdicts[verdict_id] = ArbitrationVerdict(
            verdict_id=verdict_id,
            dispute_id=dispute_id,
            verdict=verdict,
            breach_type=breach_type,
            sla_term_violated=sla_violated,
            measured_uptime=uptime_measured,
            measured_latency=latency_measured,
            measured_error_rate=error_measured,
            reasoning=reasoning,
            confidence=confidence,
            slash_amount=i32(slash_amount),
            is_appeal=False,
            rendered_at=gl.message_raw["datetime"],
            rendered_by=triggered_by
        )

        self.disputes[dispute_id].verdict_id = verdict_id
        self.disputes[dispute_id].status = "verdict_rendered"
        self.disputes[dispute_id].resolved_at = gl.message_raw["datetime"]

        provider_wallet = d.respondent
        claimant_wallet = d.claimant

        if verdict in ["breach_confirmed", "partial_breach"] and slash_amount > 0:
            provider = self.providers[provider_wallet]
            actual_slash = min(slash_amount, int(provider.staked_gen))

            self.providers[provider_wallet].staked_gen -= i32(actual_slash)
            self.providers[provider_wallet].total_slashes += i32(1)
            self.providers[provider_wallet].total_slashed_gen += i32(actual_slash)
            self.providers[provider_wallet].reputation_score -= i32(15)

            self.disputes[dispute_id].slash_executed = True
            self.disputes[dispute_id].slashed_amount = i32(actual_slash)

            self.clients[claimant_wallet].total_disputes_won += i32(1)

            # Pay slashed amount to claimant
            _Recipient(Address(claimant_wallet)).emit_transfer(
                value=u256(actual_slash) * u256(10**18)
            )

        else:
            # No breach — restore agreement status
            self.agreements[d.agreement_id].status = "active"
            if int(self.providers[provider_wallet].reputation_score) < 100:
                self.providers[provider_wallet].reputation_score += i32(2)

    # ─── Appeal ───────────────────────────────────────────────

    @gl.public.write
    def appeal_verdict(
        self,
        dispute_id: str,
        appeal_context: str,
        additional_evidence_url: str
    ) -> None:
        """
        Provider can appeal a breach verdict.
        Second AI review with higher bar to overturn.
        Additional evidence can be submitted.
        """
        appellant = str(gl.message.sender_address)
        assert dispute_id in self.disputes, "Dispute not found"
        d = self.disputes[dispute_id]
        assert d.respondent == appellant, "Only provider can appeal"
        assert d.status == "verdict_rendered", "No verdict to appeal"
        assert d.appeal_verdict_id == "", "Already appealed"

        original = self.verdicts[d.verdict_id]
        assert original.verdict in ["breach_confirmed", "partial_breach"], \
            "Can only appeal breach verdicts"

        a = self.agreements[d.agreement_id]
        sla = a.sla_terms
        orig_reasoning = original.reasoning
        context = appeal_context
        add_url = additional_evidence_url
        plain_sla = sla.plain_english_sla
        endpoint = a.service_endpoint

        self.disputes[dispute_id].status = "appealed"

        def run_appeal() -> str:
            add_content = ""
            if add_url and add_url.startswith("http"):
                try:
                    resp = gl.nondet.web.get(add_url)
                    add_content = resp.body.decode("utf-8")[:3000]
                except:
                    add_content = "Could not fetch additional evidence"

            prompt = f"""You are reviewing an appeal of an infrastructure SLA breach verdict.

Service Endpoint: {endpoint}
SLA Terms: {plain_sla}

ORIGINAL BREACH VERDICT: {original.verdict}
ORIGINAL REASONING: {orig_reasoning}
ORIGINAL SLASH AMOUNT: {original.slash_amount} GEN

PROVIDER'S APPEAL:
{context}

ADDITIONAL EVIDENCE:
URL: {add_url if add_url else "None provided"}
Content: {add_content if add_content else "None"}

Re-evaluate with fresh eyes. Maintain a high standard for overturning
breach verdicts — the original analysis found a clear SLA breach.
Only overturn if the new evidence definitively shows no breach occurred.

Return ONLY valid JSON:
{{
  "verdict": "breach_confirmed" | "no_breach" | "partial_breach",
  "reasoning": "3-4 sentences explaining the appeal decision",
  "confidence": "high" | "medium" | "low",
  "appeal_outcome": "upheld" | "overturned" | "modified",
  "slash_amount": <int GEN, may be reduced if modified>
}}
"""
            result = gl.nondet.exec_prompt(prompt).strip()
            cleaned = result.replace("```json", "").replace("```", "").strip()
            try:
                parsed = json.loads(cleaned)
                verdict = parsed.get("verdict", "breach_confirmed")
                if verdict not in ["breach_confirmed", "no_breach", "partial_breach"]:
                    verdict = "breach_confirmed"
                return json.dumps({
                    "verdict": verdict,
                    "reasoning": str(parsed.get("reasoning", "")),
                    "confidence": str(parsed.get("confidence", "medium")),
                    "appeal_outcome": str(parsed.get("appeal_outcome", "upheld")),
                    "slash_amount": max(0, int(parsed.get("slash_amount", int(original.slash_amount))))
                }, sort_keys=True, separators=(',', ':'))
            except:
                return json.dumps({
                    "verdict": "breach_confirmed",
                    "reasoning": "Appeal evaluation failed",
                    "confidence": "low",
                    "appeal_outcome": "upheld",
                    "slash_amount": int(original.slash_amount)
                }, sort_keys=True, separators=(',', ':'))

        raw = gl.eq_principle.prompt_non_comparative(
            run_appeal,
            task="Review an appeal of an infrastructure SLA breach arbitration verdict",
            criteria="Only overturn if new evidence definitively proves no breach. High bar required."
        )

        try:
            data = json.loads(raw.strip().strip('"').replace('\\"', '"'))
            verdict = data.get("verdict", "breach_confirmed")
            reasoning = data.get("reasoning", "")
            confidence = data.get("confidence", "medium")
            appeal_outcome = data.get("appeal_outcome", "upheld")
            slash_amount = int(data.get("slash_amount", int(original.slash_amount)))
        except:
            verdict = "breach_confirmed"
            reasoning = "Appeal consensus failed"
            confidence = "low"
            appeal_outcome = "upheld"
            slash_amount = int(original.slash_amount)

        self.verdict_counter += i32(1)
        appeal_verdict_id = f"verdict_{self.verdict_counter}"

        self.verdicts[appeal_verdict_id] = ArbitrationVerdict(
            verdict_id=appeal_verdict_id,
            dispute_id=dispute_id,
            verdict=verdict,
            breach_type=original.breach_type,
            sla_term_violated=original.sla_term_violated,
            measured_uptime=original.measured_uptime,
            measured_latency=original.measured_latency,
            measured_error_rate=original.measured_error_rate,
            reasoning=reasoning,
            confidence=confidence,
            slash_amount=i32(slash_amount),
            is_appeal=True,
            rendered_at=gl.message_raw["datetime"],
            rendered_by=appellant
        )

        self.disputes[dispute_id].appeal_verdict_id = appeal_verdict_id
        self.disputes[dispute_id].status = "resolved"
        self.disputes[dispute_id].resolved_at = gl.message_raw["datetime"]

        if verdict == "no_breach":
            # Overturn — refund the slash to provider
            original_slash = int(d.slashed_amount)
            if original_slash > 0:
                self.providers[d.respondent].staked_gen += i32(original_slash)
                self.providers[d.respondent].total_slashed_gen -= i32(original_slash)
                self.providers[d.respondent].reputation_score += i32(10)
                self.agreements[d.agreement_id].status = "active"

    # ─── Admin ────────────────────────────────────────────────

    @gl.public.write
    def admin_suspend_provider(self, provider_wallet: str, reason: str) -> None:
        self._only_admin()
        assert provider_wallet in self.providers, "Provider not found"
        self.providers[provider_wallet].status = "suspended"

    @gl.public.write
    def admin_update_min_stake(self, new_min: i32) -> None:
        self._only_admin()
        self.min_provider_stake = new_min

    # ─── Read Methods ─────────────────────────────────────────

    @gl.public.view
    def get_provider(self, wallet: str) -> Provider:
        assert wallet in self.providers, "Provider not found"
        return gl.storage.copy_to_memory(self.providers[wallet])

    @gl.public.view
    def get_all_providers(self) -> list[Provider]:
        result = []
        for w in self.provider_ids:
            result.append(gl.storage.copy_to_memory(self.providers[w]))
        return result

    @gl.public.view
    def get_client(self, wallet: str) -> Client:
        assert wallet in self.clients, "Client not found"
        return gl.storage.copy_to_memory(self.clients[wallet])

    @gl.public.view
    def get_agreement(self, agreement_id: str) -> Agreement:
        assert agreement_id in self.agreements, "Agreement not found"
        return gl.storage.copy_to_memory(self.agreements[agreement_id])

    @gl.public.view
    def get_all_agreements(self) -> list[Agreement]:
        result = []
        for aid in self.agreement_ids:
            result.append(gl.storage.copy_to_memory(self.agreements[aid]))
        return result

    @gl.public.view
    def get_provider_agreements(self, wallet: str) -> list[Agreement]:
        result = []
        for aid in self.agreement_ids:
            a = self.agreements[aid]
            if a.provider == wallet:
                result.append(gl.storage.copy_to_memory(a))
        return result

    @gl.public.view
    def get_client_agreements(self, wallet: str) -> list[Agreement]:
        result = []
        for aid in self.agreement_ids:
            a = self.agreements[aid]
            if a.client == wallet:
                result.append(gl.storage.copy_to_memory(a))
        return result

    @gl.public.view
    def get_dispute(self, dispute_id: str) -> Dispute:
        assert dispute_id in self.disputes, "Dispute not found"
        return gl.storage.copy_to_memory(self.disputes[dispute_id])

    @gl.public.view
    def get_all_disputes(self) -> list[Dispute]:
        result = []
        for did in self.dispute_ids:
            result.append(gl.storage.copy_to_memory(self.disputes[did]))
        return result

    @gl.public.view
    def get_verdict(self, verdict_id: str) -> ArbitrationVerdict:
        assert verdict_id in self.verdicts, "Verdict not found"
        return gl.storage.copy_to_memory(self.verdicts[verdict_id])

    @gl.public.view
    def get_telemetry_reading(self, reading_id: str) -> TelemetryReading:
        assert reading_id in self.telemetry_readings, "Reading not found"
        return gl.storage.copy_to_memory(self.telemetry_readings[reading_id])

    @gl.public.view
    def get_telemetry_source(self, source_id: str) -> TelemetrySource:
        assert source_id in self.telemetry_sources, "Source not found"
        return gl.storage.copy_to_memory(self.telemetry_sources[source_id])

    @gl.public.view
    def get_all_telemetry_sources(self) -> list[TelemetrySource]:
        result = []
        for sid in self.telemetry_source_ids:
            result.append(gl.storage.copy_to_memory(self.telemetry_sources[sid]))
        return result

    @gl.public.view
    def get_evidence_item(self, evidence_id: str) -> DisputeEvidence:
        assert evidence_id in self.evidence, "Evidence not found"
        return gl.storage.copy_to_memory(self.evidence[evidence_id])

    @gl.public.view
    def get_min_stake(self) -> i32:
        return self.min_provider_stake

    @gl.public.view
    def get_total_agreements(self) -> i32:
        return self.agreement_counter

    @gl.public.view
    def get_total_disputes(self) -> i32:
        return self.dispute_counter