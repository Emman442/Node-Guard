import React, { useState } from "react";
import { FileText, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { Provider, Agreement, Dispute } from "../lib/contract/types";

interface DashboardPageProps {
  connectedWallet: string;
  providerProfile: Provider | undefined;
  clientAgreements: Agreement[];
  providerAgreements: Agreement[];
  clientDisputes: Dispute[];
  providerDisputes: Dispute[];
  onNavigate: (view: string, params?: any) => void;
  onAddStake: (amount: number) => void;
  onRefresh: () => void;
}

export default function DashboardPage({
  connectedWallet,
  providerProfile,
  clientAgreements,
  providerAgreements,
  clientDisputes,
  providerDisputes,
  onNavigate,
  onAddStake,
  onRefresh
}: DashboardPageProps) {
  const [activeRoleTab, setActiveRoleTab] = useState<"client" | "provider">(
    providerProfile ? "provider" : "client"
  );
  const [stakeAmountInput, setStakeAmountInput] = useState<string>("");
  const [isSubmittingStake, setIsSubmittingStake] = useState(false);

  const handleAddStakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeAmountInput || isNaN(Number(stakeAmountInput)) || Number(stakeAmountInput) <= 0) return;
    setIsSubmittingStake(true);
    try {
      await onAddStake(Number(stakeAmountInput));
      setStakeAmountInput("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingStake(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return "text-[#06b6d4] border-[#06b6d4]/30";
      case "disputed":
      case "open":
      case "under_review":
        return "text-[#f59e0b] border-[#f59e0b]/30";
      case "terminated":
      case "expired":
        return "text-[#737373] border-[#737373]/30";
      case "suspended":
        return "text-[#dc2626] border-[#dc2626]/30";
      case "resolved":
      case "verdict_rendered":
      case "appealed":
        return "text-[#22c55e] border-[#22c55e]/30";
      default:
        return "text-[#737373] border-[#1a1a1a]";
    }
  };

  const formatStatus = (status: string) => (status || "").replaceAll("_", " ");

  const shortAddr = (addr?: string) => {
    if (!addr) return "—";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
  };

  const wonDisputes = clientDisputes.filter(
    (d) => d.slash_executed || Number(d.slashed_amount) > 0
  ).length;

  const lifetimeSlashed = providerDisputes.reduce(
    (sum, d) => sum + Number(d.slashed_amount || 0),
    0
  );

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1a1a1a] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight uppercase">
            OPERATIONAL DASHBOARD
          </h1>
          <p className="text-sm text-[#737373] font-mono">
            CONNECTED WALLET: <span className="text-white">{connectedWallet}</span>
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="border border-[#1a1a1a] hover:border-[#06b6d4] hover:text-[#06b6d4] text-[#737373] px-4 py-2 font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> REFETCH DATA
        </button>
      </div>

      <div className="flex border-b border-[#1a1a1a] gap-2">
        <button
          onClick={() => setActiveRoleTab("client")}
          className={`px-6 py-3 font-heading font-bold text-sm tracking-wider uppercase border-b-2 cursor-pointer transition-all duration-100 ${
            activeRoleTab === "client"
              ? "text-[#06b6d4] border-[#06b6d4] bg-[#0e0e0e]/30"
              : "text-[#737373] border-transparent hover:text-white"
          }`}
        >
          CLIENT OPERATIONS ({clientAgreements.length})
        </button>
        <button
          onClick={() => setActiveRoleTab("provider")}
          className={`px-6 py-3 font-heading font-bold text-sm tracking-wider uppercase border-b-2 cursor-pointer transition-all duration-100 ${
            activeRoleTab === "provider"
              ? "text-[#06b6d4] border-[#06b6d4] bg-[#0e0e0e]/30"
              : "text-[#737373] border-transparent hover:text-white"
          }`}
        >
          PROVIDER OPERATIONS {providerProfile ? `(STAKED)` : `(UNREGISTERED)`}
        </button>
      </div>

      {activeRoleTab === "client" ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-3">
              <div className="flex justify-between items-center text-[#737373]">
                <span className="text-xs font-mono uppercase tracking-wider">ACTIVE CONTRACTS</span>
                <FileText className="w-4 h-4 text-[#06b6d4]" />
              </div>
              <div className="text-3xl font-mono font-bold text-white">
                {clientAgreements.filter((a) => a.status === "active").length}
              </div>
              <div className="text-[10px] text-[#3d3d3d] font-mono uppercase">
                GUARANTEEING INFRA SLA SERVICES
              </div>
            </div>

            <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-3">
              <div className="flex justify-between items-center text-[#737373]">
                <span className="text-xs font-mono uppercase tracking-wider">DISPUTES FILED</span>
                <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <div className="text-3xl font-mono font-bold text-white">
                {clientDisputes.length}
              </div>
              <div className="text-[10px] text-[#3d3d3d] font-mono uppercase">
                CLAIMS OF BREACH SUBMITTED TO GENLAYER
              </div>
            </div>

            <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-3">
              <div className="flex justify-between items-center text-[#737373]">
                <span className="text-xs font-mono uppercase tracking-wider">CLAIMS WON / REIMBURSED</span>
                <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
              </div>
              <div className="text-3xl font-mono font-bold text-[#22c55e]">
                {wonDisputes}
              </div>
              <div className="text-[10px] text-[#3d3d3d] font-mono uppercase">
                AUTOMATIC SLASH TRANSFERS COMPLETED
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading font-bold uppercase tracking-tight text-white flex items-center gap-2">
              &gt; CLIENT SERVICE AGREEMENTS
            </h2>
            <div className="bg-[#0e0e0e] border border-[#1a1a1a] overflow-x-auto">
              {clientAgreements.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#737373] font-mono">
                  YOU HAVE NO ACTIVE INFRASTRUCTURE SLA AGREEMENTS.
                  <button
                    onClick={() => onNavigate("providers")}
                    className="text-[#06b6d4] hover:underline ml-2 uppercase font-bold cursor-pointer"
                  >
                    FIND PROVIDERS TO COORDINATE CONTRACT &gt;
                  </button>
                </div>
              ) : (
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] text-[#737373] bg-[#090909]">
                      <th className="p-4 uppercase">SERVICE / ID</th>
                      <th className="p-4 uppercase">PROVIDER</th>
                      <th className="p-4 uppercase">SLA METRIC REQUIRED</th>
                      <th className="p-4 uppercase">MONTHLY FEE</th>
                      <th className="p-4 uppercase">STATUS</th>
                      <th className="p-4 uppercase text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientAgreements.map((a) => (
                      <tr key={a.agreement_id} className="border-b border-[#131313] hover:bg-[#131313]/20">
                        <td className="p-4">
                          <div className="font-heading text-sm font-bold text-white uppercase">{a.service_name}</div>
                          <div className="text-[10px] text-[#737373] mt-0.5">
                            {a.agreement_id} • {a.service_type}
                          </div>
                        </td>
                        <td className="p-4 text-[#737373]">{shortAddr(a.provider)}</td>
                        <td className="p-4">
                          Uptime &gt;= {a.sla_terms?.uptime_percentage}% • Max Latency &lt;= {a.sla_terms?.max_latency_ms}ms
                        </td>
                        <td className="p-4 text-[#06b6d4] font-bold">
                          {a.monthly_fee_gen} GEN
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-0.5 border text-[10px] font-bold uppercase ${getStatusColor(a.status)}`}>
                            {formatStatus(a.status)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => onNavigate("agreement-detail", { id: a.agreement_id })}
                            className="border border-[#1a1a1a] hover:border-[#06b6d4] hover:text-[#06b6d4] text-white px-3 py-1.5 uppercase font-bold text-[10px] cursor-pointer"
                          >
                            MANAGE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading font-bold uppercase tracking-tight text-white">
              &gt; SLA DISPUTES RECORD
            </h2>
            <div className="bg-[#0e0e0e] border border-[#1a1a1a] overflow-x-auto">
              {clientDisputes.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#737373] font-mono">
                  NO ACTIVE SLA DISPUTES REPORTED BY THIS WALLET.
                </div>
              ) : (
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] text-[#737373] bg-[#090909]">
                      <th className="p-4 uppercase">DISPUTE ID</th>
                      <th className="p-4 uppercase">AGREEMENT</th>
                      <th className="p-4 uppercase">STATUS</th>
                      <th className="p-4 uppercase">SLASH</th>
                      <th className="p-4 uppercase text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientDisputes.map((d) => (
                      <tr key={d.dispute_id} className="border-b border-[#131313] hover:bg-[#131313]/20">
                        <td className="p-4 font-bold text-[#06b6d4]">#{d.dispute_id}</td>
                        <td className="p-4">
                          <span className="text-white">Agreement #{d.agreement_id}</span>
                          <div className="text-[10px] text-[#737373] mt-0.5">
                            Filed: {formatDate(d.filed_at)}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 border text-[10px] uppercase font-bold ${getStatusColor(d.status)}`}>
                            {formatStatus(d.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          {Number(d.slashed_amount) > 0 ? (
                            <span className="text-red-500 font-bold font-mono">+{d.slashed_amount} GEN</span>
                          ) : (
                            <span className="text-[#3d3d3d]">-</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => onNavigate("dispute-detail", { id: d.dispute_id })}
                            className="border border-[#1a1a1a] hover:border-[#06b6d4] hover:text-[#06b6d4] text-white px-3 py-1.5 uppercase font-bold text-[10px] cursor-pointer"
                          >
                            VIEW DETAILS
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {!providerProfile ? (
            <div className="bg-[#0e0e0e] border border-[#dc2626]/30 p-8 text-center space-y-6 max-w-2xl mx-auto">
              <div className="text-red-500 font-mono text-sm uppercase">&gt; PROVIDER COLLATERAL INSUFFICIENT / NOT REGISTERED</div>
              <p className="text-xs text-[#737373] max-w-md mx-auto">
                This wallet is not currently registered as an active infrastructure provider. Lock collateral in GEN to guarantee services and start generating monthly fee cashflows.
              </p>
              <button
                onClick={() => onNavigate("register-provider")}
                className="bg-[#06b6d4] text-black px-6 py-3 font-heading font-bold text-xs tracking-wider uppercase hover:bg-[#67e8f9] transition-colors cursor-pointer"
              >
                STAKE & REGISTER PROVIDER NODE
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-[#0e0e0e] border border-[#06b6d4] p-6 space-y-3">
                  <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">TOTAL STAKED COLLATERAL</div>
                  <div className="text-3xl font-mono font-bold text-[#06b6d4]">
                    {Number(providerProfile.staked_gen).toLocaleString()} GEN
                  </div>
                  <div className="text-[10px] text-[#3d3d3d] font-mono uppercase">
                    ACTIVE Performance Escrow
                  </div>
                </div>

                <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-3">
                  <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">REPUTATION SCORE</div>
                  <div className="text-3xl font-mono font-bold text-white">
                    {providerProfile.reputation_score}/100
                  </div>
                  <div className="w-full bg-[#131313] h-1 border border-[#1a1a1a]">
                    <div
                      className="bg-[#06b6d4] h-full"
                      style={{ width: `${Math.min(100, Number(providerProfile.reputation_score) || 0)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-3">
                  <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">ACTIVE CONTRACTS</div>
                  <div className="text-3xl font-mono font-bold text-white">
                    {providerProfile.active_agreements}
                  </div>
                  <div className="text-[10px] text-[#3d3d3d] font-mono uppercase">
                    RECEIVING SUBSCRIPTIONS
                  </div>
                </div>

                <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-3">
                  <div className="text-[10px] font-mono text-red-500 uppercase tracking-wider">LIFETIME SLASHED</div>
                  <div className="text-3xl font-mono font-bold text-red-500">
                    {Number(providerProfile.total_slashed_gen ?? lifetimeSlashed).toLocaleString()} GEN
                  </div>
                  <div className="text-[10px] text-red-500/50 font-mono uppercase">
                    PENALTY FROM VERDICTS
                  </div>
                </div>
              </div>

              <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-heading font-bold uppercase text-white">
                    &gt; MANAGE COLLATERAL STAKE
                  </h3>
                  <p className="text-xs text-[#737373]">
                    Add additional GEN collateral to back larger SLAs and increase reputation weight.
                  </p>
                </div>
                <form onSubmit={handleAddStakeSubmit} className="flex flex-col sm:flex-row gap-4 items-end max-w-md">
                  <div className="space-y-1.5 flex-1 w-full">
                    <label className="text-[10px] font-mono text-[#737373] uppercase block">STAKE AMOUNT (GEN)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={stakeAmountInput}
                      onChange={(e) => setStakeAmountInput(e.target.value)}
                      className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingStake}
                    className="bg-[#06b6d4] text-black px-6 py-2.5 font-heading text-xs font-bold uppercase tracking-wider hover:bg-[#67e8f9] transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    {isSubmittingStake ? "STAKING..." : "ADD STAKE"}
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-heading font-bold uppercase tracking-tight text-white">
                  &gt; ACTIVE PROVIDER COMMITMENTS
                </h2>
                <div className="bg-[#0e0e0e] border border-[#1a1a1a] overflow-x-auto">
                  {providerAgreements.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#737373] font-mono">
                      YOUR INFRA NODE HAS NO SLA COMMITMENTS ACTIVE.
                    </div>
                  ) : (
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-[#1a1a1a] text-[#737373] bg-[#090909]">
                          <th className="p-4 uppercase">CLIENT CONTRACT</th>
                          <th className="p-4 uppercase">CLIENT ADDRESS</th>
                          <th className="p-4 uppercase">SLA PARAMETERS</th>
                          <th className="p-4 uppercase">MONTHLY REVENUE</th>
                          <th className="p-4 uppercase">STATUS</th>
                          <th className="p-4 uppercase text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {providerAgreements.map((a) => (
                          <tr key={a.agreement_id} className="border-b border-[#131313] hover:bg-[#131313]/20">
                            <td className="p-4">
                              <div className="font-heading text-sm font-bold text-white uppercase">{a.service_name}</div>
                              <div className="text-[10px] text-[#737373] mt-0.5">
                                {a.agreement_id} • {a.service_type}
                              </div>
                            </td>
                            <td className="p-4 text-[#737373]">{shortAddr(a.client)}</td>
                            <td className="p-4">
                              Uptime &gt;= {a.sla_terms?.uptime_percentage}% • Latency &lt;= {a.sla_terms?.max_latency_ms}ms
                            </td>
                            <td className="p-4 text-[#06b6d4] font-bold">
                              {a.monthly_fee_gen} GEN
                            </td>
                            <td className="p-4">
                              <span className={`inline-block px-2.5 py-0.5 border text-[10px] font-bold uppercase ${getStatusColor(a.status)}`}>
                                {formatStatus(a.status)}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => onNavigate("agreement-detail", { id: a.agreement_id })}
                                className="border border-[#1a1a1a] hover:border-[#06b6d4] hover:text-[#06b6d4] text-white px-3 py-1.5 uppercase font-bold text-[10px] cursor-pointer"
                              >
                                MONITOR
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-heading font-bold uppercase tracking-tight text-white">
                  &gt; DISPUTE CLAIMS RESPONDENT RECORD
                </h2>
                <div className="bg-[#0e0e0e] border border-[#1a1a1a] overflow-x-auto">
                  {providerDisputes.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#737373] font-mono">
                      NO DISPUTES REPORTED AGAINST YOUR INFRASTRUCTURE ENDPOINTS.
                    </div>
                  ) : (
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-[#1a1a1a] text-[#737373] bg-[#090909]">
                          <th className="p-4 uppercase">DISPUTE ID</th>
                          <th className="p-4 uppercase">CLIENT</th>
                          <th className="p-4 uppercase">SLA METRIC FAILURE ALLEGATION</th>
                          <th className="p-4 uppercase">STATUS</th>
                          <th className="p-4 uppercase">SLASH</th>
                          <th className="p-4 uppercase text-right">DEFEND</th>
                        </tr>
                      </thead>
                      <tbody>
                        {providerDisputes.map((d) => (
                          <tr key={d.dispute_id} className="border-b border-[#131313] hover:bg-[#131313]/20">
                            <td className="p-4 font-bold text-[#06b6d4]">#{d.dispute_id}</td>
                            <td className="p-4 text-[#737373]">{shortAddr(d.claimant)}</td>
                            <td className="p-4 text-xs">
                              <div className="line-clamp-1">{d.description}</div>
                              <div className="text-[10px] text-[#737373] mt-0.5">
                                Filed: {formatDate(d.filed_at)}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-block px-2 py-0.5 border text-[10px] uppercase font-bold ${getStatusColor(d.status)}`}>
                                {formatStatus(d.status)}
                              </span>
                            </td>
                            <td className="p-4">
                              {Number(d.slashed_amount) > 0 ? (
                                <span className="text-red-500 text-[10px] font-bold">-{d.slashed_amount} GEN</span>
                              ) : (
                                <span className="text-[#3d3d3d] uppercase">PENDING</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => onNavigate("dispute-detail", { id: d.dispute_id })}
                                className="border border-[#1a1a1a] hover:border-[#06b6d4] hover:text-[#06b6d4] text-white px-3 py-1.5 uppercase font-bold text-[10px] cursor-pointer"
                              >
                                DEFEND
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}