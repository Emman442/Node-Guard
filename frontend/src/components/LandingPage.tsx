import React from "react";
import { Shield, ArrowRight, Activity, Coins, FileText, Cpu, AlertTriangle } from "lucide-react";
import { Provider, NetworkStats, Agreement } from "../lib/contract/types";

interface LandingPageProps {
  stats: NetworkStats | undefined;
  featuredProviders: Provider[];
  agreements: Agreement[]; // 1. Added to Props Interface
  onNavigate: (view: string, params?: any) => void;
  onConnectWallet: () => void;
  isWalletConnected: boolean;
}

export default function LandingPage({
  stats,
  featuredProviders = [],
  agreements = [], // Default to empty array to prevent map/filter crashes
  onNavigate,
  onConnectWallet,
  isWalletConnected
}: LandingPageProps) {
  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-8 max-w-4xl space-y-6">
        <div className="text-[#06b6d4] font-mono text-sm tracking-widest uppercase">
          &gt; DECENTRALIZED SLA ARBITRATION — POWERED BY GENLAYER
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-heading text-white tracking-tight leading-[1.05]">
          Infrastructure SLAs<br />
          <span className="text-white">With Real Consequences.</span>
        </h1>
        <p className="text-lg text-[#737373] font-sans max-w-2xl leading-relaxed">
          Providers stake GEN collateral to guarantee uptime, latency, and data freshness.
          When they breach, AI validators fetch live telemetry and slash their stake automatically.
          No lawyers. No disputes that go nowhere. Just enforcement.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              if (isWalletConnected) {
                onNavigate("register-provider");
              } else {
                onConnectWallet();
              }
            }}
            id="hero-stake-btn"
            className="bg-[#06b6d4] text-black px-8 py-4 font-heading font-bold text-sm tracking-wider uppercase hover:bg-[#67e8f9] transition-all duration-100 cursor-pointer active:scale-[0.98]"
          >
            STAKE & REGISTER
          </button>
          <button
            onClick={() => onNavigate("providers")}
            id="hero-browse-btn"
            className="border border-[#06b6d4] text-[#06b6d4] bg-transparent px-8 py-4 font-heading font-bold text-sm tracking-wider uppercase hover:bg-[#06b6d4]/10 transition-all duration-100 cursor-pointer active:scale-[0.98]"
          >
            BROWSE PROVIDERS
          </button>
        </div>
        <div className="text-xs text-[#3d3d3d] font-mono">
          Minimum stake: 5,000 GEN. Slashing is automatic on breach confirmation.
        </div>
      </section>

      <hr className="border-[#1a1a1a]" />

      {/* Network Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div id="stat-providers" className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-2">
          <div className="text-xs font-mono text-[#737373] uppercase tracking-wider">REGISTERED PROVIDERS</div>
          <div className="text-3xl font-bold font-mono text-[#06b6d4]">
            {stats ? stats.registeredProviders : "0"}
          </div>
        </div>
        <div id="stat-agreements" className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-2">
          <div className="text-xs font-mono text-[#737373] uppercase tracking-wider">ACTIVE AGREEMENTS</div>
          <div className="text-3xl font-bold font-mono text-[#06b6d4]">
            {stats ? stats.activeAgreements : "0"}
          </div>
        </div>
        <div id="stat-disputes" className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-2">
          <div className="text-xs font-mono text-[#737373] uppercase tracking-wider">DISPUTES RESOLVED</div>
          <div className="text-3xl font-bold font-mono text-[#06b6d4]">
            {stats ? stats.resolvedDisputes : "0"}
          </div>
        </div>
        <div id="stat-slashed" className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-2">
          <div className="text-xs font-mono text-[#737373] uppercase tracking-wider">TOTAL SLASHED</div>
          <div className="text-3xl font-bold font-mono text-[#06b6d4]">
            {stats ? stats.activeDisputes.toLocaleString() : "0"} 
          </div>
        </div>
      </section>

      <hr className="border-[#1a1a1a]" />

      {/* How It Works Section */}
      <section className="space-y-12">
        <div className="space-y-2">
          <div className="text-[#06b6d4] font-mono text-xs uppercase tracking-widest">&gt; PROTOCOL ARCHITECTURE</div>
          <h2 className="text-3xl font-heading font-bold text-white uppercase tracking-tight">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="font-mono text-3xl text-[#06b6d4] font-bold">01</div>
            <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wide">PROVIDERS STAKE</h3>
            <p className="text-sm text-[#737373] font-sans leading-relaxed">
              Infrastructure providers lock GEN collateral as a performance guarantee. Higher stake signals stronger commitment to uptime commitments.
            </p>
          </div>
          <div className="space-y-4">
            <div className="font-mono text-3xl text-[#06b6d4] font-bold">02</div>
            <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wide">SLA IS REGISTERED</h3>
            <p className="text-sm text-[#737373] font-sans leading-relaxed">
              Clients and providers agree on plain English SLA terms—uptime percentage, max latency, error rate thresholds, and approved telemetry monitoring sources.
            </p>
          </div>
          <div className="space-y-4">
            <div className="font-mono text-3xl text-[#06b6d4] font-bold">03</div>
            <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wide">BREACH DETECTED</h3>
            <p className="text-sm text-[#737373] font-sans leading-relaxed">
              Client files a dispute with incident details and evidence. AI validators fetch telemetry from approved monitoring sources and parse actual performance metrics.
            </p>
          </div>
          <div className="space-y-4">
            <div className="font-mono text-3xl text-[#06b6d4] font-bold">04</div>
            <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wide">AUTOMATIC ENFORCEMENT</h3>
            <p className="text-sm text-[#737373] font-sans leading-relaxed">
              If breach is confirmed by AI consensus, the provider's stake is slashed and sent directly to the client. Verdict and all data stored permanently on-chain.
            </p>
          </div>
        </div>
      </section>

      <hr className="border-[#1a1a1a]" />

      {/* Featured Providers Section */}
      <section className="space-y-12">
        <div className="flex justify-between items-end border-b border-[#1a1a1a] pb-4">
          <div className="space-y-2">
            <div className="text-[#06b6d4] font-mono text-xs uppercase tracking-widest">&gt; TOP COMMITTED GUARANTORS</div>
            <h2 className="text-3xl font-heading font-bold text-white uppercase tracking-tight">Registered Providers</h2>
          </div>
          <button
            onClick={() => onNavigate("providers")}
            className="text-[#06b6d4] hover:text-[#67e8f9] font-heading font-bold text-sm tracking-wider uppercase flex items-center gap-2 cursor-pointer transition-all duration-100"
          >
            VIEW ALL <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProviders.slice(0, 4).map((p) => {
            // 2. Compute dynamic service types INSIDE the loop map so `p` is defined
            const providerAgreements = agreements.filter(
              (a) => a.provider.toLowerCase() === p.wallet.toLowerCase()
            );
            
            const serviceTypes = Array.from(
              new Set(providerAgreements.map((a) => a.service_type))
            );
            
            const primaryService = serviceTypes[0] 
              ? serviceTypes[0].replace("_", " ") 
              : "Infrastructure";

            return (
              <div
                key={p.wallet}
                id={`featured-provider-${p.wallet.slice(0, 6)}`}
                onClick={() => onNavigate("provider-profile", { wallet: p.wallet })}
                className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6 hover:border-[#262626] cursor-pointer transition-all duration-150 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#22c55e] pulse-dot"></span>
                      <h3 className="text-white font-heading font-bold text-lg group-hover:text-[#06b6d4] transition-colors duration-100 uppercase truncate max-w-[130px]">
                        {p.name}
                      </h3>
                    </div>
                    {/* Rendered derived category badge */}
                    <span className="text-[10px] bg-[#131313] text-[#06b6d4] border border-[#1a1a1a] px-2 py-0.5 font-mono uppercase">
                      {primaryService}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-[#737373] truncate">
                    {p.wallet.slice(0, 6)}...{p.wallet.slice(-4)}
                  </div>
                  <p className="text-xs text-[#737373] font-sans line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#131313]">
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-[#3d3d3d] uppercase tracking-wider">STAKED COLLATERAL</div>
                    <div className="text-xl font-bold font-mono text-[#06b6d4]">
                      {p.staked_gen.toLocaleString()} GEN
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-[#737373]">
                      <span>REPUTATION</span>
                      <span className="text-[#06b6d4]">{p.reputation_score}/100</span>
                    </div>
                    <div className="w-full bg-[#131313] h-1.5 border border-[#1a1a1a]">
                      <div
                        className="bg-[#06b6d4] h-full"
                        style={{ width: `${p.reputation_score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}