import React, { useState } from "react";
import { ArrowLeft, AlertTriangle, ShieldAlert, Plus, Trash } from "lucide-react";
import { Agreement } from "../lib/contract/types.ts";
import { useFileDispute } from "../lib/hooks/useNodeGuard.ts";

interface FileDisputePageProps {
  connectedWallet: string;
  agreement: Agreement;
  onNavigate: (view: string, params?: any) => void;
  onDisputeSuccess: (dispute: any) => void;
  triggerToast: (title: string, desc: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export default function FileDisputePage({
  connectedWallet,
  agreement,
  onNavigate,
  onDisputeSuccess,
  triggerToast
}: FileDisputePageProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState("");

  const {mutate: fileDispute, isPending: isFilingDispute} = useFileDispute()
  
  // Evidence inputs list
  const [evidenceList, setEvidenceList] = useState<string[]>([
    "https://ipfs.io/ipfs/QmPerformanceLog_Incident"
  ]);
  const [newEvidence, setNewEvidence] = useState("");


  const handleAddEvidence = () => {
    if (newEvidence.trim() !== "") {
      setEvidenceList([...evidenceList, newEvidence.trim()]);
      setNewEvidence("");
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceList(evidenceList.filter((_, i) => i !== index));
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime || !description) {
      triggerToast("Validation Failed", "Specify the incident window and failure details.", "error");
      return;
    }

    fileDispute({
      agreementId: agreement.agreement_id,
      incidentStart: startTime,
      incidentEnd: endTime,
      description: description,
      impactDescription: impact
    }, {
      onSuccess: ()=>{
        triggerToast("Dispute Filed!", "Dispute filed successfully", "success")
      },

      onError: ()=>{
        triggerToast("Failed", "Failed to file dispute!", "error")
      }
    })
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      {/* Back link */}
      <button
        onClick={() => onNavigate("agreement-detail", { id: agreement.agreement_id })}
        className="text-[#737373] hover:text-[#06b6d4] font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> &lt; BACK TO AGREEMENT
      </button>

      {/* Header */}
      <div className="space-y-1 border-b border-[#1a1a1a] pb-6">
        <h1 className="text-3xl font-heading font-bold text-white uppercase tracking-tight">
          FILE SLA BREACH DISPUTE
        </h1>
        <p className="text-sm text-[#737373]">
          Initiate on-chain SLA arbitration against <b className="text-white font-bold">{agreement.service_name}</b>. AI validators will query telemetry records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Panel */}
        <form onSubmit={handleSubmitDispute} className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Timeframe */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6">
            <h2 className="text-xs font-mono text-[#06b6d4] uppercase tracking-wider font-bold">
              SECTION 01: INCIDENT FAILURE TIMEFRAME
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#737373] uppercase block">INCIDENT START TIME (UTC) <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#737373] uppercase block">INCIDENT END TIME (UTC) <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
                />
              </div>
            </div>
            <div className="text-[10px] text-[#737373] font-mono leading-relaxed bg-[#090909] border border-[#1a1a1a] p-3">
              💡 Select the precise timeframe of the suspected outage or performance drop. The AI validators will pull raw data logs corresponding exactly to this temporal window.
            </div>
          </div>

          {/* Section 2: Statement of SLA breach */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6">
            <h2 className="text-xs font-mono text-[#06b6d4] uppercase tracking-wider font-bold">
              SECTION 02: STATEMENT OF CLAIMS
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#737373] uppercase block">BREACH DESCRIPTION <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. On July 15, the RPC node endpoint returned continuous 504 gateway timeout errors between 14:00 and 16:30 UTC. This violated the 99.9% uptime requirement..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-sans focus:border-[#06b6d4] focus:outline-none w-full h-32"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#737373] uppercase block">BUSINESS IMPACT (OPTIONAL)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. This outage stalled our decentralized exchange's frontend routing, leading to over 10,000 transaction failures for our clients..."
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-sans focus:border-[#06b6d4] focus:outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Evidence Submission */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-4">
            <h2 className="text-xs font-mono text-[#06b6d4] uppercase tracking-wider font-bold">
              SECTION 03: EVIDENCE &amp; LOG CORROBORATION
            </h2>

            <div className="space-y-3 font-mono text-xs">
              <div className="text-[11px] text-[#737373] leading-relaxed">
                Add references (IPFS links, HTTP logs, block tx hashes) to backup your claim.
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://ipfs.io/ipfs/Qm..."
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-xs focus:outline-none focus:border-[#06b6d4] flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddEvidence}
                  className="bg-[#06b6d4] text-black px-4 py-2 font-bold uppercase hover:bg-[#67e8f9]"
                >
                  ADD
                </button>
              </div>

              {evidenceList.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  {evidenceList.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#090909] border border-[#1a1a1a] p-2">
                      <span className="text-[10px] text-[#737373] truncate mr-2">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvidence(idx)}
                        className="text-red-500 hover:text-red-400 font-bold"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>


          {/* Submit */}
          <button
            type="submit"
            disabled={isFilingDispute}
            className="w-full py-4 font-heading font-bold text-sm tracking-widest uppercase cursor-pointer text-center bg-[#1a1a1a] text-[#3d3d3d] cursor-not-allowed bg-red-600 text-white hover:bg-red-500"
          >
            {isFilingDispute?"FILING SLA BREACH DISPUTE...": "FILE SLA BREACH DISPUTE"}
          </button>
        </form>

        {/* Right Info Panel */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-[#0e0e0e] border border-red-500/20 p-6 space-y-6">
            <h2 className="text-xs font-mono text-red-500 uppercase tracking-widest border-b border-red-500/10 pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" /> ON-CHAIN ARBITRATION RULES
            </h2>

            <div className="space-y-4 text-xs font-sans text-[#737373] leading-relaxed">
              <p>
                <b>1. Automated Polling:</b> GenLayer validators will automatically ping specified endpoints and gather archived telemetry during the dispute timeframe.
              </p>
              <p>
                <b>2. Neutral Verdict:</b> Gemini-powered AI model consensus processes telemetry values, evaluates claimant descriptions, and makes binding verdicts.
              </p>
              <p>
                <b>3. Execution of Slashes:</b> If a breach is confirmed, the corresponding penalty amount is automatically slashed from the provider's escrow stake and routed directly to your connected client wallet.
              </p>
              <p className="text-amber-500">
                ⚠️ Abuse of the dispute filing mechanism with false claims may result in client reputation penalties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
