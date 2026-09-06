"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import NodeGuard from "@/src/lib/contract/NodeGuard";
import { getContractAddress } from "../genlayer/client";
import { toast } from "sonner";
import {
  TelemetryReading,
  TelemetrySource,
  DisputeEvidence,
  Agreement,
  Provider,
  Client,
  ArbitrationVerdict,
  FullDispute,
  Dispute
} from "../contract/types";
import { getAddress } from "viem";
import { useWallet } from "../genlayer/wallet";


export function useNodeGuardContract(): NodeGuard | null {
  const contractAddress = getContractAddress();
  const { address: rawAddress } = useWallet();
  const address = rawAddress ? getAddress(rawAddress) : "";

  return useMemo(() => {
    if (!contractAddress || !address) {
      return null;
    }
    return new NodeGuard(contractAddress, address);
  }, [contractAddress, address]);
}


export function useFetchProvider(providerWallet: string | null) {
  const contract = useNodeGuardContract();

  return useQuery<Provider, Error>({
    queryKey: ["provider", providerWallet],
    queryFn: async () => {
      if (!providerWallet) throw new Error("Wallet not provided");
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getProvider(providerWallet);
    },
    enabled: !!providerWallet && !!contract,
  });
}

export function useFetchAllProviders() {
  const contract = useNodeGuardContract();

  return useQuery<Provider[], Error>({
    queryKey: ["providers"],
    queryFn: async () => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getAllProviders();
    },
    enabled: !!contract,
  });
}

export function useFetchClient(clientWallet: string | null) {
  const contract = useNodeGuardContract();

  return useQuery<Client, Error>({
    queryKey: ["client", clientWallet],
    queryFn: async () => {
      if (!clientWallet) throw new Error("Wallet not provided");
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getClient(clientWallet);
    },
    enabled: !!clientWallet && !!contract,
  });
}


export function useFetchAgreement(agreementId: string | null) {
  const contract = useNodeGuardContract();

  return useQuery<Agreement, Error>({
    queryKey: ["agreement", agreementId],
    queryFn: async () => {
      if (!agreementId) throw new Error("Agreement ID not provided");
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getAgreement(agreementId);
    },
    enabled: !!agreementId && !!contract,
  });
}

export function useFetchAllAgreements() {
  const contract = useNodeGuardContract();

  return useQuery<Agreement[], Error>({
    queryKey: ["agreements"],
    queryFn: async () => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getAllAgreements();
    },
    enabled: !!contract,
  });
}

export function useFetchProviderAgreements(wallet: string | null) {
  const contract = useNodeGuardContract();

  return useQuery<Agreement[], Error>({
    queryKey: ["provider-agreements", wallet],
    queryFn: async () => {
      if (!wallet) throw new Error("Wallet not provided");
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getProviderAgreements(wallet);
    },
    enabled: !!wallet && !!contract,
  });
}

export function useFetchClientAgreements(wallet: string | null) {
  const contract = useNodeGuardContract();

  return useQuery<Agreement[], Error>({
    queryKey: ["client-agreements", wallet],
    queryFn: async () => {
      if (!wallet) throw new Error("Wallet not provided");
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getClientAgreements(wallet);
    },
    enabled: !!wallet && !!contract,
  });
}



export function useFetchTelemetryReading(readingId: string | null) {
  const contract = useNodeGuardContract();

  return useQuery<TelemetryReading, Error>({
    queryKey: ["telemetry-reading", readingId],
    queryFn: async () => {
      if (!readingId) throw new Error("Reading ID not provided");
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getTelemetryReading(readingId);
    },
    enabled: !!readingId && !!contract,
  });
}

export function useFetchTelemetrySource(sourceId: string | null) {
  const contract = useNodeGuardContract();

  return useQuery<TelemetrySource, Error>({
    queryKey: ["telemetry-source", sourceId],
    queryFn: async () => {
      if (!sourceId) throw new Error("Source ID not provided");
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getTelemetrySource(sourceId);
    },
    enabled: !!sourceId && !!contract,
  });
}

