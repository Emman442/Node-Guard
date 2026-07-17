import React, { useState } from "react";
import { ArrowLeft, Clock, ShieldAlert, CheckCircle2, Copy, Plus, Server } from "lucide-react";
import { Agreement, TelemetryReading, TelemetrySource } from "../lib/contract/types";

interface AgreementDetailPageProps {
  agreement: Agreement & { readings: TelemetryReading[] };
  telemetrySources: TelemetrySource[];
  connectedWallet: string;
  onNavigate: (view: string, params?: any) => void;
  onCopyText: (text: string, label: string) => void;
  onSubmitTelemetry: (reading: { uptime: number; latency: number; errorRate: number; blocksBehind: number }) => Promise<void>;
  triggerToast: (title: string, desc: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export default function AgreementDetailPage({
  agreement,
  telemetrySources,
  connectedWallet,
  onNavigate,
  onCopyText,
  onSubmitTelemetry,
  triggerToast
}: AgreementDetailPageProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Simulation states
  const [simUptime, setSimUptime] = useState("99.9");
  const [simLatency, setSimLatency] = useState("120");
  const [simErrorRate, setSimErrorRate] = useState("0.01");
  const [simBlocksBehind, setSimBlocksBehind] = useState("1");

  // --- NORMALIZATION LAYER ---
  // This maps the snake_case API values from your smart contract types directly
  // to the clean camelCase values expected by your TSX render blocks.
  const norm = {
    id: agreement.agreement_id,
    name: agreement.service_name,
    type: agreement.service_type,
    endpoint: agreement.service_endpoint,
    providerWallet: agreement.provider,
    clientWallet: agreement.client,
    monthlyFee: agreement.monthly_fee_gen,
    maxPenaltyPerDispute: agreement.sla_terms?.max_penalty_per_dispute ?? 0,
    penaltyPerIncident: agreement.sla_terms?.penalty_per_incident ?? 0,
    telemetrySourceIds: agreement.telemetry_source_ids ?? [],
    status: agreement.status,
    requirements: {
      uptimeRequired: Number(agreement.sla_terms?.uptime_percentage ?? 0),
      maxLatency: Number(agreement.sla_terms?.max_latency_ms ?? 0),
      maxErrorRate: Number(agreement.sla_terms?.max_error_rate ?? 0),
      maxBlocksBehind: Number(agreement.sla_terms?.data_freshness_blocks ?? 0),
      region: agreement.sla_terms?.measurement_region ?? "N/A",
    },
    termsEnglish: agreement.sla_terms?.plain_english_sla ?? "",
    readings: agreement.readings ?? []
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "text-[#06b6d4] border-[#06b6d4]/30";
      case "disputed": return "text-[#f59e0b] border-[#f59e0b]/30";
      case "terminated": return "text-[#737373] border-[#737373]/30";
      case "suspended": return "text-[#dc2626] border-[#dc2626]/30";
      case "resolved": return "text-[#22c55e] border-[#22c55e]/30";
      default: return "text-[#737373] border-[#1a1a1a]";
    }
  };

  const getSourceDetails = (sourceId: string) => {
    // contract uses source_id instead of id
    return telemetrySources.find((s) => s.source_id === sourceId);
  };

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmitTelemetry({
        uptime: Number(simUptime),
        latency: Number(simLatency),
        errorRate: Number(simErrorRate),
        blocksBehind: Number(simBlocksBehind),
      });
      triggerToast("Telemetry Logged", "Probed telemetry coordinates recorded successfully on-chain.", "success");
      setIsSimulating(false);
    } catch (err) {
      triggerToast("Logging Failed", "Could not write simulated performance reading.", "error");
    }
  };

  const isClient = connectedWallet.toLowerCase() === norm.clientWallet.toLowerCase();

  // Create simple SVG sparkline data path from readings
  const points = norm.readings.length > 0 
    ? [...norm.readings].reverse().map((r, i) => {
        const x = (i / Math.max(1, norm.readings.length - 1)) * 300;
        // contract uses uptime_percentage instead of uptime
        const uptimeNum = Number(r.uptime_percentage);
        const normalizedUp = Math.min(100, Math.max(90, uptimeNum));
        const y = 50 - ((normalizedUp - 90) / 10) * 45;
        return `${x},${y}`;
      }).join(" ")
    : "";

  return (
    <div className="space-y-8 pb-16">
      {/* Back link */}
      <button
        onClick={() => onNavigate("dashboard")}
        className="text-[#737373] hover:text-[#06b6d4] font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors border-none bg-transparent"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> &lt; BACK TO DASHBOARD
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1a1a1a] pb-6">
        <div className="space-y-1">
          <div className="text-[#06b6d4] font-mono text-xs tracking-wider uppercase">
            COORDINATOR AGREEMENT ID: {norm.id}
          </div>
          <h1 className="text-3xl font-heading font-bold text-white uppercase tracking-tight">
            {norm.name}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#131313] text-[#06b6d4] border border-[#1a1a1a] px-2.5 py-0.5 font-mono uppercase">
              {norm.type}
            </span>
            <span className="text-[10px] text-[#737373] font-mono uppercase">
              MEASUREMENT REGION: <b className="text-white font-bold">{norm.requirements.region}</b>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-block px-4 py-2 border text-sm font-bold uppercase tracking-wider ${getStatusColor(norm.status)}`}>
            {norm.status}
          </span>
        </div>
      </div>

      {/* Page Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: SLA parameters, history and telemetry sources */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Parties block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0e0e0e] border border-[#1a1a1a] p-5">
            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-[#737373] uppercase text-[10px]">INFRASTRUCTURE PROVIDER:</span>
              <div className="flex items-center justify-between bg-[#090909] border border-[#1a1a1a] px-3 py-2 text-white">
                <span className="font-bold truncate">{norm.providerWallet}</span>
                <button
                  onClick={() => onCopyText(norm.providerWallet, "Provider address")}
                  className="text-[#3d3d3d] hover:text-[#06b6d4] cursor-pointer pl-2 bg-transparent border-none"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-[#737373] uppercase text-[10px]">CLIENT CONTRACT SUBSCRIBER:</span>
              <div className="flex items-center justify-between bg-[#090909] border border-[#1a1a1a] px-3 py-2 text-white">
                <span className="font-bold truncate">{norm.clientWallet}</span>
                <button
                  onClick={() => onCopyText(norm.clientWallet, "Client address")}
                  className="text-[#3d3d3d] hover:text-[#06b6d4] cursor-pointer pl-2 bg-transparent border-none"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Endpoint display */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-5 space-y-2">
            <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">TARGET SERVICE ENDPOINT</div>
            <div className="flex items-center justify-between bg-[#090909] border border-[#1a1a1a] px-3 py-2">
              <span className="font-mono text-xs text-white truncate break-all">{norm.endpoint}</span>
              <button
                onClick={() => onCopyText(norm.endpoint, "Endpoint URL")}
                className="text-[#3d3d3d] hover:text-[#06b6d4] cursor-pointer pl-2 bg-transparent border-none"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SLA Terms & Sparkline */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6">
            <h2 className="text-sm font-heading font-bold text-[#06b6d4] uppercase tracking-wider border-b border-[#131313] pb-3">
              SLA CORE THRESHOLDS &amp; PERFORMANCE
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#090909] border border-[#1a1a1a] p-4 font-mono text-xs space-y-1">
                <div className="text-[9px] text-[#737373] uppercase">REQUIRED UPTIME</div>
                <div className="text-white text-md font-bold">{norm.requirements.uptimeRequired}%</div>
              </div>
              <div className="bg-[#090909] border border-[#1a1a1a] p-4 font-mono text-xs space-y-1">
                <div className="text-[9px] text-[#737373] uppercase">MAX LATENCY ALLOWED</div>
                <div className="text-white text-md font-bold">{norm.requirements.maxLatency} ms</div>
              </div>
              <div className="bg-[#090909] border border-[#1a1a1a] p-4 font-mono text-xs space-y-1">
                <div className="text-[9px] text-[#737373] uppercase">MAX ERROR RATE</div>
                <div className="text-white text-md font-bold">{norm.requirements.maxErrorRate}%</div>
              </div>
              <div className="bg-[#090909] border border-[#1a1a1a] p-4 font-mono text-xs space-y-1">
                <div className="text-[9px] text-[#737373] uppercase">BLOCK REPLICATION DELAY</div>
                <div className="text-white text-md font-bold">{norm.requirements.maxBlocksBehind} BLOCKS</div>
              </div>
            </div>

            {/* Sparkline Visualization */}
            {norm.readings.length > 0 && (
              <div className="bg-[#090909] border border-[#1a1a1a] p-4 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#737373]">
                  <span>UPTIME PROBE SPARKLINE (LATEST PROBES)</span>
                  <span className="text-[#06b6d4]">90% - 100% SCALE</span>
                </div>
                <div className="h-16 flex items-end">
                  <svg className="w-full h-12" viewBox="0 0 300 50" preserveAspectRatio="none">
                    {points && (
                      <polyline
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        points={points}
                      />
                    )}
                  </svg>
                </div>
              </div>
            )}

            {/* Plain English SLA */}
            <div className="space-y-2 font-mono text-xs">
              <span className="text-[#737373] uppercase text-[10px] tracking-wider block">CONTRACT SPECIFICATION SHEET</span>
              <p className="text-[#737373] bg-[#090909] p-4 border border-[#1a1a1a] leading-relaxed break-words whitespace-pre-wrap">
                {norm.termsEnglish}
              </p>
            </div>
          </div>

          {/* Telemetry Probers */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-4">
            <h2 className="text-sm font-heading font-bold text-[#06b6d4] uppercase tracking-wider">
              APPROVED TELEMETRY CHANNELS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {norm.telemetrySourceIds.map((sourceId) => {
                const src = getSourceDetails(sourceId);
                return src ? (
                  <div key={sourceId} className="bg-[#090909] border border-[#1a1a1a] p-3 font-mono text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white font-bold">{src.name}</span>
                      <span className="text-[9px] bg-[#131313] text-[#06b6d4] border border-[#1a1a1a] px-1.5 py-0.5 uppercase">
                        {src.source_type}
                      </span>
                    </div>
                    <div className="text-[#3d3d3d] text-[10px] truncate">{src.url}</div>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Telemetry Reading History Table */}
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-[#1a1a1a] pb-3">
              <h2 className="text-lg font-heading font-bold text-white uppercase tracking-tight">
                PERFORMANCE TELEMETRY HISTORICAL LOGS
              </h2>
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className="border border-[#06b6d4] text-[#06b6d4] px-3 py-1.5 font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 hover:bg-[#06b6d4]/10 cursor-pointer bg-transparent"
              >
                <Plus className="w-3.5 h-3.5" /> EMULATE TELEMETRY PROBE
              </button>
            </div>

            {/* Manual Simulation Module */}
            {isSimulating && (
              <form onSubmit={handleSimulateSubmit} className="bg-[#0e0e0e] border border-[#06b6d4] p-5 space-y-4 font-mono text-xs">
                <div className="text-xs text-[#06b6d4] uppercase font-bold">&gt; EMULATE OUT-OF-BAND TELEMETRY QUERY</div>
                <p className="text-[#737373] text-[10px] leading-relaxed">
                  Provide custom performance metrics to mock an immediate polling query by an independent telemetry validator.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#737373] block">UPTIME (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={simUptime}
                      onChange={(e) => setSimUptime(e.target.value)}
                      className="bg-[#090909] text-white border border-[#1a1a1a] p-2 focus:outline-none focus:border-[#06b6d4] w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#737373] block">LATENCY (MS)</label>
                    <input
                      type="number"
                      required
                      value={simLatency}
                      onChange={(e) => setSimLatency(e.target.value)}
                      className="bg-[#090909] text-white border border-[#1a1a1a] p-2 focus:outline-none focus:border-[#06b6d4] w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#737373] block">ERROR (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={simErrorRate}
                      onChange={(e) => setSimErrorRate(e.target.value)}
                      className="bg-[#090909] text-white border border-[#1a1a1a] p-2 focus:outline-none focus:border-[#06b6d4] w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#737373] block">BLOCK DELAY</label>
                    <input
                      type="number"
                      required
                      value={simBlocksBehind}
                      onChange={(e) => setSimBlocksBehind(e.target.value)}
                      className="bg-[#090909] text-white border border-[#1a1a1a] p-2 focus:outline-none focus:border-[#06b6d4] w-full"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsSimulating(false)}
                    className="text-[#737373] px-3 py-1.5 font-bold uppercase hover:bg-[#131313] bg-transparent border-none"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="bg-[#06b6d4] text-black px-4 py-1.5 font-bold uppercase hover:bg-[#67e8f9] border-none"
                  >
                    LOG METRICS
                  </button>
                </div>
              </form>
            )}

            <div className="bg-[#0e0e0e] border border-[#1a1a1a] overflow-x-auto">
              {norm.readings.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#737373] font-mono">
                  NO PERFORMANCE TELEMETRY RECORDED FOR THIS SLA.
                </div>
              ) : (
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] text-[#737373] bg-[#090909]">
                      <th className="p-4 uppercase">TIMESTAMP</th>
                      <th className="p-4 uppercase">MEASURED UPTIME</th>
                      <th className="p-4 uppercase">AVERAGE LATENCY</th>
                      <th className="p-4 uppercase">ERROR RATE</th>
                      <th className="p-4 uppercase">DATA FRESHNESS</th>
                      <th className="p-4 uppercase">SLA STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {norm.readings.map((r, idx) => {
                      const readingUptime = Number(r.uptime_percentage);
                      const readingLatency = Number(r.avg_latency_ms);
                      const readingError = Number(r.error_rate);
                      const readingDelay = Number(r.blocks_behind);

                      const isUpOk = readingUptime >= norm.requirements.uptimeRequired;
                      const isLatOk = readingLatency <= norm.requirements.maxLatency;
                      const isErrOk = readingError <= norm.requirements.maxErrorRate;
                      const isDelayOk = readingDelay <= norm.requirements.maxBlocksBehind;

                      // Evaluate general visual compliance status
                      const passesAll = isUpOk && isLatOk && isErrOk && isDelayOk;

                      return (
                        <tr key={r.reading_id || idx} className="border-b border-[#131313] hover:bg-[#131313]/10">
                          <td className="p-4 text-[#737373]">
                            {new Date(r.recorded_at).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span className={isUpOk ? "text-[#22c55e]" : "text-[#dc2626]"}>
                              {readingUptime}%
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={isLatOk ? "text-[#22c55e]" : "text-[#dc2626]"}>
                              {readingLatency} ms
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={isErrOk ? "text-[#22c55e]" : "text-[#dc2626]"}>
                              {readingError}%
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={isDelayOk ? "text-[#22c55e]" : "text-[#dc2626]"}>
                              {readingDelay} blocks behind
                            </span>
                          </td>
                          <td className="p-4 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              passesAll ? "bg-[#22c55e]" : "bg-[#dc2626]"
                            }`}></span>
                            <span className={`font-bold ${
                              passesAll ? "text-[#22c55e]" : "text-[#dc2626]"
                            }`}>
                              {passesAll ? "COMPLIANT" : "BREACH DETECTED"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Financial Status & File Dispute Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6">
            <h2 className="text-xs font-mono text-[#737373] uppercase tracking-wider border-b border-[#131313] pb-2">
              FINANCIAL CONTRACT SUMMARY
            </h2>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#737373]">MONTHLY RENTAL FEE:</span>
                <span className="text-white font-bold">{norm.monthlyFee} GEN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">STAKED GUARANTEE:</span>
                <span className="text-[#06b6d4] font-bold">{norm.maxPenaltyPerDispute} GEN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">PENALTY / INCIDENT:</span>
                <span className="text-[#06b6d4] font-bold">{norm.penaltyPerIncident} GEN</span>
              </div>
              <div className="flex justify-between border-t border-[#131313] pt-4 text-sm">
                <span className="text-amber-500 uppercase font-bold">COLLATERAL AT RISK:</span>
                <span className="text-amber-500 font-bold">{norm.maxPenaltyPerDispute} GEN</span>
              </div>
            </div>
          </div>

          {/* Client File Dispute Panel */}
          {isClient && norm.status.toLowerCase() === "active" && (
            <div className="bg-[#0e0e0e] border border-[#dc2626]/30 p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-heading font-bold text-white uppercase flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" /> REPORT AN SLA INCIDENT
                </h3>
                <p className="text-xs text-[#737373]">
                  If telemetry probers indicate performance falls below targets, file an official GenLayer dispute.
                </p>
              </div>
              <button
                onClick={() => onNavigate("file-dispute", { agreementId: norm.id })}
                className="w-full bg-transparent border border-[#dc2626] hover:bg-[#dc2626]/10 text-red-500 py-3 font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                FILE DISPUTE &gt;
              </button>
              <div className="text-[10px] font-mono text-[#3d3d3d] uppercase text-center">
                Disputes trigger validator logs query and machine learning arbitration analyses.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}