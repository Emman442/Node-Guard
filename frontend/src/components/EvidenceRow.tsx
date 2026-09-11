import { useFetchEvidence } from "../lib/hooks/useNodeGuard";

function EvidenceRow({
  evidenceId,
}: {
  evidenceId: string;
}) {
  const { data: ev, isLoading, isError } = useFetchEvidence(evidenceId);
  if (isLoading) {
    return (
      <div className="bg-[#090909] border border-[#1a1a1a] p-3 font-mono text-xs text-[#737373]">
        LOADING {evidenceId}...
      </div>
    );
  }

  if (isError || !ev) {
    console.error(`Failed to load evidence with ID ${evidenceId}`);
    return (
      <div className="bg-[#090909] border border-[#1a1a1a] p-3 font-mono text-xs text-red-500">
        FAILED TO LOAD {evidenceId}
      </div>
    );
  }

  return (
    <div className="bg-[#090909] border border-[#1a1a1a] p-3 font-mono text-xs space-y-1" key={ev.evidence_id}>
      <div className="flex justify-between gap-3">
        <span className="text-white font-bold truncate">{ev.evidence_type}</span>
        <span className="text-[10px] text-[#737373]">{ev.evidence_id}</span>
      </div>
      <p className="text-[#737373] text-[11px]">{ev.description}</p>
      <div className="flex justify-between items-center gap-3">
        <span className="text-[#737373] truncate">{ev.url}</span>
        <a
          href={ev.url}
          target="_blank"
          rel="noreferrer"
          className="text-[#06b6d4] hover:underline text-[10px] font-bold shrink-0"
        >
          OPEN LINK &gt;
        </a>
      </div>
    </div>
  );
}

export { EvidenceRow };