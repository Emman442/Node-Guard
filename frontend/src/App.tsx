import React, { useState, useMemo } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient
} from "@tanstack/react-query";
import {
  Shield,
  AlertTriangle,
  Layers,
  Check,
  Database,
  Info
} from "lucide-react";

import { Provider, Agreement, Dispute, TelemetrySource, NetworkStats } from "./lib/contract/types";

// Import custom pages
import LandingPage from "./components/LandingPage.tsx";
import ProvidersPage from "./components/ProvidersPage.tsx";
import DashboardPage from "./components/DashboardPage.tsx";
import DisputesPage from "./components/DisputesPage.tsx";
import RegisterProviderPage from "./components/RegisterProviderPage.tsx";
import CreateAgreementPage from "./components/CreateAgreementPage.tsx";
import AgreementDetailPage from "./components/AgreementDetailPage.tsx";
import FileDisputePage from "./components/FileDisputePage.tsx";
import DisputeDetailPage from "./components/DisputeDetailPage.tsx";
import ProviderProfilePage from "./components/ProviderProfilePage.tsx";
import { useWallet } from "./lib/genlayer/wallet";
import { useFetchAllAgreements, useFetchAllDisputes, useFetchAllProviders, useFetchAllTelemetrySources } from "./lib/hooks/useNodeGuard.ts";

// Create central query client for the applet
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 15000, // 15 seconds auto polling contract state
      refetchOnWindowFocus: false,
    }
  }
});

interface Toast {
  id: string;
  title: string;
  desc: string;
  type: "info" | "success" | "error" | "warning";
}

