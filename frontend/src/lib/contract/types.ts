export interface Provider {
  wallet: string;
  name: string;
  description: string;
  website: string;
  staked_gen: number;
  active_agreements: number;
  total_agreements: number;
  total_slashes: number;
  total_slashed_gen: number;
  reputation_score: number;
  registered_at: string;
  status: "active" | "suspended" | "exited";
}

export interface Client {
  wallet: string;
  name: string;
  total_agreements: number;
  total_disputes_filed: number;
  total_disputes_won: number;
  registered_at: string;
}

export interface SLATerms {
  uptime_percentage: string;
  max_latency_ms: string;
  max_error_rate: string;
  data_freshness_blocks: string;
  measurement_region: string;
  plain_english_sla: string;
  penalty_per_incident: number;
  max_penalty_per_dispute: number;
}

export interface TelemetrySource {
  source_id: string;
  name: string;
  url: string;
  auth_header: string;
  source_type:
    | "uptime_api"
    | "latency_api"
    | "rpc_health"
    | "public_dashboard";
  description: string;
}

export interface Agreement {
  agreement_id: string;
  provider: string;
  client: string;
  service_name: string;
  service_type:
    | "rpc_node"
    | "gpu_cluster"
    | "indexer"
    | "api"
    | "other";
  service_endpoint: string;
  sla_terms: SLATerms;
  telemetry_source_ids: string[];
  stake_locked: number;
  monthly_fee_gen: number;
  start_date: string;
  end_date: string;
  status: "active" | "disputed" | "terminated" | "expired";
  dispute_ids: string[];
  created_at: string;
}

export interface TelemetryReading {
  reading_id: string;
  agreement_id: string;
  timeframe_start: string;
  timeframe_end: string;
  uptime_percentage: string;
  avg_latency_ms: string;
  max_latency_ms: string;
  error_rate: string;
  blocks_behind: string;
  raw_data_url: string;
  recorded_at: string;
  recorded_by: string;
}

export interface DisputeEvidence {
  evidence_id: string;
  dispute_id: string;
  submitted_by: string;
  evidence_type:
    | "telemetry_url"
    | "transaction_proof"
    | "log_url"
    | "screenshot_url";
  url: string;
  description: string;
  submitted_at: string;
}

export interface ArbitrationVerdict {
  verdict_id: string;
  dispute_id: string;
  verdict:
    | "breach_confirmed"
    | "no_breach"
    | "partial_breach"
    | "inconclusive";
  breach_type:
    | "uptime"
    | "latency"
    | "data_freshness"
    | "error_rate"
    | "multiple"
    | "";
  sla_term_violated: string;
  measured_uptime: string;
  measured_latency: string;
  measured_error_rate: string;
  reasoning: string;
  confidence: "high" | "medium" | "low";
  slash_amount: number;
  is_appeal: boolean;
  rendered_at: string;
  rendered_by: string;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  blockNumber?: number;
  [key: string]: any;
}

export interface Dispute{
    dispute_id: string
    agreement_id: string
    claimant: string               // client filing the dispute
    respondent: string             // provider being disputed
    incident_start: string         // when the incident allegedly started
    incident_end: string           // when it ended
    description: string
    impact_description: string    // what impact did the breach have
    status: "open" | "under_review" | "verdict_rendered" | "appealed" | "resolved"
    verdict_id: string
    appeal_verdict_id: string
    slash_executed: boolean
    slashed_amount: number
    filed_at: string
    resolved_at: string
    evidence_ids:string[]
}

export interface FullDispute {
  dispute: Dispute;

  agreement: Agreement;

  claimant: Client;
  respondent: Provider;

  evidence: DisputeEvidence[];

  verdict?: ArbitrationVerdict;
  appeal_verdict?: ArbitrationVerdict;

  telemetry_readings: TelemetryReading[];
}



export interface NetworkStats {
    activeAgreements: number,
    registeredProviders: number,
    activeDisputes: number,
    resolvedDisputes: number,
  };


  