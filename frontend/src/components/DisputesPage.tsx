import React, { useState } from "react";
import { Search } from "lucide-react";
import { Dispute, Agreement, ArbitrationVerdict } from "../lib/contract/types";

interface DisputesPageProps {
  disputes: Dispute[];
  agreements: Agreement[];
  verdicts?: ArbitrationVerdict[]; // Added to match and render verdict specifics
  onNavigate: (view: string, params?: any) => void;
}

export default function DisputesPage({
  disputes = [],
  agreements = [],
  verdicts = [],
  onNavigate
}: DisputesPageProps) {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filters = ["ALL", "OPEN", "UNDER REVIEW", "VERDICT RENDERED", "RESOLVED"];

  // Fetch Service Name securely
  const getAgreementName = (agreementId: string) => {
    const ag = agreements.find((a) => a.agreement_id === agreementId);
    return ag ? ag.service_name : `Agreement #${agreementId}`;
  };

  // Associate verdict if existing
  const getVerdictForDispute = (disputeId: string) => {
    return verdicts.find((v) => v.dispute_id === disputeId);
  };

  // Filter logic mapped to snake_case properties
  const filtered = disputes.filter((d) => {
    const statusUpper = d.status.toUpperCase();
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "OPEN" && statusUpper === "OPEN") ||
      (activeFilter === "UNDER REVIEW" && statusUpper === "UNDER_REVIEW") ||
      (activeFilter === "VERDICT RENDERED" && statusUpper === "VERDICT_RENDERED") ||
      (activeFilter === "RESOLVED" && statusUpper === "RESOLVED");

    const matchesQuery =
      d.dispute_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.agreement_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.respondent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.claimant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1a1a1a] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight uppercase">
            ARBITRATION RECORD
          </h1>
          <p className="text-sm text-[#737373]">
            Historical and active SLA breach disputes arbitrated by GenLayer AI validator consensus nodes.
          </p>
        </div>
      </div>

      {/* Control and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-[#090909] border border-[#1a1a1a] p-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 font-mono text-xs border uppercase tracking-wider transition-all duration-100 cursor-pointer ${
                activeFilter === filter
                  ? "bg-[#06b6d4] text-black border-[#06b6d4]"
                  : "bg-transparent text-[#737373] border-[#1a1a1a] hover:border-[#262626] hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#3d3d3d] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search disputes, wallets, details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#0e0e0e] text-white border border-[#1a1a1a] pl-9 pr-4 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full lg:w-80"
          />
        </div>
      </div>

      {/* Table / List Area */}
      {filtered.length === 0 ? (
        <div className="bg-[#0e0e0e] border border-[#1a1a1a] py-16 text-center space-y-4">
          <div className="text-sm font-mono text-[#3d3d3d]">&gt; NO DISPUTES IN THIS RECORD</div>
          <p className="text-xs text-[#737373] max-w-sm mx-auto">
            There are no SLA arbitration disputes corresponding to your selected filter or query.
          </p>
        </div>
      ) : (
        <div className="bg-[#0e0e0e] border border-[#1a1a1a]">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-[#737373] bg-[#090909]">
                  <th className="p-4 uppercase">ID</th>
                  <th className="p-4 uppercase">AGREEMENT / SERVICE</th>
                  <th className="p-4 uppercase">CLAIMANT</th>
                  <th className="p-4 uppercase">PROVIDER</th>
                  <th className="p-4 uppercase">STATUS</th>
                  <th className="p-4 uppercase">VERDICT STATUS</th>
                  <th className="p-4 uppercase">SLASH AMOUNT</th>
                  <th className="p-4 uppercase">DATE FILED</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const matchingVerdict = getVerdictForDispute(d.dispute_id);
                  return (
                    <tr
                      key={d.dispute_id}
                      onClick={() => onNavigate("dispute-detail", { id: d.dispute_id })}
                      className="border-b border-[#131313] hover:bg-[#131313]/20 cursor-pointer transition-colors duration-100"
                    >
                      <td className="p-4 font-bold text-[#06b6d4]">
                        #{d.dispute_id.slice(0, 8)}...
                      </td>
                      <td className="p-4">
                        <div className="text-white font-heading font-bold text-sm tracking-wide uppercase truncate max-w-[180px]">
                          {getAgreementName(d.agreement_id)}
                        </div>
                        <div className="text-[9px] text-[#737373] mt-0.5">SLA ID: {d.agreement_id.slice(0, 8)}...</div>
                      </td>
                      <td className="p-4 text-[#737373]">
                        {d.claimant.slice(0, 6)}...{d.claimant.slice(-4)}
                      </td>
                      <td className="p-4 text-[#737373]">
                        {d.respondent.slice(0, 6)}...{d.respondent.slice(-4)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 border text-[10px] font-bold uppercase ${
                          d.status === "open" ? "text-[#06b6d4] border-[#06b6d4]/30 bg-transparent" :
                          d.status === "under_review" ? "text-[#f59e0b] border-[#f59e0b]/30 bg-transparent" :
                          d.status === "appealed" ? "text-purple-400 border-purple-400/30 bg-transparent" :
                          "text-[#22c55e] border-[#22c55e]/30 bg-transparent"
                        }`}>
                          {d.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        {matchingVerdict ? (
                          <span className={`font-bold uppercase text-[10px] ${
                            matchingVerdict.verdict === "breach_confirmed" ? "text-[#dc2626]" :
                            matchingVerdict.verdict === "partial_breach" ? "text-[#f59e0b]" :
                            matchingVerdict.verdict === "no_breach" ? "text-[#22c55e]" :
                            "text-[#6b7280]"
                          }`}>
                            {matchingVerdict.verdict.replace("_", " ")}
                          </span>
                        ) : (
                          <span className="text-[#3d3d3d] uppercase text-[10px]">
                            {d.status === "resolved" || d.status === "verdict_rendered" ? "DECIDED" : "EVALUATING"}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-red-500 font-bold font-mono">
                        {d.slash_executed && d.slashed_amount > 0 ? (
                          <span>-{d.slashed_amount.toLocaleString()} GEN</span>
                        ) : (
                          <span className="text-[#3d3d3d]">-</span>
                        )}
                      </td>
                      <td className="p-4 text-[#737373]">
                        {new Date(d.filed_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-List View */}
          <div className="block md:hidden divide-y divide-[#131313]">
            {filtered.map((d) => {
              const matchingVerdict = getVerdictForDispute(d.dispute_id);
              return (
                <div
                  key={d.dispute_id}
                  onClick={() => onNavigate("dispute-detail", { id: d.dispute_id })}
                  className="p-4 space-y-4 hover:bg-[#131313]/10 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] text-[#06b6d4] font-bold">#{d.dispute_id.slice(0, 8)}</span>
                      <h3 className="text-white font-heading font-bold uppercase text-sm mt-0.5">
                        {getAgreementName(d.agreement_id)}
                      </h3>
                    </div>
                    <span className={`inline-block px-2 py-0.5 border text-[10px] font-bold uppercase ${
                      d.status === "open" ? "text-[#06b6d4] border-[#06b6d4]/30" :
                      d.status === "under_review" ? "text-[#f59e0b] border-[#f59e0b]/30" :
                      "text-[#22c55e] border-[#22c55e]/30"
                    }`}>
                      {d.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#737373]">
                    <div>CLAIMANT: <span className="text-white">{d.claimant.slice(0, 6)}...{d.claimant.slice(-4)}</span></div>
                    <div>PROVIDER: <span className="text-white">{d.respondent.slice(0, 6)}...{d.respondent.slice(-4)}</span></div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#131313]">
                    <div className="text-[10px] font-mono text-[#737373]">
                      FILED: {new Date(d.filed_at).toLocaleDateString()}
                    </div>
                    <div className="font-mono text-xs font-bold text-right">
                      {matchingVerdict ? (
                        <span className={
                          matchingVerdict.verdict === "breach_confirmed" ? "text-[#dc2626]" :
                          matchingVerdict.verdict === "partial_breach" ? "text-[#f59e0b]" : "text-[#22c55e]"
                        }>
                          {matchingVerdict.verdict.replace("_", " ").toUpperCase()}
                          {d.slash_executed && d.slashed_amount > 0 && ` (-${d.slashed_amount} GEN)`}
                        </span>
                      ) : (
                        <span className="text-[#3d3d3d] uppercase">EVALUATING</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}