function NodeGuardAppContent() {
  const { address: connectedWallet, connectWallet } = useWallet();
  const queryClientInstance = useQueryClient();

  // Navigation states
  const [currentView, setCurrentView] = useState<string>("landing");
  const [viewParams, setViewParams] = useState<any>({});

  // Contract Fetching with React Query Hooks
  const { data: agreements = [], isLoading: loadingAgreements } = useFetchAllAgreements();
  const { data: providers = [], isLoading: loadingProviders } = useFetchAllProviders();
  const { data: disputes = [], isLoading: loadingDisputes } = useFetchAllDisputes();

  const [toasts, setToasts] = useState<Toast[]>([]);

  const { data: telemetrySources = [] } = useFetchAllTelemetrySources();
  const [stats] = useState<NetworkStats>({
    activeAgreements: agreements.length,
    registeredProviders: providers.length,
    activeDisputes: disputes.filter(d => d.status === "open").length,
    resolvedDisputes: disputes.filter(d => d.status === "resolved").length,
  });

  const triggerToast = (
    title: string,
    desc: string,
    type: "info" | "success" | "error" | "warning" = "info"
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, desc, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast("Copied to Clipboard", `Copied ${label} successfully.`, "success");
  };

  // Navigation router helper
  const navigateTo = (view: string, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };



  const handleManualRefetch = () => {
    triggerToast("Syncing", "Manually pulling current contract state...", "info");
    queryClientInstance.invalidateQueries();
  };

  // Safe client-side filtering (handles undefined safely via defaults)
  const clientAgreements = agreements.filter(
    (a) => a.client.toLowerCase() === connectedWallet?.toLowerCase()
  );
  const providerAgreements = agreements.filter(
    (a) => a.provider.toLowerCase() === connectedWallet?.toLowerCase()
  );

  const clientDisputes = disputes.filter(
    (d) => d.claimant.toLowerCase() === connectedWallet?.toLowerCase()
  );
  const providerDisputes = disputes.filter(
    (d) => d.claimant.toLowerCase() === connectedWallet?.toLowerCase()
  );

  const connectedProviderProfile = providers.find(
    (p) => p.wallet.toLowerCase() === connectedWallet?.toLowerCase()
  );

  // Dynamic entity lookups safely handled with fallback objects
  const activeAgreementDetail = agreements.find((a) => a.agreement_id === viewParams.id);
  const activeDisputeDetail = disputes.find((d) => d.dispute_id === viewParams.id);
  const activeDisputeAgreement = activeDisputeDetail 
    ? agreements.find((a) => a.agreement_id === activeDisputeDetail.agreement_id)
    : undefined;

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between font-sans selection:bg-[#06b6d4]/30 selection:text-[#67e8f9]">
      
      {/* 1. TOP STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#000000] border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          
          {/* Logo */}
          <div
            onClick={() => navigateTo("landing")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <Shield className="w-5 h-5 text-[#06b6d4] transition-transform group-hover:scale-105" />
            <div>
              <span className="font-heading font-bold text-lg text-white tracking-tight">NODEGUARD</span>
              <span className="hidden sm:inline font-mono text-[9px] text-[#737373] bg-[#090909] border border-[#1a1a1a] ml-2 px-1.5 py-0.5 uppercase tracking-wider">
                SLA ARBITRATION
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 font-heading font-bold text-xs tracking-wider uppercase">
            <button
              onClick={() => navigateTo("providers")}
              className={`hover:text-[#06b6d4] cursor-pointer transition-colors ${
                currentView === "providers" || currentView === "provider-profile" ? "text-[#06b6d4]" : "text-[#737373]"
              }`}
            >
              PROVIDERS
            </button>
            <button
              onClick={() => navigateTo("disputes")}
              className={`hover:text-[#06b6d4] cursor-pointer transition-colors ${
                currentView === "disputes" || currentView === "dispute-detail" ? "text-[#06b6d4]" : "text-[#737373]"
              }`}
            >
              ARBITRATION RECORD
            </button>
            <button
              onClick={() => navigateTo("dashboard")}
              className={`hover:text-[#06b6d4] cursor-pointer transition-colors ${
                currentView === "dashboard" || currentView === "create-agreement" || currentView === "agreement-detail" || currentView === "file-dispute" ? "text-[#06b6d4]" : "text-[#737373]"
              }`}
            >
              DASHBOARD
            </button>
          </nav>

          {/* Wallet section */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => connectWallet()}
              className="bg-[#090909] border border-[#1a1a1a] hover:border-[#06b6d4] px-3.5 py-1.5 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <div className="w-2 h-2 bg-[#22c55e] pulse-dot"></div>
              <span className="font-mono text-xs text-white">
                {connectedWallet 
                  ? `${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}`
                  : "Connect Wallet"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER VIEWPORT */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 flex-grow w-full">
        {currentView === "landing" && (
          <LandingPage
            stats={stats}
            featuredProviders={providers}
            onNavigate={navigateTo}
            onConnectWallet={() => connectWallet()}
            isWalletConnected={!!connectedWallet}
          />
        )}

        {currentView === "providers" && (
          <ProvidersPage
            providers={providers}
            onNavigate={navigateTo}
            onCopyText={handleCopyText}
            // triggerToast={triggerToast}
          />
        )}

        {currentView === "provider-profile" && viewParams?.wallet && (
          <ProviderProfilePage
            provider={providers.find((p) => p.wallet.toLowerCase() === viewParams.wallet.toLowerCase())!}
            agreements={agreements}
            disputes={disputes}
            connectedWallet={connectedWallet || ""}
            onNavigate={navigateTo}
            onCopyText={handleCopyText}
          />
        )}

        {currentView === "dashboard" && (
          <DashboardPage
            connectedWallet={connectedWallet || ""}
            providerProfile={connectedProviderProfile}
            clientAgreements={clientAgreements}
            providerAgreements={providerAgreements}
            clientDisputes={clientDisputes}
            providerDisputes={providerDisputes}
            onNavigate={navigateTo}
            triggerToast={triggerToast}
          />
        )}

        {currentView === "disputes" && (
          <DisputesPage
            disputes={disputes}
            agreements={agreements}
            onNavigate={navigateTo}
         
          />
        )}

        {currentView === "register-provider" && (
          <RegisterProviderPage
            connectedWallet={connectedWallet || ""}
            onNavigate={navigateTo}
            triggerToast={triggerToast}
          />
        )}

        {currentView === "create-agreement" && (
          <CreateAgreementPage
            connectedWallet={connectedWallet || ""}
            providers={providers}
            telemetrySources={telemetrySources}
            preselectedProviderWallet={viewParams.providerWallet}
            onNavigate={navigateTo}
            triggerToast={triggerToast}
          />
        )}

        {currentView === "agreement-detail" && activeAgreementDetail && (
          <AgreementDetailPage
            agreement={{
              ...activeAgreementDetail,
              readings: activeAgreementDetail?.readings || []
            }}
            telemetrySources={telemetrySources}
            connectedWallet={connectedWallet || ""}
            onNavigate={navigateTo}
            onCopyText={handleCopyText}
           
            triggerToast={triggerToast}
          />
        )}

        {currentView === "file-dispute" && viewParams?.agreementId && (
          <FileDisputePage
            connectedWallet={connectedWallet || ""}
            agreement={agreements.find((a) => a.agreement_id === viewParams.agreementId)!}
            onNavigate={navigateTo}
            triggerToast={triggerToast}
          />
        )}

        {currentView === "dispute-detail" && activeDisputeDetail && (
          <DisputeDetailPage
            dispute={activeDisputeDetail}
            agreement={activeDisputeAgreement!}
            connectedWallet={connectedWallet || ""}
            onNavigate={navigateTo}
            onCopyText={handleCopyText}
            triggerToast={triggerToast}
          />
        )}
      </main>

      {/* 3. FOOTER */}
      <footer className="bg-[#090909] border-t border-[#1a1a1a] py-8 mt-12 font-mono text-[11px] text-[#737373]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#06b6d4]" />
            <span>NodeGuard SLA Arbitration Coordinator © 2026. Powered by GenLayer Consensus.</span>
          </div>
          <div className="flex gap-4">
            <button onClick={handleManualRefetch} className="hover:text-white flex items-center gap-1 cursor-pointer">
              <Database className="w-3.5 h-3.5" /> RE-SYNC TELEMETRY
            </button>
            <span className="text-[#3d3d3d] sm:inline">|</span>
            <span className="text-[#06b6d4]">GEN COLLATERAL BACKED</span>
          </div>
        </div>
      </footer>

      {/* 4. FLOATING TOASTS NOTIFICATIONS */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 w-full max-w-sm px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 border font-mono text-xs flex gap-3 shadow-lg animate-fade-in ${
              t.type === "success" ? "bg-[#090909] border-[#22c55e] text-white" :
              t.type === "error" ? "bg-[#090909] border-red-500 text-white" :
              t.type === "warning" ? "bg-[#090909] border-amber-500 text-white" :
              "bg-[#090909] border-[#06b6d4] text-white"
            }`}
          >
            {t.type === "success" && <Check className="w-4 h-4 text-[#22c55e] shrink-0" />}
            {t.type === "error" && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
            {t.type === "warning" && <Info className="w-4 h-4 text-amber-500 shrink-0" />}
            {t.type === "info" && <Info className="w-4 h-4 text-[#06b6d4] shrink-0" />}
            
            <div className="space-y-1">
              <div className="font-bold uppercase tracking-wider text-[11px]">{t.title}</div>
              <div className="text-[#737373] text-[10px] leading-relaxed">{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NodeGuardAppContent />
    </QueryClientProvider>
  );
}