import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAddStake, useRegisterProvider } from "../lib/hooks/useNodeGuard";

interface RegisterProviderPageProps {
  connectedWallet: string;
  onNavigate: (view: string, params?: any) => void;
  triggerToast: (title: string, desc: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export default function RegisterProviderPage({
  connectedWallet,
  onNavigate,
  triggerToast
}: RegisterProviderPageProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [stakeAmount, setStakeAmount] = useState("5000");
  const { isPending: isRegisteringProvider, mutate: RegisterProvider } = useRegisterProvider()

  const { isPending: isAddingStake, mutate: AddStake } = useAddStake()
  const serviceOptions = ["RPC NODE", "GPU CLUSTER", "INDEXER", "API", "OTHER"];
  const minStake = 5000;

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !stakeAmount) {
      triggerToast("Form Validation Error", "Please fill in all mandatory provider registration details.", "error");
      return;
    }

    const stakeVal = Number(stakeAmount);
    if (stakeVal < minStake) {
      triggerToast("Collateral Insufficient", `Minimum platform collateral required is ${minStake} GEN.`, "error");
      return;
    }


    RegisterProvider({
      name: name,
      description: description,
      website: website,
      stakeAmountGen: stakeVal,
    }, {
      onSuccess: (data: any) => {
        triggerToast("Provider Registered!", "Provider registered successfully", "success");

      },
      onError: (err: any) => {
        triggerToast("Provider registration failed", "Failed to register provider", "error");
      }
    })
  };

  const stakeNum = Number(stakeAmount) || 0;
  const surplus = Math.max(0, stakeNum - minStake);

  return (
    <div className="space-y-8 pb-16 max-w-3xl">
      {/* Back Link */}
      <button
        onClick={() => onNavigate("providers")}
        className="text-[#737373] hover:text-[#06b6d4] font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> &lt; BACK TO PROVIDERS
      </button>

      {/* Header */}
      <div className="space-y-1 border-b border-[#1a1a1a] pb-6">
        <h1 className="text-3xl font-heading font-bold text-white uppercase tracking-tight">
          REGISTER AS PROVIDER
        </h1>
        <p className="text-sm text-[#737373]">
          Stake GEN to guarantee your infrastructure SLAs and coordinate corporate subscription contracts.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-8">
        {/* IDENTITY SECTION */}
        <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6">
          <h2 className="text-md font-heading font-bold text-[#06b6d4] uppercase tracking-wider">
            SECTION 01: IDENTITY &amp; CORE PROTOCOL
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#737373] uppercase block">
                Provider / Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Solstice RPC Labs"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#737373] uppercase block">
                Infrastructure Nodes Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe your bare metal clusters, geographical redundancy options, active telemetry logging capabilities..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-sans focus:border-[#06b6d4] focus:outline-none w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#737373] uppercase block">
                Website URL (Optional)
              </label>
              <input
                type="url"
                placeholder="e.g. https://solstice-rpc.io"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-2 text-sm font-mono focus:border-[#06b6d4] focus:outline-none w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-[#737373] uppercase block">
                Service Capabilities Badges (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {serviceOptions.map((service) => (
                  <button
                    type="button"
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`px-4 py-2 border font-mono text-xs uppercase tracking-wider cursor-pointer transition-all ${selectedServices.includes(service)
                        ? "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]"
                        : "bg-transparent text-[#737373] border-[#1a1a1a] hover:border-[#262626] hover:text-white"
                      }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STAKE SECTION */}
        <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 space-y-6">
          <h2 className="text-md font-heading font-bold text-[#06b6d4] uppercase tracking-wider">
            SECTION 02: STAKE YOUR COLLATERAL
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#06b6d4] uppercase tracking-widest block font-bold">
                STAKE AMOUNT (GEN) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={minStake}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="bg-[#090909] text-white border border-[#1a1a1a] px-3 py-3 text-lg font-mono text-[#06b6d4] focus:border-[#06b6d4] focus:outline-none w-full font-bold"
              />
              <div className="text-xs text-[#737373] mt-1 font-mono">
                Platform minimum required stake: <span className="text-white font-bold">{minStake.toLocaleString()} GEN</span>
              </div>
            </div>

            <div className="p-4 bg-[#090909] border border-[#1a1a1a] text-xs text-[#737373] space-y-1 leading-relaxed">
              <p>
                Your stake is held as secure SLA collateral under the NodeGuard smart contract coordinator.
              </p>
              <p className="text-amber-500">
                ⚠️ It will be automatically slashed and reimbursed directly to clients if the GenLayer AI validator consensus confirms an active SLA breach.
              </p>
              <p>
                Higher staked amounts represent stronger guarantees, increasing your node visibility and reputation ranking.
              </p>
            </div>

            {/* Stake Breakdown Preview */}
            <div className="border border-[#1a1a1a] p-4 bg-[#090909] space-y-3 font-mono text-xs">
              <div className="text-xs text-[#737373] uppercase tracking-wider border-b border-[#131313] pb-2">COLLATERAL DEPOSIT SUMMARY</div>
              <div className="flex justify-between">
                <span>YOUR STAKE:</span>
                <span className="text-[#06b6d4] font-bold">{stakeNum.toLocaleString()} GEN</span>
              </div>
              <div className="flex justify-between">
                <span>MINIMUM REQUIRED:</span>
                <span>{minStake.toLocaleString()} GEN</span>
              </div>
              <div className="flex justify-between border-t border-[#131313] pt-2">
                <span>SURPLUS COLLATERAL:</span>
                <span className={surplus > 0 ? "text-green-500 font-bold" : "text-[#737373]"}>
                  {surplus.toLocaleString()} GEN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 font-heading font-bold text-sm tracking-widest uppercase cursor-pointer text-center bg-[#06b6d4] text-black hover:bg-[#67e8f9] transition-colors"
        >
          STAKE &amp; REGISTER NODE
        </button>

        <div className="text-[10px] text-center text-[#3d3d3d] font-mono uppercase tracking-wider">
          STAKED ASSETS WILL BE LOCKED UNDER THE COORDINATOR SMART CONTRACT. LIQUID COLLATERAL MAY BE WITHDRAWN ONCE ALL ACTIVE SERVICE CONTRACTS TERMINATE.
        </div>
      </form>
    </div>
  );
}