export function useFetchAllTelemetrySources() {
  const contract = useNodeGuardContract();

  return useQuery<TelemetrySource[], Error>({
    queryKey: ["telemetry-sources"],
    queryFn: async () => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getAllTelemetrySources();
    },
    enabled: !!contract,
  });
}


export function useFetchDispute(disputeId: string | null) {
  const contract = useNodeGuardContract();

  return useQuery<Dispute, Error>({
    queryKey: ["dispute", disputeId],
    queryFn: async () => {
      if (!disputeId) throw new Error("Dispute ID not provided");
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getDispute(disputeId);
    },
    enabled: !!disputeId && !!contract,
  });
}

export function useFetchAllDisputeEvidences() {
  const contract = useNodeGuardContract();

  return useQuery<DisputeEvidence[], Error>({
    queryKey: ["disputes"],
    queryFn: async () => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getAllDisputes();
    },
    enabled: !!contract,
  });
}

export function useFetchAllDisputes() {
  const contract = useNodeGuardContract();

  return useQuery<Dispute[], Error>({
    queryKey: ["disputes"],
    queryFn: async () => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getAllDisputes();
    },
    enabled: !!contract,
  });
}

export function useFetchDisputeEvidence(evidenceId: string | null) {
  const contract = useNodeGuardContract();

  return useQuery<DisputeEvidence, Error>({
    queryKey: ["dispute-evidence", evidenceId],
    queryFn: async () => {
      if (!evidenceId) throw new Error("Evidence ID not provided");
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getDisputeEvidence(evidenceId);
    },
    enabled: !!evidenceId && !!contract,
  });
}

export function useFetchVerdict(verdictId: string | null) {
  const contract = useNodeGuardContract();

  return useQuery<ArbitrationVerdict, Error>({
    queryKey: ["verdict", verdictId],
    queryFn: async () => {
      if (!verdictId) throw new Error("Verdict ID not provided");
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getVerdict(verdictId);
    },
    enabled: !!verdictId && !!contract,
  });
}

export function useFetchMinStake() {
  const contract = useNodeGuardContract();

  return useQuery<number, Error>({
    queryKey: ["min-stake"],
    queryFn: async () => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.getMinStake();
    },
    enabled: !!contract,
  });
}


export function useRegisterProvider() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      website,
      stakeAmountGen,
    }: {
      name: string;
      description: string;
      website: string;
      stakeAmountGen: number;
    }) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.registerProvider(name, description, website, stakeAmountGen);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Provider registered successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to register provider.");
    },
  });
}

export function useAddStake() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amountGen: number) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.addStake(amountGen);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["providers"] });
      await queryClient.invalidateQueries({ queryKey: ["provider"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useWithdrawStake() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.withdrawStake(amount);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["providers"] });
      await queryClient.invalidateQueries({ queryKey: ["provider"] });
      toast.success("Stake withdrawn successfully!");
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useUpdateProviderProfile() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      website,
    }: {
      name: string;
      description: string;
      website: string;
    }) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.updateProviderProfile(name, description, website);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["provider"] });
      toast.success("Provider profile updated!");
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useUpdateClientName() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.updateClientName(name);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["client"] });
    },
    onError: (error) => {
      console.error(error);

    },
  });
}


export function useCreateAgreement() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
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
    }) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.createAgreement(params);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["agreements"] });
      await queryClient.invalidateQueries({ queryKey: ["provider-agreements"] });
      await queryClient.invalidateQueries({ queryKey: ["client-agreements"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useTerminateAgreement() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agreementId: string) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.terminateAgreement(agreementId);
    },
    onSuccess: async (_, agreementId) => {
      await queryClient.invalidateQueries({ queryKey: ["agreement", agreementId] });
      await queryClient.invalidateQueries({ queryKey: ["agreements"] });
      toast.success("Agreement terminated successfully.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to terminate agreement.");
    },
  });
}


export function useRegisterTelemetrySource() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      url,
      sourceType,
      description,
    }: {
      name: string;
      url: string;
      sourceType: string;
      description: string;
    }) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.registerTelemetrySource(name, url, sourceType, description);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["telemetry-sources"] });
      toast.success("Telemetry source registered!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to register telemetry source.");
    },
  });
}

