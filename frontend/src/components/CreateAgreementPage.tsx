import React, { useState, useEffect } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { Provider, TelemetrySource } from "../lib/contract/types.ts";
import { useCreateAgreement } from "../lib/hooks/useNodeGuard.ts";

interface CreateAgreementPageProps {
  connectedWallet: string;
  providers: Provider[];
  telemetrySources: TelemetrySource[];
  preselectedProviderWallet?: string;
  onNavigate: (view: string, params?: any) => void;
  triggerToast: (title: string, desc: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

// Temporary internal type for tracking the transaction state
interface TxState {
  status: "idle" | "waiting" | "submitted" | "confirmed" | "error";
  hash?: string;
  error?: string;
}

export default function CreateAgreementPage({
  connectedWallet,
  providers,
  telemetrySources,
  preselectedProviderWallet,
  onNavigate,
  triggerToast
}: CreateAgreementPageProps) {
  // Select Provider State
  const [providerWallet, setProviderWallet] = useState(preselectedProviderWallet || "");
  const [selectedProvider, setSelectedProvider] = useState<Provider | undefined>(undefined);

  // Form inputs
  const [name, setName] = useState("");
  const [type, setType] = useState<"RPC_NODE" | "GPU_CLUSTER" | "INDEXER" | "API" | "OTHER">("RPC_NODE");
  const [endpoint, setEndpoint] = useState("");
  
  const { isPending: isCreatingAgreement, mutate: createAgreement } = useCreateAgreement();

  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  console.log(type.toLowerCase())
  // SLA thresholds
  const [uptimeRequired, setUptimeRequired] = useState("99.9");
  const [maxLatency, setMaxLatency] = useState("200");
  const [maxErrorRate, setMaxErrorRate] = useState("0.1");
  const [maxBlocksBehind, setMaxBlocksBehind] = useState("5");
  const [region, setRegion] = useState<"GLOBAL" | "US-EAST" | "US-WEST" | "EU-WEST" | "ASIA-PAC">("GLOBAL");

  // Plain English Terms
  const [termsEnglish, setTermsEnglish] = useState("");

  // Penalty
  const [penaltyPerIncident, setPenaltyPerIncident] = useState("500");
  const [maxPenaltyPerDispute, setMaxPenaltyPerDispute] = useState("1000");

  // Telemetry sources selected
  const [selectedSources, setSelectedSources] = useState<string[]>(
    telemetrySources.slice(0, 2).map((s) => s.source_id)
  );

  // Duration & Fees
  const [durationDays, setDurationDays] = useState("30");
  const [monthlyFee, setMonthlyFee] = useState("1000");

  useEffect(() => {
    if (providerWallet) {
      const found = providers.find(
        (p) => p.wallet.toLowerCase() === providerWallet.toLowerCase()
      );
      setSelectedProvider(found);
    } else {
      setSelectedProvider(undefined);
    }
  }, [providerWallet, providers]);

  // Handle preset wallet
  useEffect(() => {
    if (preselectedProviderWallet) {
      setProviderWallet(preselectedProviderWallet);
    }
  }, [preselectedProviderWallet]);

  const handleToggleSource = (sourceId: string) => {
    if (selectedSources.includes(sourceId)) {
      setSelectedSources(selectedSources.filter((id) => id !== sourceId));
    } else {
      setSelectedSources([...selectedSources, sourceId]);
    }
  };

  const handleSignAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) {
      triggerToast("Provider Missing", "Please select a registered infrastructure provider node.", "error");
      return;
    }
    if (!name || !endpoint || !termsEnglish || !monthlyFee) {
      triggerToast("Validation Failure", "Please complete all SLA details, metrics, and plain English terms.", "error");
      return;
    }

    const maxPenaltyVal = Number(maxPenaltyPerDispute);
    if (maxPenaltyVal > selectedProvider.staked_gen) {
      triggerToast(
        "Collateral Penalty Overage",
        `Requested maximum dispute penalty (${maxPenaltyVal} GEN) exceeds provider's staked collateral (${selectedProvider.staked_gen.toLocaleString()} GEN).`,
        "error"
      );
      return;
    }

    setTxState({ status: "waiting" });

    createAgreement({
      providerWallet: providerWallet,
      serviceName: name,
      serviceType: type.toLowerCase(),
      serviceEndpoint: endpoint,
      uptimePercentage: uptimeRequired,
      maxLatencyMs: maxLatency,
      maxErrorRate: maxErrorRate,
      dataFreshnessBlocks: maxBlocksBehind, // Fixed missing value
      measurementRegion: region,
      plainEnglishSla: termsEnglish,        // Fixed syntax error (semicolon)
      penaltyPerIncident: Number(penaltyPerIncident),
      maxPenaltyPerDispute: Number(maxPenaltyPerDispute),
      monthlyFeeGen: Number(monthlyFee),
      durationDays: Number(durationDays),
      telemetrySourceIds: selectedSources,  // Fixed type placeholder with actual state array
    }, {
      onSuccess: (data: any) => {
        setTxState({ status: "confirmed" });
        triggerToast("Agreement created!", "Agreement created successfully", "success");

      },
      onError: (err: any) => {
        setTxState({ status: "error", error: err?.message || "Failed to submit transaction" });
        triggerToast("Agreement creation failed", "Failed to create Agreement", "error");
      }
    });
  };

