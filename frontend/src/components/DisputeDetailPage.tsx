import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, ShieldAlert, CheckCircle2, Copy, Play, AlertCircle, Cpu, RefreshCw, Scale } from "lucide-react";
import { Dispute, Agreement, DisputeEvidence, ArbitrationVerdict } from "../lib/contract/types";
import { useAppealVerdict, useRenderVerdict, useSubmitEvidence, useFetchVerdict } from "../lib/hooks/useNodeGuard";
import { EvidenceRow } from "./EvidenceRow";

interface DisputeDetailPageProps {
  dispute: Dispute;
  agreement: Agreement | undefined;
  connectedWallet: string;
  onNavigate: (view: string, params?: any) => void;
  onCopyText: (text: string, label: string) => void;
  triggerToast: (title: string, desc: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export default function DisputeDetailPage({
  dispute,
  agreement,
  connectedWallet,
  onNavigate,
  onCopyText,
  triggerToast
}: DisputeDetailPageProps) {

  const [isAddingEvidence, setIsAddingEvidence] = useState(false);
  const [newEvidenceUrl, setNewEvidenceUrl] = useState("");
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceType, setEvidenceType] = useState("log_url");
  const [evidenceDesc, setEvidenceDesc] = useState("");
  const evidence = dispute?.evidence_ids || [];
  const { data: verdict, isPending: isLoadingVerdict } = useFetchVerdict(dispute.verdict_id);

  console.log("verdict", verdict);


  const canAppeal =
    !!verdict &&
    (verdict.verdict === "breach_confirmed" ||
      verdict.verdict === "partial_breach") &&
    dispute.status === "verdict_rendered" &&
    !dispute.appeal_verdict_id;

  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealComments, setAppealComments] = useState("");
  const [appealEvidenceUrl, setAppealEvidenceUrl] = useState("");

  const { isPending: isAppealing, mutate: appealVerdict } = useAppealVerdict();
  const { isPending: isSubmittingEvidence, mutate: submitEvidence } = useSubmitEvidence();
  const { isPending: isRenderingVerdict, mutate: renderVerdict } = useRenderVerdict();

  const isClaimant = connectedWallet.toLowerCase() === dispute.claimant.toLowerCase();
  const isProvider = connectedWallet.toLowerCase() === dispute.respondent.toLowerCase();

  const handleRunArbitration = () => {
    renderVerdict(dispute.dispute_id, {
      onSuccess: () => {
        triggerToast("Success", "Consensus query resolved and verdict recorded.", "success");
      },
      onError: (err: any) => {
        triggerToast("Error", err.message || "Arbitration execution failed.", "error");
      }
    });
  };