export function useRecordTelemetry() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      agreementId,
      timeframeStart,
      timeframeEnd,
      rawDataUrl,
    }: {
      agreementId: string;
      timeframeStart: string;
      timeframeEnd: string;
      rawDataUrl: string;
    }) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.recordTelemetry(agreementId, timeframeStart, timeframeEnd, rawDataUrl);
    },
    onSuccess: async () => {
      toast.success("Telemetry logs saved on-chain!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to record telemetry.");
    },
  });
}


export function useFileDispute() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      agreementId,
      incidentStart,
      incidentEnd,
      description,
      impactDescription,
    }: {
      agreementId: string;
      incidentStart: string;
      incidentEnd: string;
      description: string;
      impactDescription: string;
    }) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.fileDispute(
        agreementId,
        incidentStart,
        incidentEnd,
        description,
        impactDescription
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["disputes"] });
      toast.success("Dispute filed! Active for jury review.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to file dispute.");
    },
  });
}

export function useSubmitEvidence() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      disputeId,
      evidenceType,
      url,
      description,
      title,
    }: {
      disputeId: string;
      evidenceType: string;
      url: string;
      description: string;
      title: string;
    }) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.submitEvidence(disputeId, evidenceType, url, description, title);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["dispute", variables.disputeId] });
      toast.success("Evidence submitted successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to submit evidence.");
    },
  });
}

export function useRenderVerdict() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (disputeId: string) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.renderVerdict(disputeId);
    },
    onSuccess: async (_, disputeId) => {
      await queryClient.invalidateQueries({ queryKey: ["dispute", disputeId] });
      await queryClient.invalidateQueries({ queryKey: ["disputes"] });
      toast.success("Consensus verdict rendered successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to render consensus verdict.");
    },
  });
}

export function useAppealVerdict() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      disputeId,
      appealContext,
      additionalEvidenceUrl,
    }: {
      disputeId: string;
      appealContext: string;
      additionalEvidenceUrl: string;
    }) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.appealVerdict(disputeId, appealContext, additionalEvidenceUrl);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["dispute", variables.disputeId] });
      toast.success("Dispute verdict appealed!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to appeal verdict.");
    },
  });
}


export function useAdminSuspendProvider() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ providerWallet, reason }: { providerWallet: string; reason: string }) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.adminSuspendProvider(providerWallet, reason);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["provider", variables.providerWallet] });
      await queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Provider suspended successfully (Admin).");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Suspension failed. Admin privileges required.");
    },
  });
}

export function useAdminUpdateMinStake() {
  const contract = useNodeGuardContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMin: number) => {
      if (!contract) throw new Error("Contract not initialized");
      return await contract.adminUpdateMinStake(newMin);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["min-stake"] });
      toast.success("Minimum stake requirement updated.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update min stake. Admin privileges required.");
    },
  });
}

export function useFetchFullDispute(disputeId: string) {
  const contract = useNodeGuardContract();

  return useQuery<FullDispute>({
    queryKey: ["full-dispute", disputeId],
    queryFn: async () => {
      if (!contract) throw new Error("Contract not initialized");

      const dispute = await contract.getDispute(disputeId);

      const agreement = await contract.getAgreement(
        dispute.agreement_id
      );

      const claimant = await contract.getClient(
        dispute.claimant
      );

      const respondent = await contract.getProvider(
        dispute.respondent
      );

      const evidence = await Promise.all(
        dispute.evidence_ids.map(id =>
          contract.getDisputeEvidence(id)
        )
      );

      const telemetrySources = await Promise.all(
        agreement.telemetry_source_ids.map((id) => contract.getTelemetrySource(id))
      );
      const verdict =
        dispute.verdict_id
          ? await contract.getVerdict(dispute.verdict_id)
          : undefined;

      const appealVerdict =
        dispute.appeal_verdict_id
          ? await contract.getVerdict(dispute.appeal_verdict_id)
          : undefined;

      return {
        dispute,
        agreement,
        claimant,
        respondent,
        evidence,
        telemetrySources,
        verdict,
        appealVerdict,
      };
    },
    enabled: !!contract && !!disputeId,
  });
}