  const hasSufficientStake = selectedProvider
    ? selectedProvider.staked_gen >= (Number(maxPenaltyPerDispute) || 0)
    : false;

  return (
    <div className="space-y-8 pb-16">
      {/* Back link */}
      <button
        onClick={() => onNavigate("providers")}
        className="text-[#737373] hover:text-[#06b6d4] font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors border-none bg-transparent"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> &lt; BACK TO PROVIDERS
      </button>

      {/* Header */}
      <div className="space-y-1 border-b border-[#1a1a1a] pb-6">
        <h1 className="text-3xl font-heading font-bold text-white uppercase tracking-tight">
          CREATE SLA AGREEMENT
        </h1>
        <p className="text-sm text-[#737373]">
          Define strict telemetry SLA targets, establish penalties, and lock provider backing collateral.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Form input */}
        <form onSubmit={handleSignAgreement} className="lg:col-span-7 space-y-8">

          {/* SECTION 1: SERVICE DETAILS */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6">
            <h2 className="text-sm font-heading font-bold text-[#06b6d4] uppercase tracking-wider">
              SECTION 01: SERVICE PROVIDER &amp; ENDPOINT
            </h2>

            <div className="space-y-4">
              {/* Provider selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#737373] uppercase block">PROVIDER NODE ADDRESS</label>
                <select
                  value={providerWallet}
                  onChange={(e) => setProviderWallet(e.target.value)}
                  disabled={!!preselectedProviderWallet}
                  className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2.5 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full cursor-pointer disabled:text-[#3d3d3d] disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-[#0e0e0e]">-- SELECT REGISTERED PROVIDER --</option>
                  {providers.map((p) => (
                    <option key={p.wallet} value={p.wallet} className="bg-[#0e0e0e]">
                      {p.name} ({p.wallet.slice(0, 10)}...) | Stake: {p.staked_gen.toLocaleString()} GEN
                    </option>
                  ))}
                </select>
              </div>

              {selectedProvider && (
                <div className="p-4 bg-[#090909] border border-[#1a1a1a] space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#737373]">PROVIDER:</span>
                    <span className="text-white font-bold">{selectedProvider.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">AVAILABLE COLLATERAL:</span>
                    <span className="text-[#06b6d4] font-bold">{selectedProvider.staked_gen.toLocaleString()} GEN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">REPUTATION:</span>
                    <span className="text-white">{selectedProvider.reputation_score}/100</span>
                  </div>
                </div>
              )}

              {/* Service Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#737373] uppercase block">CONTRACT SERVICE NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ethereum Mainnet High-Throughput RPC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
                />
              </div>

              {/* Service Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#737373] uppercase block">INFRASTRUCTURE TYPE</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(["RPC_NODE", "GPU_CLUSTER", "INDEXER", "API", "OTHER"] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setType(t)}
                      className={`py-2 border font-mono text-[10px] uppercase cursor-pointer transition-all ${type === t
                          ? "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]"
                          : "bg-transparent text-[#737373] border-[#1a1a1a] hover:border-[#262626]"
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Endpoint */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#737373] uppercase block">TARGET ENDPOINT URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://eth-mainnet.provider.io/v1/rpc"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: SLA TERMS */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6">
            <h2 className="text-sm font-heading font-bold text-[#06b6d4] uppercase tracking-wider">
              SECTION 02: TELEMETRY TARGET THRESHOLDS
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#06b6d4] uppercase tracking-wider block font-bold">
                    REQUIRED UPTIME (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.9"
                    value={uptimeRequired}
                    onChange={(e) => setUptimeRequired(e.target.value)}
                    className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#06b6d4] uppercase tracking-wider block font-bold">
                    MAX LATENCY (MS)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="200"
                    value={maxLatency}
                    onChange={(e) => setMaxLatency(e.target.value)}
                    className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#06b6d4] uppercase tracking-wider block font-bold">
                    MAX ERROR RATE (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.1"
                    value={maxErrorRate}
                    onChange={(e) => setMaxErrorRate(e.target.value)}
                    className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#06b6d4] uppercase tracking-wider block font-bold">
                    MAX BLOCKS BEHIND
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="5"
                    value={maxBlocksBehind}
                    onChange={(e) => setMaxBlocksBehind(e.target.value)}
                    className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Region */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#737373] uppercase block">MEASUREMENT REGION</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(["GLOBAL", "US-EAST", "US-WEST", "EU-WEST", "ASIA-PAC"] as const).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRegion(r)}
                      className={`py-2 border font-mono text-[9px] uppercase cursor-pointer transition-all ${region === r
                          ? "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]"
                          : "bg-transparent text-[#737373] border-[#1a1a1a] hover:border-[#262626]"
                        }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plain English SLA */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#06b6d4] uppercase block font-bold">
                  SLA TERMS IN PLAIN ENGLISH
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Provider guarantees 99.9% monthly uptime for the RPC endpoint. Response latency must not exceed 200ms. Outages exceeding 30 mins constitute a full breach. If a breach is confirmed, 1,000 GEN is slashed from provider's collateral..."
                  value={termsEnglish}
                  onChange={(e) => setTermsEnglish(e.target.value)}
                  className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-xs font-mono focus:border-[#06b6d4] focus:outline-none w-full h-36"
                />
                <div className="text-[10px] text-[#737373] font-mono leading-relaxed mt-1">
                  💡 Write the exact SLA performance definitions. The GenLayer AI validator reads this exact block and cross-checks it against telemetry logs during arbitration claims.
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: PENALTIES */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6">
            <h2 className="text-sm font-heading font-bold text-[#06b6d4] uppercase tracking-wider">
              SECTION 03: PENALTY MATRIX &amp; BACKING
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#737373] block">INCIDENT PENALTY (GEN)</label>
                  <input
                    type="number"
                    required
                    placeholder="500"
                    value={penaltyPerIncident}
                    onChange={(e) => setPenaltyPerIncident(e.target.value)}
                    className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#737373] block">MAX DISPUTE PENALTY (GEN)</label>
                  <input
                    type="number"
                    required
                    placeholder="1000"
                    value={maxPenaltyPerDispute}
                    onChange={(e) => setMaxPenaltyPerDispute(e.target.value)}
                    className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Collateral status check */}
              {selectedProvider && (
                <div className="flex items-center gap-2 p-3 bg-[#090909] border border-[#1a1a1a] text-xs font-mono">
                  <span className={`w-2 h-2 rounded-full ${hasSufficientStake ? "bg-[#22c55e]" : "bg-[#dc2626]"}`}></span>
                  <span className={hasSufficientStake ? "text-[#22c55e]" : "text-red-500"}>
                    {hasSufficientStake
                      ? "✓ Provider has sufficient staked collateral to back this agreement."
                      : "❌ Provider stake is lower than your maximum dispute penalty limit!"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: TELEMETRY SOURCES */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6">
            <h2 className="text-sm font-heading font-bold text-[#06b6d4] uppercase tracking-wider">
              SECTION 04: APPROVED TELEMETRY SOURCES
            </h2>

            <div className="space-y-3">
              <div className="text-xs text-[#737373] font-mono leading-relaxed pb-2">
                Choose the independent monitoring endpoints the AI validators must query to pull raw telemetry performance data during disputes.
              </div>
              <div className="space-y-2">
                {telemetrySources?.map((source) => (
                  <label
                    key={source.source_id}
                    className="flex items-start gap-3 bg-[#090909] border border-[#1a1a1a] p-3 cursor-pointer hover:border-[#262626] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.source_id)}
                      onChange={() => handleToggleSource(source.source_id)}
                      className="mt-1 accent-[#06b6d4] cursor-pointer"
                    />
                    <div className="font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{source.name}</span>
                        <span className="text-[9px] bg-[#131313] text-[#737373] border border-[#1a1a1a] px-1 py-0.5">
                          {source.source_type}
                        </span>
                      </div>
                      <div className="text-[#3d3d3d] mt-1 text-[10px] truncate max-w-sm lg:max-w-md">{source.url}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 5: DURATION & FEES */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6">
            <h2 className="text-sm font-heading font-bold text-[#06b6d4] uppercase tracking-wider">
              SECTION 05: FEES &amp; DURATION
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#737373] block">DURATION (DAYS)</label>
                  <input
                    type="number"
                    required
                    placeholder="30"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#737373] block">MONTHLY SUBSCRIPTION FEE (GEN)</label>
                  <input
                    type="number"
                    required
                    placeholder="1000"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#090909] border border-[#1a1a1a] text-[10px] text-[#737373] font-mono leading-relaxed">
                ℹ️ Standard Protocol Rule: Once both parties sign, the first month's SLA fee is locked in the coordinator contract.
              </div>
            </div>
          </div>

          {/* Inline Transaction state monitor */}
          {txState.status !== "idle" && (
            <div className="bg-[#090909] border border-[#1a1a1a] p-4 font-mono text-xs space-y-1.5">
              {txState.status === "waiting" && (
                <div className="text-[#737373]">&gt; waiting for wallet approval...</div>
              )}
              {txState.status === "submitted" && (
                <div className="text-[#737373]">&gt; transaction submitted... HASH: {txState.hash?.slice(0, 16)}...</div>
              )}
              {txState.status === "confirmed" && (
                <div className="text-[#06b6d4] font-bold">&gt; SLA Agreement Confirmed ✓ (COORDINATION ESCROW BOOTED)</div>
              )}
              {txState.status === "error" && (
                <div className="text-red-500 font-bold">&gt; Error: {txState.error}</div>
              )}
            </div>
          )}

          {/* Sign Button */}
          <button
            type="submit"
            disabled={isCreatingAgreement || txState.status === "waiting" || txState.status === "submitted"}
            className={`w-full py-4 font-heading font-bold text-sm tracking-widest uppercase cursor-pointer text-center border-none ${
              isCreatingAgreement || txState.status === "waiting" || txState.status === "submitted"
                ? "bg-[#1a1a1a] text-[#3d3d3d] cursor-not-allowed"
                : "bg-[#06b6d4] text-black hover:bg-[#67e8f9] transition-colors"
            }`}
          >
            SIGN AGREEMENT &amp; DEPLOY
          </button>
        </form>

        {/* RIGHT COLUMN: Live Agreement Preview Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#1a1a1a] pb-2">
            <Eye className="w-4 h-4 text-[#06b6d4]" />
            <h2 className="text-xs font-mono text-[#737373] uppercase tracking-wider">LIVE CONTRACT PREVIEW</h2>
          </div>

          <div className="bg-[#0e0e0e] border border-[#06b6d4] p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-[#737373]">
                <span>SLA STATUS: <b className="text-[#06b6d4]">PENDING SIGN</b></span>
                <span>TYPE: {type}</span>
              </div>
              <h3 className="text-xl font-heading font-bold text-white uppercase tracking-tight h-12 line-clamp-2">
                {name || "UNTITLED SERVICE AGREEMENT"}
              </h3>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4 border-t border-[#131313] pt-4 font-mono text-[10px]">
              <div>
                <span className="text-[#737373] block uppercase">CLIENT (YOU)</span>
                <span className="text-white font-bold">{connectedWallet.slice(0, 8)}...{connectedWallet.slice(-6)}</span>
              </div>
              <div>
                <span className="text-[#737373] block uppercase">INFRA PROVIDER</span>
                <span className="text-white font-bold">
                  {selectedProvider
                    ? `${selectedProvider.name} (${selectedProvider.wallet.slice(0, 6)}...)`
                    : "NOT SELECTED"}
                </span>
              </div>
            </div>

            {/* Target endpoint */}
            <div className="space-y-1 font-mono text-[10px] border-t border-[#131313] pt-4">
              <span className="text-[#737373] uppercase block">TARGET PROBING ENDPOINT:</span>
              <span className="text-white block truncate text-xs bg-[#090909] border border-[#1a1a1a] px-2 py-1">
                {endpoint || "https://..."}
              </span>
            </div>

            {/* Metric thresholds */}
            <div className="space-y-3 border-t border-[#131313] pt-4">
              <span className="text-[#737373] font-mono text-[10px] uppercase block">SLA METRICS GUARANTEED:</span>
              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="bg-[#090909] border border-[#1a1a1a] p-2.5">
                  <div className="text-[9px] text-[#737373] uppercase">REQUIRED UPTIME</div>
                  <div className="text-white font-bold text-sm">{uptimeRequired}%</div>
                </div>
                <div className="bg-[#090909] border border-[#1a1a1a] p-2.5">
                  <div className="text-[9px] text-[#737373] uppercase">MAX LATENCY</div>
                  <div className="text-white font-bold text-sm">{maxLatency} ms</div>
                </div>
                <div className="bg-[#090909] border border-[#1a1a1a] p-2.5">
                  <div className="text-[9px] text-[#737373] uppercase">MAX ERROR RATE</div>
                  <div className="text-white font-bold text-sm">{maxErrorRate}%</div>
                </div>
                <div className="bg-[#090909] border border-[#1a1a1a] p-2.5">
                  <div className="text-[9px] text-[#737373] uppercase">MAX BLOCK DELAY</div>
                  <div className="text-white font-bold text-sm">{maxBlocksBehind} BLOCKS</div>
                </div>
              </div>
            </div>

            {/* Financial terms */}
            <div className="space-y-2 border-t border-[#131313] pt-4 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#737373] uppercase">SLA CONTRACT DURATION:</span>
                <span className="text-white font-bold">{durationDays} DAYS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373] uppercase">MONTHLY SUBSCRIPTION FEE:</span>
                <span className="text-[#06b6d4] font-bold">{monthlyFee} GEN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373] uppercase">INCIDENT PENALTY SLASH:</span>
                <span className="text-red-500 font-bold">{penaltyPerIncident} GEN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373] uppercase">MAX DISPUTE COLLATERAL LOCKED:</span>
                <span className="text-red-500 font-bold">{maxPenaltyPerDispute} GEN</span>
              </div>
            </div>

            {/* Plain English SLA summary */}
            <div className="border-t border-[#131313] pt-4 font-mono text-[10px] space-y-1">
              <span className="text-[#737373] uppercase block">PLAIN TEXT SPECIFICATION:</span>
              <p className="text-[#737373] bg-[#090909] p-3 border border-[#1a1a1a] h-24 overflow-y-auto line-clamp-4 leading-relaxed">
                {termsEnglish || "Draft contract terms in plain text..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}