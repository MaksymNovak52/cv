import { CandidateRow } from "@/type";

export function CandidateList({
  candidates,
  candidate,
  handleCandidateClick,
}: {
  candidates: CandidateRow[];
  candidate: CandidateRow;
  handleCandidateClick: (candidate: CandidateRow) => void;
}) {
  return (
    <div className="fixed hidden lg:flex left-[32px]  flex-col items-start bottom-[32px] text-[16px] text-white font-bold leading-[-0.16px] z-10">
      {candidates?.map((candidateItem) => (
        <p
          key={candidateItem.id}
          className={`text-[12px] leading-[-0.1px] uppercase cursor-pointer hover:text-white transition-colors ${
            candidateItem.id === candidate.id ? "text-white" : "text-[#B2B8B5]"
          }`}
          onClick={() => handleCandidateClick(candidateItem)}
        >
          {candidateItem.full_name}
        </p>
      ))}
    </div>
  );
}
