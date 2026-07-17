import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { parseEther } from "viem";

import { TelemetryReading, TransactionReceipt, ArbitrationVerdict, Client, DisputeEvidence, Agreement, Provider, TelemetrySource, Dispute} from "./types";
// ─── Interfaces (add these to your types file) ─────────────────────────────



class NodeGuard {
    private contractAddress: `0x${string}`;
    private client: ReturnType<typeof createClient>;

    constructor(
        contractAddress: string,
        address?: string | null,
        studioUrl?: string
    ) {
        this.contractAddress = contractAddress as `0x${string}`;

        const config: any = { chain: studionet };

        if (address) config.account = address as `0x${string}`;
        if (studioUrl) config.endpoint = studioUrl;

        this.client = createClient(config);
    }

    updateAccount(address: string): void {
        this.client = createClient({
            chain: studionet,
            account: address as `0x${string}`,
        });
    }

    // ─── Provider & Client ───────────────────────────────────────────────────

    async registerProvider(name: string, description: string, website: string, stakeAmountGen: number) {
        await this.client.connect("studionet");
        try {
            const value = parseEther(stakeAmountGen.toString());
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "register_provider",
                args: [name, description, website],
                value,
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error registering provider:", error);
            throw new Error("Failed to register provider");
        }
    }

    async addStake(amountGen: number) {
        await this.client.connect("studionet");
        try {
            const value = parseEther(amountGen.toString());
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "add_stake",
                args: [],
                value,
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error adding stake:", error);
            throw new Error("Failed to add stake");
        }
    }

    async withdrawStake(amount: number) {
        await this.client.connect("studionet");
        try {
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "withdraw_stake",
                args: [amount],
                value: BigInt(0),
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error withdrawing stake:", error);
            throw new Error("Failed to withdraw stake");
        }
    }

    async updateProviderProfile(name: string, description: string, website: string) {
        await this.client.connect("studionet");
        try {
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "update_provider_profile",
                args: [name, description, website],
                value: BigInt(0),
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error updating provider profile:", error);
            throw new Error("Failed to update provider profile");
        }
    }

    async updateClientName(name: string) {
        await this.client.connect("studionet");
        try {
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "update_client_name",
                args: [name],
                value: BigInt(0),
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error updating client name:", error);
            throw new Error("Failed to update client name");
        }
    }

