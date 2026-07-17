import React from "react";
import { ArrowLeft, Globe, Shield, AlertTriangle, FileText, Check, Copy } from "lucide-react";
import { Provider, Agreement, Dispute } from "../lib/contract/types";

interface ProviderProfilePageProps {
  provider: Provider;
  agreements: Agreement[];
  disputes: Dispute[];
  connectedWallet: string;
  onNavigate: (view: string, params?: any) => void;
  onCopyText: (text: string, label: string) => void;
}

export default function ProviderProfilePage({
  provider,
  agreements,
  disputes,
  connectedWallet,
  onNavigate,
  onCopyText
}: ProviderProfilePageProps) {
  

  const providerAgreements = agreements.filter(
    (a) => a.provider.toLowerCase() === provider.wallet.toLowerCase()
  );
  
  const providerDisputes = disputes.filter(
    (d) => d.respondent.toLowerCase() === provider.wallet.toLowerCase()
  );

  const serviceTypes = Array.from(
    new Set(providerAgreements.map((a) => a.service_type))
  );

  return (
    <div className="space-y-8 pb-16 max-w-5xl">

      <button
        onClick={() => onNavigate("providers")}
        className="text-[#737373] hover:text-[#06b6d4] font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors border-none bg-transparent p-0"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> &lt; BACK TO PROVIDERS
      </button>

      {/* Profile Header Card */}
      <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-[#22c55e] pulse-dot rounded-full"></span>
              <h1 className="text-3xl font-heading font-bold text-white uppercase tracking-tight">
                {provider.name}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              {serviceTypes.length > 0 ? (
                serviceTypes.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] bg-[#131313] text-[#06b6d4] border border-[#1a1a1a] px-2.5 py-0.5 font-mono uppercase tracking-wider"
                  >
                    {t.replace("_", " ")}
                  </span>
                ))
              ) : (
                <span className="text-[10px] bg-[#131313] text-[#737373] border border-[#1a1a1a] px-2.5 py-0.5 font-mono uppercase tracking-wider">
                  No Active Services
                </span>
              )}
            </div>

            <p className="text-sm text-[#737373] font-sans leading-relaxed max-w-2xl">
              {provider.description}
            </p>

            <div className="flex flex-wrap gap-4 pt-2 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[#3d3d3d] text-[10px] uppercase block">NODE WALLET ADDRESS</span>
                <div className="flex items-center gap-2 bg-[#090909] border border-[#1a1a1a] px-3 py-1 text-white">
                  <span className="truncate max-w-[180px] sm:max-w-none">{provider.wallet}</span>
                  <button
                    onClick={() => onCopyText(provider.wallet, "Address")}
                    className="text-[#3d3d3d] hover:text-[#06b6d4] cursor-pointer bg-transparent border-none p-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {provider.website && (
                <div className="space-y-1">
                  <span className="text-[#3d3d3d] text-[10px] uppercase block">WEBSITE URL</span>
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-[#090909] border border-[#1a1a1a] px-3 py-1 text-[#06b6d4] hover:text-white transition-colors decoration-none"
                  >
                    <Globe className="w-3.5 h-3.5" /> {provider.website.replace("https://", "").replace("http://", "")}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto bg-[#090909] border border-[#06b6d4] p-6 space-y-6 md:min-w-[280px]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider block">ESCROW STAKE</span>
              <div className="text-3xl font-mono font-bold text-[#06b6d4]">
                {provider.staked_gen.toLocaleString()} GEN
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-[#737373]">
                <span>NODE REPUTATION score</span>
                <span className="text-[#06b6d4]">{provider.reputation_score}/100</span>
              </div>
              <div className="w-full bg-[#131313] h-1.5 border border-[#1a1a1a]">
                <div className="bg-[#06b6d4] h-full transition-all duration-500" style={{ width: `${provider.reputation_score}%` }}></div>
              </div>
            </div>

            <button
              onClick={() => onNavigate("create-agreement", { providerWallet: provider.wallet })}
              className="w-full bg-[#06b6d4] text-black py-3 font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#67e8f9] transition-all cursor-pointer text-center border-none"
            >
              CREATE SLA CONTRACT &gt;
            </button>
          </div>
        </div>
      </div>

      <hr className="border-[#1a1a1a]" />

      {/* Stats row details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-2">
          <div className="text-xs font-mono text-[#737373] uppercase">TOTAL CLIENT CONTRACTS</div>
          <div className="text-3xl font-mono font-bold text-white">{provider.total_agreements}</div>
          <div className="text-[10px] text-[#3d3d3d] font-mono uppercase">LIFETIME SUBSCRIPTIONS</div>
        </div>
        <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-2">
          <div className="text-xs font-mono text-[#737373] uppercase">BREACH DISPUTES RECEIVED</div>
          <div className="text-3xl font-mono font-bold text-white">{providerDisputes.length}</div>
          <div className="text-[10px] text-[#3d3d3d] font-mono uppercase">CLAIMS SUBMITTED TO COURT</div>
        </div>
        <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-2">
          <div className="text-xs font-mono text-[#737373] uppercase">CONFIRMED STAKE SLASHES</div>
          <div className="text-3xl font-mono font-bold text-red-500">
            {provider.total_slashes}
          </div>
          <div className="text-[10px] text-red-500/50 font-mono uppercase">VERDICTS AGAINST NODE ({provider.total_slashed_gen.toLocaleString()} GEN)</div>
        </div>
      </div>

      <hr className="border-[#1a1a1a]" />

      {/* Bottom dual columns - agreements and disputes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Agreements */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#06b6d4]" /> ACTIVE COMMITMENTS ({providerAgreements.length})
          </h2>
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] divide-y divide-[#131313]">
            {providerAgreements.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#737373] font-mono">
                NO SLA COMMITMENTS DEPLOYED FOR THIS PROVIDER.
              </div>
            ) : (
              providerAgreements.map((a) => (
                <div key={a.agreement_id} className="p-4 flex justify-between items-center text-xs font-mono">
                  <div>
                    <h3 className="text-white font-bold font-heading uppercase text-sm">{a.service_name}</h3>
                    <p className="text-[10px] text-[#737373] mt-1">Uptime guarantee: {a.sla_terms.uptime_percentage}%</p>
                  </div>
                  <button
                    onClick={() => onNavigate("agreement-detail", { id: a.agreement_id })}
                    className="border border-[#1a1a1a] hover:border-[#06b6d4] text-white hover:text-[#06b6d4] px-3 py-1 text-[10px] font-bold uppercase bg-transparent cursor-pointer transition-colors"
                  >
                    VIEW
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Disputes */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#f59e0b]" /> HISTORIC ARBITRATIONS ({providerDisputes.length})
          </h2>
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] divide-y divide-[#131313]">
            {providerDisputes.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#737373] font-mono">
                NO SLA CLAIMS OR DISPUTES ON-RECORD FOR THIS PROVIDER.
              </div>
            ) : (
              providerDisputes.map((d) => (
                <div key={d.dispute_id} className="p-4 flex justify-between items-center text-xs font-mono">
                  <div className="min-w-0 flex-1 pr-4">
                    <span className="font-bold text-[#06b6d4]">#{d.dispute_id.slice(0, 8)}</span>
                    <p className="text-[10px] text-[#737373] mt-1 truncate">
                      {d.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-bold uppercase ${
                      d.status === "open" ? "text-[#06b6d4]" :
                      d.status === "under_review" ? "text-amber-500" :
                      "text-green-500"
                    }`}>
                      {d.status.replace("_", " ")}
                    </span>
                    <button
                      onClick={() => onNavigate("dispute-detail", { id: d.dispute_id })}
                      className="border border-[#1a1a1a] hover:border-[#06b6d4] text-white hover:text-[#06b6d4] px-3 py-1 text-[10px] font-bold uppercase bg-transparent cursor-pointer transition-colors"
                    >
                      VIEW
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}