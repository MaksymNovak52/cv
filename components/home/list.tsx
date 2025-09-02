"use client";
import {
  useRemoveCandidateFromJob,
  useToggleFavorite,
} from "@/queries/candidates";
import { CandidateRow } from "@/type";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Linkedin,
  LocateFixed,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
function VisibleCandidatesTracker({
  totalCandidates,
}: {
  totalCandidates: number;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const visibleCardsRef = useRef(new Set<number>());

  useEffect(() => {
    visibleCardsRef.current.clear();
    setVisibleCount(0);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardIndex = parseInt(
            entry.target.getAttribute("data-card-index") || "0"
          );

          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            visibleCardsRef.current.add(cardIndex);
          } else {
            visibleCardsRef.current.delete(cardIndex);
          }
        });

        setVisibleCount(visibleCardsRef.current.size);
      },
      {
        threshold: 0.5, // 50% видимості
        rootMargin: "0px",
      }
    );

    const candidateCards = document.querySelectorAll("[data-candidate-card]");
    candidateCards.forEach((card, index) => {
      card.setAttribute("data-card-index", index.toString());
      observerRef.current?.observe(card);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [totalCandidates]);

  return (
    <div className="w-[170px] h-[40px] bg-[#211C1A] fixed bottom-2 left-1/2 transform -translate-x-1/2 rounded-[4px] flex flex-col items-center justify-center ">
      <div className="flex flex-row items-center mb-1 gap-1">
        <p className="text-white text-[12px] font-bold leading-[-0.12px] ">
          {visibleCount} out
        </p>

        <p className="text-[#D3D2D1] text-[12px] font-bold text-center leading-[-0.12px]">
          of {totalCandidates} left to view
        </p>
      </div>
      <div className="w-[32px] h-[2px] bg-gray-600 rounded-full">
        <div
          className="h-full bg-white rounded-full transition-all duration-300"
          style={{
            width:
              totalCandidates > 0
                ? `${(visibleCount / totalCandidates) * 100}%`
                : "0%",
          }}
        ></div>
      </div>
    </div>
  );
}
export function CandidatesList({
  candidatesByJob,
  selectedJobId,
  handleCandidateClick,
}: {
  handleCandidateClick: (candidate: CandidateRow) => void;
  selectedJobId: string;
  candidatesByJob: CandidateRow[] | undefined;
}) {
  const { mutate: toggleFav } = useToggleFavorite(selectedJobId);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateRow | null>(null);
  const { mutate: removeCandidate, isError } = useRemoveCandidateFromJob();

  const handleReject = (candidate: CandidateRow, e: React.MouseEvent) => {
    e.preventDefault();
    removeCandidate({
      jobId: selectedJobId,
      candidateId: candidate.id,
    });
  };

  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
        {candidatesByJob?.map((candidate, index) => (
          <div
            key={candidate.id}
            data-candidate-card
            data-card-index={index}
            className="flex flex-col relative w-[334px] p-[20px] bg-white rounded-[6px] border border-[rgba(0,0,0,0.04)] cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleCandidateClick(candidate)}
          >
            <button
              className="p-2 hover:bg-gray-100 rounded-md transition-colors absolute right-[13px] top-[10px] z-10"
              onClick={(e) => {
                e.stopPropagation();
                toggleFav(candidate.application_id);
              }}
            >
              {candidate.is_favorite ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="19"
                  viewBox="0 0 13 19"
                  fill="currentColor"
                >
                  <path
                    d="M11.3125 0.5C11.6294 0.5 11.9321 0.62767 12.1543 0.852539C12.3762 1.07711 12.4999 1.38028 12.5 1.69531V17.9082L11.7324 17.4229L6.49902 14.1123L1.26758 17.4229L0.5 17.9082V1.69531C0.500089 1.38028 0.623835 1.07711 0.845703 0.852539C1.06794 0.627671 1.37064 0.5 1.6875 0.5H11.3125Z"
                    stroke="#211C1A"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="19"
                  viewBox="0 0 13 19"
                  fill="none"
                >
                  <path
                    d="M11.3125 0.5C11.6294 0.5 11.9321 0.62767 12.1543 0.852539C12.3762 1.07711 12.4999 1.38028 12.5 1.69531V17.9082L11.7324 17.4229L6.49902 14.1123L1.26758 17.4229L0.5 17.9082V1.69531C0.500089 1.38028 0.623835 1.07711 0.845703 0.852539C1.06794 0.627671 1.37064 0.5 1.6875 0.5H11.3125Z"
                    stroke="#211C1A"
                  />
                </svg>
              )}
            </button>
            <div className="flex items-start gap-4 mb-3">
              <div className="min-w-0 flex-1">
                <span className="text-[#211C1A] text-[24px] font-normal leading-[21.6px]">
                  {candidate.full_name}
                </span>
                <p className="text-[12px] text-[#A6A4A3] my-[8px] font-bold leading-[-0.12px]">
                  {candidate.current_title}
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={candidate.portfolio_url || ""}
                    className="text-[12px] text-[#211C1A] font-bold hover:text-gray-900 underline leading-[-0.12px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Portfolio
                  </Link>
                  <Linkedin
                    size={16}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>

            <div className="h-[1px] w-full border-dashed border-[1px] border-[#E3E3E3] my-2" />

            <div className="space-y-2 text-sm mb-3">
              <div className="flex items-center gap-2 text-[12px] font-bold">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-[#64605F]">Deployment:</span>
                <span className="text-[#211C1A]">
                  {candidate.deployment_status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-bold">
                <CheckCircle2 size={16} className="text-gray-400" />
                <span className="text-[#64605F]">English:</span>
                <span className="text-[#211C1A]">
                  {candidate.clearance_status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-bold">
                <LocateFixed size={16} className="text-gray-400" />
                <span className="text-[#64605F]">Location:</span>
                <span className="text-[#211C1A]">{candidate.location}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-bold">
                <Briefcase size={16} className="text-gray-400" />
                <span className="text-[#64605F]">Experience:</span>
                <span className="text-[#211C1A]">
                  {candidate.experience_years} Years
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between mt-2 relative">
              <div className="text-left mb-4">
                <p className="text-2xl font-normal text-[#211C1A] leading-[21.6px]">
                  ${candidate.salary.toLocaleString()}
                  <span className="text-[12px] text-[#211C1A] font-bold">
                    {" "}
                    /Year
                  </span>
                </p>
                <p className="text-[12px] text-[#A6A4A3] font-bold">
                  +Equity Package
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#211C1A]">
                <button
                  className="flex items-center justify-center bg-[#D3EBE2] w-[106px] h-[40px] rounded-md hover:bg-green-200 transition-colors font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  [A] Approve
                </button>
                <button
                  className="flex items-center justify-center border border-[#E5E5E5] w-[106px] h-[40px] rounded-md transition-colors font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  [H] Hold
                </button>
                <button
                  className="flex items-center justify-center border border-[#E5E5E5] w-[106px] h-[40px] rounded-md transition-colors font-medium"
                  onClick={(e) => handleReject(candidate, e)}
                >
                  [R] Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {candidatesByJob && candidatesByJob.length > 0 && (
        <VisibleCandidatesTracker totalCandidates={candidatesByJob.length} />
      )}
    </>
  );
}