  const handleSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceUrl || !evidenceTitle) return;

    submitEvidence(
      {
        disputeId: dispute.dispute_id,
        url: newEvidenceUrl,
        title: evidenceTitle,
        evidenceType: evidenceType,
        description: evidenceDesc || "No description provided."
      },
      {
        onSuccess: () => {
          triggerToast("Evidence Submitted", "Your defense logging has been securely logged on-chain.", "success");
          setNewEvidenceUrl("");
          setEvidenceTitle("");
          setEvidenceDesc("");
          setIsAddingEvidence(false);
        },
        onError: (err: any) => {
          triggerToast("Submission Failed", err.message || "Failed to push evidence link.", "error");
        }
      }
    );
  };

  const handleApplyAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealComments) return;

    appealVerdict(
      { disputeId: dispute.dispute_id, appealContext: appealComments, additionalEvidenceUrl: appealEvidenceUrl || "" },
      {
        onSuccess: () => {
          triggerToast("Appeal Filed", "Escalation initiated successfully.", "success");
          setAppealComments("");
          setShowAppealForm(false);
        },
        onError: (err: any) => {
          triggerToast("Appeal Failed", err.message || "Could not process escalation.", "error");
        }
      }
    );
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Back link */}
      <button
        onClick={() => onNavigate("disputes")}
        className="text-[#737373] hover:text-[#06b6d4] font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors border-none bg-transparent"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> &lt; BACK TO DISPUTES
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1a1a1a] pb-6">
        <div className="space-y-1">
          <div className="text-[#06b6d4] font-mono text-xs uppercase tracking-wider">
            CASE ARBITRATION ID: #{dispute.dispute_id.slice(0, 18)}...
          </div>
          <h1 className="text-3xl font-heading font-bold text-white uppercase tracking-tight">
            SLA Breach Dispute
          </h1>
          <div className="text-xs text-[#737373] font-mono uppercase">
            ASSOCIATED CONTRACT: <span className="text-white font-bold">{agreement ? agreement.service_name : `Agreement #${dispute.agreement_id}`}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-block px-4 py-2 border text-sm font-bold uppercase tracking-wider ${dispute.status === "open" ? "text-cyan-400 border-cyan-400/30" :
            dispute.status === "under_review" ? "text-amber-500 border-amber-500/30" :
              dispute.status === "appealed" ? "text-purple-400 border-purple-400/30" :
                "text-green-500 border-green-500/30"
            }`}>
            {dispute.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Claims & evidence */}
        <div className="lg:col-span-8 space-y-8">
          {/* Dispute details cards */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6">
            <h2 className="text-xs font-mono text-[#06b6d4] uppercase tracking-wider font-bold border-b border-[#131313] pb-2">
              DISPUTE CONTEXT DETAILS
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[#737373] uppercase text-[10px]">CLAIMANT SUBSCRIBER:</span>
                <div className="bg-[#090909] border border-[#1a1a1a] p-2 text-white truncate flex justify-between items-center">
                  <span className="truncate">{dispute.claimant}</span>
                  <button onClick={() => onCopyText(dispute.claimant, "Claimant")} className="text-[#3d3d3d] hover:text-[#06b6d4] bg-transparent border-none">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[#737373] uppercase text-[10px]">DEFENDING PROVIDER:</span>
                <div className="bg-[#090909] border border-[#1a1a1a] p-2 text-white truncate flex justify-between items-center">
                  <span className="truncate">{dispute.respondent}</span>
                  <button onClick={() => onCopyText(dispute.respondent, "Provider")} className="text-[#3d3d3d] hover:text-[#06b6d4] bg-transparent border-none">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1 font-mono text-xs">
              <span className="text-[#737373] uppercase text-[10px]">SLA INCIDENT TIMEFRAME (UTC):</span>
              <div className="bg-[#090909] border border-[#1a1a1a] p-3 text-white flex justify-between">
                <span>START: {new Date(dispute.incident_start).toLocaleString()}</span>
                <span>END: {new Date(dispute.incident_end).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1 font-mono text-xs">
              <span className="text-[#737373] uppercase text-[10px]">STATEMENT OF BREACH CLAIM:</span>
              <p className="text-[#737373] bg-[#090909] p-4 border border-[#1a1a1a] font-sans leading-relaxed text-sm whitespace-pre-wrap">
                {dispute.description}
              </p>
            </div>

            {dispute.impact_description && (
              <div className="space-y-1 font-mono text-xs">
                <span className="text-[#737373] uppercase text-[10px]">BUSINESS IMPACT SPECIFICATION:</span>
                <p className="text-[#737373] bg-[#090909] p-4 border border-[#1a1a1a] font-sans leading-relaxed text-sm whitespace-pre-wrap">
                  {dispute.impact_description}
                </p>
              </div>
            )}
          </div>

          {/* Evidence section */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#131313] pb-2">
              <h2 className="text-xs font-mono text-[#06b6d4] uppercase tracking-wider font-bold">
                SUBMITTED EVIDENCE REGISTRY
              </h2>
              {isProvider && dispute.status !== "resolved" && dispute.status !== "verdict_rendered" && (
                <button
                  onClick={() => setIsAddingEvidence(!isAddingEvidence)}
                  className="text-xs text-[#06b6d4] hover:underline font-bold bg-transparent border-none cursor-pointer"
                >
                  {isAddingEvidence ? "CANCEL" : "+ SUBMIT DEFENSE LOG"}
                </button>
              )}
            </div>

            {/* Defense Logging form */}
            {isAddingEvidence && (
              <form onSubmit={handleSubmitEvidence} className="bg-[#090909] border border-[#06b6d4] p-4 space-y-4 font-mono text-xs">
                <div className="text-[10px] text-[#06b6d4] uppercase font-bold">&gt; LOG COUNTER-PROOF EVIDENCE</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#737373] uppercase">Evidence Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Server Outage Report"
                      value={evidenceTitle}
                      onChange={(e) => setEvidenceTitle(e.target.value)}
                      className="bg-black text-white border border-[#1a1a1a] px-3 py-2 text-xs focus:outline-none focus:border-[#06b6d4] w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#737373] uppercase">Evidence Type *</label>
                    <select
                      value={evidenceType}
                      onChange={(e) => setEvidenceType(e.target.value)}
                      className="bg-black text-white border border-[#1a1a1a] px-3 py-2 text-xs focus:outline-none focus:border-[#06b6d4] w-full"
                    >
                      <option value="log_url">Log File</option>
                      <option value="screenshot_url">Screenshot</option>
                      <option value="monitoring_dashboard">Monitoring Dashboard</option>
                      <option value="telemetry_url">Telemetry URL</option>
                      <option value="transaction_proof">Transaction Proof</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#737373] uppercase">IPFS Link / URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://ipfs.io/ipfs/QmProviderMetrics..."
                    value={newEvidenceUrl}
                    onChange={(e) => setNewEvidenceUrl(e.target.value)}
                    className="bg-black text-white border border-[#1a1a1a] px-3 py-2 text-xs focus:outline-none focus:border-[#06b6d4] w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#737373] uppercase">Short Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe what this telemetry or logging proves..."
                    value={evidenceDesc}
                    onChange={(e) => setEvidenceDesc(e.target.value)}
                    className="bg-black text-white border border-[#1a1a1a] p-3 text-xs focus:outline-none focus:border-[#06b6d4] w-full"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingEvidence(false)}
                    className="text-[#737373] uppercase font-bold bg-transparent border-none py-2 px-3 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEvidence}
                    className="bg-[#06b6d4] text-black px-4 py-2 font-bold uppercase hover:bg-[#67e8f9] disabled:opacity-50"
                  >
                    {isSubmittingEvidence ? "LOGGING..." : "SUBMIT EVIDENCE"}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {evidence.length === 0 ? (
                <div className="text-xs text-[#737373] font-mono">NO SUBMITTED EVIDENCE RECORDS LOGGED.</div>
              ) : (
                evidence.map((ev) => (
                  <EvidenceRow key={ev} evidenceId={ev} />
                ))
              )}
            </div>
          </div>

          {/* APPEALS SECTION */}
          {dispute.status === "appealed" && verdict && (
            <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-4">
              <h2 className="text-sm font-heading font-bold text-[#06b6d4] uppercase tracking-wider border-b border-[#131313] pb-2 flex items-center gap-2">
                <Scale className="w-4 h-4" /> APPELLATE PROCEEDING REGISTRY
              </h2>

              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 bg-[#090909] border border-[#1a1a1a] space-y-2">
                  <div className="text-[10px] text-purple-400 uppercase font-bold">&gt; FILED APPEAL COMPLAINT COMMENTS:</div>
                  <p className="text-[#737373] font-sans leading-relaxed whitespace-pre-wrap">{verdict.reasoning}</p>
                  <div className="text-[10px] text-[#3d3d3d] pt-1">Filed: {new Date(verdict.rendered_at).toLocaleDateString()}</div>
                </div>

                {verdict.is_appeal ? (
                  <div className="p-4 bg-[#1a0e1a]/20 border border-purple-500/20 space-y-2">
                    <div className="text-[10px] text-purple-400 uppercase font-bold">&gt; APPELLATE FINAL BINDING DECISION:</div>
                    <p className="text-purple-300 font-sans leading-relaxed whitespace-pre-wrap">{verdict.reasoning}</p>
                    <div className="text-[10px] text-purple-500/50">Settled: {new Date(verdict.rendered_at).toLocaleDateString()}</div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#090909] border border-purple-500/20 text-center space-y-3">
                    <div className="text-xs text-purple-400 font-bold uppercase">&gt; PANEL ASSIGNMENT: APPELLATE COURT ACTIVE</div>
                    <p className="text-[11px] text-[#737373] max-w-md mx-auto">
                      This appeal is currently being reviewed by a higher-tier multisig of validator nodes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROVIDER INITIATE APPEAL SEED */}
          {isProvider && dispute.status === "verdict_rendered" && canAppeal && (
            <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-4 font-mono text-xs">
              <h2 className="text-sm font-heading font-bold text-[#06b6d4] uppercase tracking-wider border-b border-[#131313] pb-2">
                INITIATE ESCALATION
              </h2>
              <p className="text-xs text-[#737373] leading-relaxed">
                As the provider, if you believe the AI consensus reached an incorrect verdict due to stale telemetry, you may submit an appeal to escalate this dispute to the high-tier appellate panel.
              </p>
              {!showAppealForm ? (
                <button
                  onClick={() => setShowAppealForm(true)}
                  className="border border-[#06b6d4] text-[#06b6d4] px-4 py-2 text-xs uppercase font-bold hover:bg-[#06b6d4]/10 cursor-pointer bg-transparent"
                >
                  INITIATE APPELLATE ESCALATION &gt;
                </button>
              ) : (
                <form onSubmit={handleApplyAppeal} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#737373] uppercase">Appeal Context / Justification *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Provide deep technical reasoning, telemetry exceptions, or server configurations detailing why the first-level verdict was erroneous..."
                      value={appealComments}
                      onChange={(e) => setAppealComments(e.target.value)}
                      className="bg-[#090909] text-white border border-[#1a1a1a] p-3 text-xs focus:outline-none focus:border-[#06b6d4] w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#737373] uppercase">Additional Evidence Link (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://ipfs.io/ipfs/QmAdditionalSupportingLogs..."
                      value={appealEvidenceUrl}
                      onChange={(e) => setAppealEvidenceUrl(e.target.value)}
                      className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-xs focus:outline-none focus:border-[#06b6d4] w-full"
                    />
                  </div>

                  <div className="flex gap-2 justify-end font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAppealForm(false);
                        setAppealComments("");
                        setAppealEvidenceUrl("");
                      }}
                      className="text-[#737373] uppercase font-bold bg-transparent border-none py-2 px-3 hover:text-white"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={isAppealing}
                      className="bg-[#06b6d4] text-black px-4 py-1.5 uppercase font-bold disabled:opacity-50"
                    >
                      {isAppealing ? "SUBMITTING..." : "SUBMIT APPEAL"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive terminal & final verdict card */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Verdict Box */}
          {verdict ? (
            <div className="bg-[#0e0e0e] border border-[#06b6d4] p-6 space-y-6">
              <div className="space-y-2 border-b border-[#131313] pb-4">
                <div className="flex justify-between items-center font-mono text-[10px]">
                  <span className="text-[#737373] uppercase">BINDING RULING</span>
                  <span className="text-[#06b6d4]">CONFIDENCE: {verdict.confidence.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#06b6d4]" />
                  <h3 className="text-md font-heading font-bold text-white uppercase">
                    Validator Verdict
                  </h3>
                </div>
              </div>

              {/* Status banner */}
              <div className={`p-4 border font-mono text-xs uppercase text-center font-bold ${verdict.verdict === "breach_confirmed" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                verdict.verdict === "partial_breach" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                  "bg-green-500/10 border-green-500/20 text-green-500"
                }`}>
                {verdict.verdict.replace("_", " ")}
              </div>

              {/* Stats overview */}
              <div className="space-y-4 font-mono text-xs">
                {dispute.slashed_amount > 0 && (
                  <div className="flex justify-between bg-red-950/20 border border-red-500/20 p-2.5 text-red-500 font-bold">
                    <span>STAKE SLASHED:</span>
                    <span>{dispute.slashed_amount.toLocaleString()} GEN</span>
                  </div>
                )}
                {verdict.sla_term_violated && (
                  <div className="space-y-1">
                    <span className="text-[#737373] text-[10px] uppercase block">RULE VIOLATION:</span>
                    <span className="text-white text-xs block bg-[#090909] border border-[#1a1a1a] p-2 leading-relaxed font-bold">
                      {verdict.sla_term_violated}
                    </span>
                  </div>
                )}
              </div>

              {/* Measured telemetry comparison */}
              <div className="space-y-2 border-t border-[#131313] pt-4 font-mono text-[10px]">
                <span className="text-[#737373] uppercase block">MEASURED TELEMETRY DURING WINDOW:</span>
                <div className="grid grid-cols-2 gap-2 text-white">
                  <div className="bg-[#090909] border border-[#1a1a1a] p-2">
                    <span className="text-[#737373] block uppercase text-[8px]">UPTIME</span>
                    <span className="font-bold">{verdict.measured_uptime}</span>
                  </div>
                  <div className="bg-[#090909] border border-[#1a1a1a] p-2">
                    <span className="text-[#737373] block uppercase text-[8px]">AVG LATENCY</span>
                    <span className="font-bold">{verdict.measured_latency}</span>
                  </div>
                  <div className="bg-[#090909] border border-[#1a1a1a] p-2">
                    <span className="text-[#737373] block uppercase text-[8px]">ERROR RATE</span>
                    <span className="font-bold">{verdict.measured_error_rate}</span>
                  </div>
                  <div className="bg-[#090909] border border-[#1a1a1a] p-2">
                    <span className="text-[#737373] block uppercase text-[8px]">STAKE SLASHED</span>
                    <span className="font-bold">{verdict.slash_amount} GEN</span>
                  </div>
                </div>
              </div>

              {/* Rationale text block */}
              <div className="space-y-1.5 border-t border-[#131313] pt-4 font-mono text-[10px]">
                <span className="text-[#737373] uppercase block">AI REASONING:</span>
                <p className="text-[#737373] bg-[#090909] p-3 border border-[#1a1a1a] font-sans text-xs leading-relaxed max-h-48 overflow-y-auto">
                  {verdict.reasoning}
                </p>
              </div>

              <div className="text-[9px] text-[#3d3d3d] font-mono uppercase tracking-wider text-center pt-2">
                VERDICT RECORDED ON-CHAIN VIA TX: 0x{dispute.dispute_id.slice(0, 12)}...
              </div>
            </div>
          ) : (
            /* Execution Trigger Panel */
            <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6">
              <h2 className="text-xs font-mono text-[#737373] uppercase tracking-wider border-b border-[#131313] pb-2">
                GENLAYER SLA SETTLEMENT COURT
              </h2>

              <p className="text-xs text-[#737373] font-sans leading-relaxed">
                This dispute remains unresolved. Any connected network participant can initiate the GenLayer consensus query to resolve actual telemetry and trigger automatically binding slashes.
              </p>



              {/* Interactive trigger button */}
              <button
                onClick={handleRunArbitration}
                disabled={isRenderingVerdict}
                className={`w-full py-3 font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border-none ${isRenderingVerdict
                  ? "bg-[#131313] text-[#3d3d3d] cursor-not-allowed border border-[#1a1a1a]"
                  : "bg-[#06b6d4] text-black hover:bg-[#67e8f9] transition-all"
                  }`}
              >
                {isRenderingVerdict ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> RESOLVING CASE...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> RUN GENLAYER AI ARBITRATION
                  </>
                )}
              </button>

              <div className="text-[10px] text-center text-[#3d3d3d] font-mono uppercase leading-relaxed">
                TRIGGERING RUNS REAL TIME MODEL ANALYSIS BY PARSING UPTIME AND SERVICE METRICS TO ARBITRATE CONFLICTS.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}