    async getProvider(wallet: string): Promise<Provider> {
        try {
            const provider = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_provider",
                args: [wallet],
            });
            return provider as Provider;
        } catch (error) {
            console.error("Error fetching provider:", error);
            throw new Error("Failed to fetch provider");
        }
    }

    async getAllProviders(): Promise<Provider[]> {
        try {
            const providers = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_all_providers",
            });
            return providers as Provider[];
        } catch (error) {
            console.error("Error fetching providers:", error);
            throw new Error("Failed to fetch providers");
        }
    }

    async getClient(wallet: string): Promise<Client> {
        try {
            const client = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_client",
                args: [wallet],
            });
            return client as Client;
        } catch (error) {
            console.error("Error fetching client:", error);
            throw new Error("Failed to fetch client");
        }
    }

    // ─── Agreements ─────────────────────────────────────────────────────────

    async createAgreement(params: {
        providerWallet: string;
        serviceName: string;
        serviceType: string;
        serviceEndpoint: string;
        uptimePercentage: string;
        maxLatencyMs: string;
        maxErrorRate: string;
        dataFreshnessBlocks: string;
        measurementRegion: string;
        plainEnglishSla: string;
        penaltyPerIncident: number;
        maxPenaltyPerDispute: number;
        monthlyFeeGen: number;
        durationDays: number;
        telemetrySourceIds: string[];
    }) {
        await this.client.connect("studionet");
        try {
            const value = parseEther(params.monthlyFeeGen.toString());

            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "create_agreement",
                args: [
                    params.providerWallet,
                    params.serviceName,
                    params.serviceType,
                    params.serviceEndpoint,
                    params.uptimePercentage,
                    params.maxLatencyMs,
                    params.maxErrorRate,
                    params.dataFreshnessBlocks,
                    params.measurementRegion,
                    params.plainEnglishSla,
                    params.penaltyPerIncident,
                    params.maxPenaltyPerDispute,
                    params.monthlyFeeGen,
                    params.durationDays,
                    params.telemetrySourceIds,
                ],
                value,
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
                retries: 60,
                interval: 5000,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error creating agreement:", error);
            throw new Error("Failed to create agreement");
        }
    }

    async terminateAgreement(agreementId: string) {
        await this.client.connect("studionet");
        try {
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "terminate_agreement",
                args: [agreementId],
                value: BigInt(0),
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error terminating agreement:", error);
            throw new Error("Failed to terminate agreement");
        }
    }

    async getAgreement(agreementId: string): Promise<Agreement> {
        try {
            const agreement = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_agreement",
                args: [agreementId],
            });
            return agreement as Agreement;
        } catch (error) {
            console.error("Error fetching agreement:", error);
            throw new Error("Failed to fetch agreement");
        }
    }

    async getAllAgreements(): Promise<Agreement[]> {
        try {
            const agreements = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_all_agreements",
            });
            return agreements as Agreement[];
        } catch (error) {
            console.error("Error fetching agreements:", error);
            throw new Error("Failed to fetch agreements");
        }
    }

    async getProviderAgreements(wallet: string): Promise<Agreement[]> {
        try {
            const agreements = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_provider_agreements",
                args: [wallet],
            });
            return agreements as Agreement[];
        } catch (error) {
            console.error("Error fetching provider agreements:", error);
            throw new Error("Failed to fetch provider agreements");
        }
    }

    async getClientAgreements(wallet: string): Promise<Agreement[]> {
        try {
            const agreements = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_client_agreements",
                args: [wallet],
            });
            return agreements as Agreement[];
        } catch (error) {
            console.error("Error fetching client agreements:", error);
            throw new Error("Failed to fetch client agreements");
        }
    }

    // ─── Telemetry & Readings ───────────────────────────────────────────────

    async registerTelemetrySource(
        name: string,
        url: string,
        sourceType: string,
        description: string
    ) {
        await this.client.connect("studionet");
        try {
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "register_telemetry_source",
                args: [name, url, sourceType, description],
                value: BigInt(0),
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error registering telemetry source:", error);
            throw new Error("Failed to register telemetry source");
        }
    }

    async recordTelemetry(
        agreementId: string,
        timeframeStart: string,
        timeframeEnd: string,
        rawDataUrl: string
    ) {
        await this.client.connect("studionet");
        try {
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "record_telemetry",
                args: [agreementId, timeframeStart, timeframeEnd, rawDataUrl],
                value: BigInt(0),
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
                retries: 60,
                interval: 5000,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error recording telemetry:", error);
            throw new Error("Failed to record telemetry");
        }
    }

    async getTelemetryReading(readingId: string): Promise<TelemetryReading> {
        try {
            const reading = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_telemetry_reading",
                args: [readingId],
            });
            return reading as TelemetryReading;
        } catch (error) {
            console.error("Error fetching telemetry reading:", error);
            throw new Error("Failed to fetch telemetry reading");
        }
    }

    async getTelemetrySource(sourceId: string): Promise<TelemetrySource> {
        try {
            const source = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_telemetry_source",
                args: [sourceId],
            });
            return source as TelemetrySource;
        } catch (error) {
            console.error("Error fetching telemetry source:", error);
            throw new Error("Failed to fetch telemetry source");
        }
    }

    async getAllTelemetrySources(): Promise<TelemetrySource[]> {
        try {
            const sources = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_all_telemetry_sources",
            });
            return sources as TelemetrySource[];
        } catch (error) {
            console.error("Error fetching telemetry sources:", error);
            throw new Error("Failed to fetch telemetry sources");
        }
    }

    // ─── Disputes & Arbitration ─────────────────────────────────────────────

    async fileDispute(
        agreementId: string,
        incidentStart: string,
        incidentEnd: string,
        description: string,
        impactDescription: string
    ) {
        await this.client.connect("studionet");
        try {
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "file_dispute",
                args: [agreementId, incidentStart, incidentEnd, description, impactDescription],
                value: BigInt(0),
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error filing dispute:", error);
            throw new Error("Failed to file dispute");
        }
    }

    async submitEvidence(
        disputeId: string,
        evidenceType: string,
        url: string,
        description: string,
        title: string
    ) {
        await this.client.connect("studionet");
        try {
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "submit_evidence",
                args: [disputeId, evidenceType, url, description, title],
                value: BigInt(0),
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error submitting evidence:", error);
            throw new Error("Failed to submit evidence");
        }
    }

    async renderVerdict(disputeId: string) {
        await this.client.connect("studionet");
        try {
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "render_verdict",
                args: [disputeId],
                value: BigInt(0),
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
                retries: 60,
                interval: 5000,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error rendering verdict:", error);
            throw new Error("Failed to render verdict");
        }
    }

    async appealVerdict(disputeId: string, appealContext: string, additionalEvidenceUrl: string) {
        await this.client.connect("studionet");
        try {
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "appeal_verdict",
                args: [disputeId, appealContext, additionalEvidenceUrl],
                value: BigInt(0),
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
                retries: 60,
                interval: 5000,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error appealing verdict:", error);
            throw new Error("Failed to appeal verdict");
        }
    }

    async getDispute(disputeId: string): Promise<Dispute> {
        try {
            const dispute = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_dispute",
                args: [disputeId],
            });
            return dispute as Dispute;
        } catch (error) {
            console.error("Error fetching dispute:", error);
            throw new Error("Failed to fetch dispute");
        }
    }

    async getDisputeEvidence(disputeId: string): Promise<DisputeEvidence> {
        try {
            const dispute = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_dispute",
                args: [disputeId],
            });
            return dispute as DisputeEvidence;
        } catch (error) {
            console.error("Error fetching dispute evidence:", error);
            throw new Error("Failed to fetch dispute evidence");
        }
    }

    async getAllDisputes(): Promise<Dispute[]> {
        try {
            const disputes = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_all_disputes",
            });
            return disputes as Dispute[];
        } catch (error) {
            console.error("Error fetching disputes:", error);
            throw new Error("Failed to fetch disputes");
        }
    }

    async getAllDisputesEvidences(): Promise<DisputeEvidence[]> {
        try {
            const disputes = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_all_disputes",
            });
            return disputes as DisputeEvidence[];
        } catch (error) {
            console.error("Error fetching disputes evidences:", error);
            throw new Error("Failed to fetch disputes evidences");
        }
    }

    async getVerdict(verdictId: string): Promise<ArbitrationVerdict> {
        try {
            const verdict = await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_verdict",
                args: [verdictId],
            });
            return verdict as ArbitrationVerdict;
        } catch (error) {
            console.error("Error fetching verdict:", error);
            throw new Error("Failed to fetch verdict");
        }
    }

    // ─── Admin ──────────────────────────────────────────────────────────────

    async adminSuspendProvider(providerWallet: string, reason: string) {
        await this.client.connect("studionet");
        try {
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "admin_suspend_provider",
                args: [providerWallet, reason],
                value: BigInt(0),
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error suspending provider:", error);
            throw new Error("Failed to suspend provider (admin only)");
        }
    }

    async adminUpdateMinStake(newMin: number) {
        await this.client.connect("studionet");
        try {
            const txHash = await this.client.writeContract({
                address: this.contractAddress,
                functionName: "admin_update_min_stake",
                args: [newMin],
                value: BigInt(0),
            });

            const receipt = await this.client.waitForTransactionReceipt({
                hash: txHash,
                status: TransactionStatus.ACCEPTED,
            });
            return receipt as TransactionReceipt;
        } catch (error) {
            console.error("Error updating min stake:", error);
            throw new Error("Failed to update min stake (admin only)");
        }
    }

    async getMinStake(): Promise<number> {
        try {
            return await this.client.readContract({
                address: this.contractAddress,
                functionName: "get_min_stake",
            });
        } catch (error) {
            console.error("Error fetching min stake:", error);
            throw new Error("Failed to fetch min stake");
        }
    }
}

export default NodeGuard;