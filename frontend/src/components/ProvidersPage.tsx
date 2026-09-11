import React, { useState } from "react";
import { Search, Globe, Copy } from "lucide-react";
import { Provider, Agreement, Dispute } from "../lib/contract/types";

interface ProvidersPageProps {
  providers: Provider[];
  agreements?: Agreement[];
  disputes?: Dispute[];
  onNavigate: (view: string, params?: any) => void;
  onCopyText: (text: string, label: string) => void;
  // triggerToast: (title: string, desc: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export default function ProvidersPage({
  providers = [],
  agreements = [],
  disputes = [],
  onNavigate,
  onCopyText,
  // triggerToast
}: ProvidersPageProps) {
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("HIGHEST STAKE");
  const [searchQuery, setSearchQuery] = useState<string>("");


  const serviceTypes = ["ALL", "RPC NODE", "GPU CLUSTER", "INDEXER", "API", "OTHER"];

  const getProviderServices = (providerWallet: string): string[] => {
    const providerAgreements = agreements.filter(
      (a) => a.provider.toLowerCase() === providerWallet.toLowerCase()
    );
    const uniqueTypes = Array.from(new Set(providerAgreements.map((a) => a.service_type)));
    return uniqueTypes.length > 0 ? uniqueTypes : ["other"];
  };

  const getProviderDisputesCount = (providerWallet: string): number => {
    return disputes.filter((d) => d.respondent.toLowerCase() === providerWallet.toLowerCase()).length;
  };

  const filtered = providers.filter((p) => {
    const pServices = getProviderServices(p.wallet);
    const matchesType =
      selectedType === "ALL" ||
      pServices.some((t) => t.replace("_", " ").toUpperCase() === selectedType);

    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.wallet.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesQuery;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "HIGHEST STAKE") {
      return b.staked_gen - a.staked_gen;
    } else if (sortBy === "BEST REPUTATION") {
      return b.reputation_score - a.reputation_score;
    } else if (sortBy === "MOST AGREEMENTS") {
      return b.active_agreements - a.active_agreements;
    }
    return 0;
  });



  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1a1a1a] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight uppercase">
            INFRASTRUCTURE PROVIDERS
          </h1>
          <p className="text-sm text-[#737373]">
            Staked providers with registered SLA guarantees. Click view profile to coordinate contracts.
          </p>
        </div>
        <button
          onClick={() => onNavigate("register-provider")}
          className="bg-[#06b6d4] text-black px-6 py-3 font-heading font-bold text-sm tracking-wider uppercase hover:bg-[#67e8f9] transition-colors duration-100 cursor-pointer active:scale-[0.98] border-none"
        >
          REGISTER AS PROVIDER
        </button>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-[#090909] border border-[#1a1a1a] p-4">
        <div className="flex flex-wrap gap-2">
          {serviceTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 font-mono text-xs border uppercase tracking-wider transition-all duration-100 cursor-pointer ${
                selectedType === type
                  ? "bg-[#06b6d4] text-black border-[#06b6d4]"
                  : "bg-transparent text-[#737373] border-[#1a1a1a] hover:border-[#262626] hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#3d3d3d] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0e0e0e] text-white border border-[#1a1a1a] pl-9 pr-4 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full sm:w-64"
            />
          </div>

          <div className="flex items-center bg-[#0e0e0e] border border-[#1a1a1a] px-3 py-2 text-sm">
            <span className="text-xs text-[#3d3d3d] font-mono mr-2 uppercase">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white font-mono text-xs uppercase focus:outline-none cursor-pointer pr-4 border-none"
            >
              <option value="HIGHEST STAKE" className="bg-[#0e0e0e] text-white">HIGHEST STAKE</option>
              <option value="BEST REPUTATION" className="bg-[#0e0e0e] text-white">BEST REPUTATION</option>
              <option value="MOST AGREEMENTS" className="bg-[#0e0e0e] text-white">MOST AGREEMENTS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      {sorted.length === 0 ? (
        <div className="bg-[#0e0e0e] border border-[#1a1a1a] py-16 text-center space-y-4">
          <div className="text-sm font-mono text-[#3d3d3d]">&gt; NO PROVIDERS REGISTERED</div>
          <p className="text-xs text-[#737373] max-w-md mx-auto">
            Try adjusting your search filters or register as the first node provider to lock stake and receive agreement requests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((p) => {
            const providerServices = getProviderServices(p.wallet);
            const totalDisputes = getProviderDisputesCount(p.wallet);

            return (
              <div
                key={p.wallet}
                className="bg-[#0e0e0e] border border-[#1a1a1a] hover:border-[#262626] p-6 space-y-6 flex flex-col justify-between transition-all duration-100"
              >
                <div className="space-y-4">
                  {/* Name / Badges */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 bg-[#22c55e] pulse-dot rounded-full shrink-0"></span>
                      <h3 className="text-white font-heading font-bold text-lg uppercase truncate max-w-[140px] sm:max-w-[160px]">
                        {p.name}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
                      {providerServices.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] bg-[#131313] text-[#06b6d4] border border-[#1a1a1a] px-1.5 py-0.5 font-mono uppercase shrink-0"
                        >
                          {t.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Truncated Address */}
                  <div className="flex items-center justify-between bg-[#090909] border border-[#1a1a1a] px-2 py-1">
                    <span className="font-mono text-xs text-[#737373]">
                      {p.wallet.slice(0, 8)}...{p.wallet.slice(-8)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyText(p.wallet, "Address");
                      }}
                      className="text-[#3d3d3d] hover:text-[#06b6d4] cursor-pointer bg-transparent border-none p-0"
                      title="Copy address"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Website */}
                  {p.website && (
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#737373] hover:text-white flex items-center gap-1.5 font-mono decoration-none transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" /> {p.website.replace("https://", "").replace("http://", "")}
                    </a>
                  )}

                  {/* Description */}
                  <p className="text-xs text-[#737373] font-sans line-clamp-2 leading-relaxed h-10">
                    {p.description}
                  </p>
                </div>

                {/* Stake and reputation section */}
                <div className="space-y-4 pt-4 border-t border-[#131313]">
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-[#3d3d3d] uppercase tracking-wider">STAKED COLLATERAL</div>
                    <div className="text-2xl font-bold font-mono text-[#06b6d4]">
                      {p.staked_gen.toLocaleString()} GEN
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="text-[10px] font-mono text-[#737373] bg-[#090909] border border-[#1a1a1a] p-2 flex justify-between">
                    <span>AGREEMENTS: <b className="text-white font-bold">{p.active_agreements}</b></span>
                    <span>DISPUTES: <b className="text-white font-bold">{totalDisputes}</b></span>
                    <span>SLASHES: <b className="text-red-500 font-bold">{p.total_slashes}</b></span>
                  </div>

                  {/* Reputation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-[#737373]">
                      <span>REPUTATION</span>
                      <span className="text-[#06b6d4]">{p.reputation_score}/100</span>
                    </div>
                    <div className="w-full bg-[#131313] h-1.5 border border-[#1a1a1a]">
                      <div
                        className="bg-[#06b6d4] h-full transition-all duration-300"
                        style={{ width: `${p.reputation_score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* View button */}
                  <button
                    onClick={() => onNavigate("provider-profile", { wallet: p.wallet })}
                    className="w-full border border-[#1a1a1a] hover:border-[#06b6d4] hover:text-[#06b6d4] text-white py-2.5 font-heading text-xs font-bold uppercase tracking-wider transition-colors duration-100 cursor-pointer text-center bg-transparent"
                  >
                    VIEW PROFILE &gt;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}