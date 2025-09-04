"use client";
import { pickAvatar } from "@/lib/avatar";
import {
  useCounts,
  useToggleFavorite,
  useUpdateApplicationStatus,
} from "@/queries/candidates";
import { CandidateRow, Job } from "@/type";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CandidateModalProps {
  candidate: CandidateRow;
  candidates: CandidateRow[];
  isOpen: boolean;
  onClose: () => void;
  selectedJobId: string;
  onCandidateChange: (candidate: CandidateRow) => void;
  jobDetails: Job;
}

export function CandidateModal({
  candidate,
  jobDetails,
  candidates,
  isOpen,
  onClose,
  selectedJobId,
  onCandidateChange,
}: CandidateModalProps) {
  const { mutate: toggleFav } = useToggleFavorite(selectedJobId);
  const currentIndex = candidates.findIndex((c) => c.id === candidate.id);
  const { data, isLoading } = useCounts();
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { mutate: rejectStatus } = useUpdateApplicationStatus();
  const goToPrevious = () => {
    const prevIndex =
      currentIndex > 0 ? currentIndex - 1 : candidates.length - 1;
    const prevCandidate = candidates[prevIndex];
    onCandidateChange(prevCandidate);
  };
  console.log("candidate", candidate);

  const goToNext = () => {
    const nextIndex =
      currentIndex < candidates.length - 1 ? currentIndex + 1 : 0;
    const nextCandidate = candidates[nextIndex];
    onCandidateChange(nextCandidate);
  };

  const handleCandidateClick = (candidateItem: CandidateRow) => {
    if (candidateItem.id !== candidate.id) {
      onCandidateChange(candidateItem);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, currentIndex, candidates.length]);

  if (!isOpen) return null;

  const cleanClearanceStatus = (clearance: string | null): string => {
    if (!clearance) return "";
    return clearance.replace(/^English\s*/i, "").trim();
  };

  const getSkills = () => {
    return candidate.skills && candidate.skills.length !== 0
      ? candidate.skills
      : [
          "Solidity",
          "Ethereum",
          "Layer 2 Protocols",
          "English B2",
          "MEV",
          "Vyper",
          "Rust",
          "Architecture",
          "Zero-Knowledge Proofs",
        ];
  };
  const handleReject = async (id: string) => {
    try {
      if (rejectionReason.length < 1) return;
      await rejectStatus({
        applicationId: candidate.application_id,
        statusName: "Rejected",
      });
      setIsRejected(true);
    } catch (error) {
    } finally {
      setRejectionReason("");
      onClose();
    }
  };
  const handleInterview = async (id: string) => {
    try {
      await rejectStatus({
        applicationId: candidate.application_id,
        statusName: "To Interview",
      });
    } catch (error) {
    } finally {
      onClose();
    }
  };
  const handleHold = async (id: string) => {
    try {
      await rejectStatus({
        applicationId: candidate.application_id,
        statusName: "Hold",
      });
    } catch (error) {
    } finally {
      onClose();
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-md overflow-hidden">
      <div className="bg-white w-[636px] h-[99%] rounded-md max-w-4xl max-h-screen relative flex flex-col">
        <div className="fixed  left-[28px] flex flex-col items-start top-[28px] text-[16px] text-white font-bold leading-[-0.16px] z-10">
          <span>{jobDetails.title}</span>
          <p className="text-[10px] text-[#CFCDCB] leading-[-0.1px] uppercase">
            {candidates?.length} new candidates
          </p>
        </div>

        <div
          className="fixed right-[32px] cursor-pointer flex flex-col items-start top-[28px] text-[16px] text-white font-bold leading-[-0.16px] z-10"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M15 1L1 15"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 15L1 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          className={`fixed -right-10 top-[5%]    min-w-[50 0px] w-[50px] flex items-end    min-h-[600px] ${
            candidates.length === 1 ? "hidden" : ""
          }`}
        >
          <div className="w-[20px] bg-white h-[600px]  rounded-xl relative  z-[10]"></div>
          <div className="w-[20px] bg-[#DDDEDF] h-[600px]  rounded-tl-xl relative  right-[8px] rotate-[-4deg] z-[9] top-4"></div>
          <div className="w-[20px] bg-[#B5B1AE] h-[600px]  rounded-tl-xl relative  right-[30px] rotate-[-5deg] z-[2] top-[30px]"></div>
        </div>
        <div className="fixed left-[32px] flex flex-col items-start bottom-[32px] text-[16px] text-white font-bold leading-[-0.16px] z-10">
          {candidates?.map((candidateItem) => (
            <p
              key={candidateItem.id}
              className={`text-[12px] leading-[-0.1px] uppercase cursor-pointer hover:text-white transition-colors ${
                candidateItem.id === candidate.id
                  ? "text-white"
                  : "text-[#B2B8B5]"
              }`}
              onClick={() => handleCandidateClick(candidateItem)}
            >
              {candidateItem.full_name}
            </p>
          ))}
        </div>
        <span
          className={`fixed top-1/2 right-[370px] z-10 translate-x-1/2 cursor-pointer translate-y-1/2   ${
            candidates.length === 1 ? "hidden" : ""
          }`}
          onClick={goToPrevious}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
          >
            <path
              d="M13 20H29"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M22.4531 13L28.9986 20L22.4531 27"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <rect
              opacity="0.2"
              x="0.5"
              y="0.5"
              width="39"
              height="39"
              rx="19.5"
              stroke="white"
            />
          </svg>
        </span>
        <span
          className={`fixed top-1/2 left-[330px] z-10 translate-x-1/2 cursor-pointer translate-y-1/2  ${
            candidates.length === 1 ? "hidden" : ""
          }`}
          onClick={goToNext}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
          >
            <path
              d="M28 20H12"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M18.5469 13L12.0014 20L18.5469 27"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <rect
              opacity="0.2"
              x="-0.5"
              y="0.5"
              width="39"
              height="39"
              rx="19.5"
              transform="matrix(-1 0 0 1 39 0)"
              stroke="white"
            />
          </svg>
        </span>

        <div className="flex-1 overflow-y-auto  pb-20">
          <div className="px-6 ">
            <div className="sticky top-0 bg-white z-10 pb-4 pt-6">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center">
                  <img
                    src={pickAvatar(candidate)}
                    alt="profile"
                    className="w-[64px] h-[64px] rounded-full object-cover"
                  />
                  <div className="flex flex-col ml-3 ">
                    <h3 className="text-[40px] font-medium text-[#211C1A] font-eb-garamond  leading-[36px] break-words ">
                      {/* {candidate.full_name.length > 11
                        ? candidate.full_name.slice(0, 11) + "..."
                        : candidate.full_name} */}
                      {candidate.full_name}
                    </h3>
                    <span className="text-white text-[8px] leading-[-0.08px] rounded-[4px]  py-[3px] px-[5px] font-bold flex items-center justify-center bg-[#259A6D]  w-auto max-w-[72px] mt-4">
                      {candidate.status === "Pending"
                        ? "New"
                        : candidate.status === "Hold"
                        ? "Not sure"
                        : candidate.status || "To interview"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 flex-col w-1/2 text-start">
                  <p className="text-[#A6A4A3] text-[12px] text-start font-bold leading-[-0.12px]">
                    {candidate.current_title ||
                      "Multidisciplinary Designer & Artist, Interactive Design, 3D & Motion"}
                  </p>
                  <div className="flex flex-row items-center gap-2">
                    {candidate.portfolio_url && (
                      <div className="flex flex-row items-center gap-1">
                        <Link
                          href={candidate.portfolio_url}
                          target="_blank"
                          className="text-[#211C1A] border-b border-[#211C1A] text-[12px] font-bold leading-[-0.12px]"
                        >
                          Portfolio
                        </Link>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <g opacity="0.7">
                            <path d="M1 9L9 1" stroke="#211C1A" />
                            <path d="M2.5 1H9V7.5" stroke="#211C1A" />
                          </g>
                        </svg>
                      </div>
                    )}
                    {candidate.portfolio_url && (
                      <div className="flex flex-row items-center gap-1 cursor-pointer">
                        <Link
                          target="_blank"
                          href={candidate.portfolio_url}
                          className="text-[#211C1A] border-b border-[#211C1A] text-[12px] font-bold leading-[-0.12px]"
                        >
                          CV
                        </Link>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <g opacity="0.7">
                            <path d="M1 9L9 1" stroke="#211C1A" />
                            <path d="M2.5 1H9V7.5" stroke="#211C1A" />
                          </g>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-[1px] mt-[10px] mb-[22px] border-t border-dashed border-[#E5E5E5]"></div>

            <div className="w-full flex flex-row gap-2 justify-between relative">
              <div className="w-[2px] h-[calc(100%+12px)] border-l border-dashed border-[#E5E5E5] absolute left-[126px] -top-[18px]"></div>

              <div className="space-y-3 h-[300px] ">
                <div className="flex items-start gap-2 text-[12px] leading-[-0.12px] font-bold  w-[110px]">
                  <span className="pt-[2px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="14"
                      viewBox="0 0 13 14"
                      fill="none"
                    >
                      <path
                        opacity="0.8"
                        d="M11.9167 1.07698H10.2917V0.538523C10.2917 0.395714 10.2346 0.258754 10.133 0.157773C10.0314 0.0567916 9.89366 6.10352e-05 9.75 6.10352e-05C9.60634 6.10352e-05 9.46857 0.0567916 9.36698 0.157773C9.2654 0.258754 9.20833 0.395714 9.20833 0.538523V1.07698H3.79167V0.538523C3.79167 0.395714 3.7346 0.258754 3.63302 0.157773C3.53143 0.0567916 3.39366 6.10352e-05 3.25 6.10352e-05C3.10634 6.10352e-05 2.96857 0.0567916 2.86698 0.157773C2.7654 0.258754 2.70833 0.395714 2.70833 0.538523V1.07698H1.08333C0.796103 1.07727 0.520717 1.19082 0.317614 1.39272C0.114511 1.59462 0.000283758 1.86838 0 2.15391V12.9231C0.000283758 13.2087 0.114511 13.4824 0.317614 13.6843C0.520717 13.8862 0.796103 13.9998 1.08333 14.0001H11.9167C12.2039 13.9998 12.4793 13.8862 12.6824 13.6843C12.8855 13.4824 12.9997 13.2087 13 12.9231V2.15391C12.9997 1.86838 12.8855 1.59462 12.6824 1.39272C12.4793 1.19082 12.2039 1.07727 11.9167 1.07698ZM4.8754 11.577C4.66208 11.5776 4.45076 11.5361 4.25365 11.455C4.05654 11.3739 3.87756 11.2548 3.72703 11.1045C3.62539 11.0036 3.56824 10.8667 3.56816 10.7239C3.56808 10.581 3.62506 10.4441 3.72659 10.343C3.82811 10.242 3.96585 10.1852 4.10951 10.1851C4.25317 10.185 4.39098 10.2416 4.49262 10.3426C4.55564 10.4051 4.6332 10.4513 4.71844 10.4769C4.80368 10.5026 4.89397 10.507 4.98132 10.4897C5.06866 10.4723 5.15036 10.4339 5.21919 10.3777C5.28801 10.3215 5.34184 10.2493 5.37589 10.1675C5.40995 10.0857 5.42319 9.9968 5.41444 9.90869C5.40569 9.82059 5.37522 9.73598 5.32573 9.66237C5.27624 9.58877 5.20925 9.52843 5.1307 9.4867C5.05215 9.44497 4.96446 9.42314 4.8754 9.42314H4.87507C4.85821 9.42314 4.84134 9.42215 4.82452 9.42058C4.81913 9.42008 4.81387 9.41926 4.80855 9.41862C4.79727 9.41723 4.78603 9.4156 4.77483 9.41351C4.76858 9.41233 4.7624 9.41101 4.75622 9.40963C4.74603 9.40737 4.73588 9.40474 4.7258 9.40186C4.71965 9.4001 4.7135 9.39839 4.70745 9.39642C4.69727 9.39312 4.68719 9.38934 4.67717 9.38541C4.67171 9.38328 4.66619 9.38134 4.66084 9.37904C4.64917 9.37402 4.63769 9.36837 4.62625 9.36249C4.62295 9.36076 4.61948 9.35932 4.6162 9.35754C4.60192 9.34977 4.5879 9.3413 4.57415 9.33214C4.56952 9.32905 4.56522 9.32558 4.5607 9.32236C4.55276 9.31673 4.54473 9.31129 4.53702 9.30516C4.53603 9.30437 4.53517 9.30346 4.53418 9.30266C4.52601 9.29605 4.51834 9.28892 4.51058 9.28185C4.50492 9.27673 4.49897 9.27181 4.49358 9.26649C4.48836 9.26133 4.48363 9.25573 4.4786 9.25035C4.41306 9.18004 4.36748 9.09369 4.34653 9.00012C4.34616 8.99841 4.34557 8.99675 4.3452 8.99504C4.34332 8.98597 4.3422 8.97664 4.34077 8.9674C4.33949 8.95904 4.33783 8.95074 4.33694 8.94233C4.33618 8.93541 4.33608 8.92833 4.33558 8.92133C4.33482 8.9103 4.334 8.89929 4.33393 8.88823C4.3339 8.88703 4.33373 8.88588 4.33373 8.88468C4.33373 8.87909 4.33439 8.87367 4.33459 8.86811C4.33492 8.85696 4.33525 8.84581 4.33628 8.83467C4.33697 8.82715 4.33816 8.8198 4.33919 8.81237C4.34054 8.80235 4.34187 8.79234 4.34378 8.78238C4.34534 8.77438 4.34735 8.76659 4.34924 8.75871C4.35145 8.74954 4.35364 8.74037 4.35635 8.73126C4.35879 8.72311 4.36167 8.71518 4.36448 8.70719C4.36749 8.69866 4.37043 8.69012 4.37387 8.68169C4.37724 8.67345 4.38108 8.6655 4.38485 8.65746C4.38855 8.64961 4.39212 8.64174 4.39622 8.634C4.40065 8.62562 4.40561 8.61755 4.41047 8.60943C4.41467 8.60245 4.4187 8.5954 4.42323 8.58855C4.42899 8.57992 4.43523 8.5717 4.44144 8.56342C4.44521 8.55841 4.44845 8.55318 4.45242 8.54827L4.83172 8.07698H4.0629C3.91924 8.07698 3.78146 8.02025 3.67988 7.91927C3.5783 7.81829 3.52123 7.68133 3.52123 7.53852C3.52123 7.39571 3.5783 7.25875 3.67988 7.15777C3.78146 7.05679 3.91924 7.00006 4.0629 7.00006H5.95873C6.06077 7.00006 6.16073 7.02871 6.2471 7.08271C6.33347 7.13671 6.40275 7.21386 6.44695 7.30528C6.49115 7.3967 6.50848 7.49867 6.49693 7.59945C6.48539 7.70023 6.44545 7.79572 6.38171 7.87493L5.78119 8.62113C6.07037 8.81407 6.28952 9.09429 6.40632 9.42045C6.52312 9.74662 6.53138 10.1015 6.42989 10.4326C6.3284 10.7638 6.12253 11.0538 5.84265 11.2599C5.56276 11.4659 5.22367 11.5771 4.8754 11.577ZM9.20873 11.0385C9.20873 11.1813 9.15166 11.3183 9.05008 11.4193C8.9485 11.5203 8.81072 11.577 8.66706 11.577C8.52341 11.577 8.38563 11.5203 8.28405 11.4193C8.18246 11.3183 8.1254 11.1813 8.1254 11.0385V8.61545L7.90872 8.77701C7.79378 8.86269 7.64932 8.89948 7.5071 8.87927C7.36488 8.85907 7.23656 8.78353 7.15037 8.66928C7.06418 8.55503 7.02717 8.41141 7.0475 8.27004C7.06782 8.12866 7.14381 8.0011 7.25874 7.91542L8.34208 7.10773C8.42256 7.04774 8.51825 7.01121 8.61843 7.00224C8.71862 6.99327 8.81934 7.0122 8.90931 7.05692C8.99928 7.10164 9.07494 7.17039 9.12783 7.25545C9.18071 7.34051 9.20873 7.43853 9.20873 7.53852V11.0385ZM11.9167 4.30775H1.08333V2.15391H2.70833V2.69237C2.70833 2.83518 2.7654 2.97214 2.86698 3.07312C2.96857 3.1741 3.10634 3.23083 3.25 3.23083C3.39366 3.23083 3.53143 3.1741 3.63302 3.07312C3.7346 2.97214 3.79167 2.83518 3.79167 2.69237V2.15391H9.20833V2.69237C9.20833 2.83518 9.2654 2.97214 9.36698 3.07312C9.46857 3.1741 9.60634 3.23083 9.75 3.23083C9.89366 3.23083 10.0314 3.1741 10.133 3.07312C10.2346 2.97214 10.2917 2.83518 10.2917 2.69237V2.15391H11.9167V4.30775Z"
                        fill="black"
                      />
                    </svg>
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="text-[#64605F]">Notice period:</span>
                    <span className="text-[#211C1A]">
                      {candidate.deployment_status || "Available"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[12px] leading-[-0.12px] font-bold">
                  <span className="pt-[2px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="12"
                      viewBox="0 0 13 12"
                      fill="none"
                    >
                      <path
                        opacity="0.8"
                        d="M12.451 9.56321C12.8072 8.90116 12.9956 8.16271 12.9999 7.4119C13.0042 6.66108 12.8243 5.92055 12.4757 5.2545C12.1271 4.58844 11.6204 4.01697 10.9994 3.58961C10.3785 3.16225 9.66208 2.89191 8.91231 2.80201C8.66598 2.22899 8.3055 1.71149 7.85261 1.2807C7.39971 0.849912 6.86377 0.514752 6.27708 0.295424C5.6904 0.0760949 5.06512 -0.0228613 4.43894 0.00451921C3.81275 0.0318997 3.19863 0.18505 2.63358 0.454739C2.06853 0.724429 1.56425 1.10507 1.15114 1.57373C0.73803 2.04239 0.424644 2.58935 0.229867 3.18166C0.0350913 3.77396 -0.037041 4.39935 0.017818 5.02011C0.072677 5.64088 0.253391 6.24418 0.549069 6.79364L0.190143 8.04283C0.150315 8.18134 0.14847 8.32792 0.1848 8.46738C0.221129 8.60684 0.29431 8.7341 0.39676 8.83598C0.499209 8.93785 0.627199 9.01063 0.767463 9.04678C0.907728 9.08293 1.05516 9.08112 1.19449 9.04155L2.4511 8.68462C2.9596 8.95523 3.51445 9.12907 4.08712 9.19721C4.34029 9.78601 4.71387 10.316 5.18411 10.7536C5.65435 11.1912 6.21099 11.5268 6.81866 11.739C7.42633 11.9513 8.07176 12.0355 8.71396 11.9865C9.35615 11.9375 9.98106 11.7562 10.549 11.4542L11.8056 11.8111C11.9449 11.8507 12.0923 11.8525 12.2326 11.8164C12.3728 11.7802 12.5008 11.7074 12.6033 11.6056C12.7057 11.5037 12.7789 11.3765 12.8153 11.237C12.8516 11.0976 12.8498 10.951 12.81 10.8125L12.451 9.56321ZM11.5522 9.26849C11.5198 9.32256 11.4989 9.38262 11.4908 9.44501C11.4826 9.50739 11.4874 9.57077 11.5048 9.63125L11.8597 10.8664L10.6174 10.5135C10.5566 10.4962 10.4929 10.4915 10.4301 10.4996C10.3674 10.5077 10.307 10.5285 10.2526 10.5606C9.82768 10.811 9.35683 10.9746 8.86757 11.042C8.3783 11.1093 7.88044 11.079 7.40309 10.9528C6.92575 10.8267 6.47848 10.6071 6.08746 10.3071C5.69643 10.0071 5.36948 9.63259 5.12573 9.20548C5.76169 9.14005 6.37718 8.94457 6.93352 8.63134C7.48986 8.31811 7.97505 7.89388 8.3586 7.38531C8.74215 6.87674 9.01578 6.2948 9.1623 5.67607C9.30882 5.05733 9.32507 4.41515 9.21002 3.78987C9.77729 3.92309 10.3051 4.18713 10.7507 4.56065C11.1964 4.93416 11.5474 5.40668 11.7754 5.94C12.0034 6.47333 12.102 7.05251 12.0632 7.63072C12.0244 8.20894 11.8494 8.76998 11.5522 9.26849Z"
                        fill="black"
                      />
                    </svg>
                  </span>
                  <div className="flex flex-row gap-[1px]">
                    <span className="text-[#64605F]">English:</span>
                    <span className="text-[#211C1A]">
                      {cleanClearanceStatus(candidate.clearance_status) || "B2"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[12px] leading-[-0.12px] font-bold">
                  <span className="pt-[2px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                    >
                      <path
                        opacity="0.8"
                        d="M12.6163 8.69977C12.6256 8.67834 12.6334 8.65628 12.6396 8.63375C13.1204 7.25123 13.1201 5.74694 12.6389 4.36457C12.633 4.3431 12.6255 4.32206 12.6167 4.30159C12.1627 3.044 11.3323 1.95669 10.2384 1.18747C9.14443 0.418259 7.84008 0.00446567 6.50263 0.00234964L6.5 6.10352e-05L6.49738 0.00234964C5.16005 0.0044627 3.85581 0.418176 2.76194 1.18725C1.66807 1.95633 0.837638 3.04347 0.383514 4.30089C0.374435 4.32188 0.366818 4.34348 0.360718 4.36552C-0.120522 5.74874 -0.120231 7.2539 0.361542 8.63693C0.367356 8.65753 0.374491 8.67773 0.382904 8.69741C0.836763 9.95525 1.66716 11.0428 2.76116 11.8122C3.85516 12.5817 5.15968 12.9956 6.49732 12.9977L6.5 13.0001L6.50269 12.9977C7.8399 12.9956 9.14402 12.5819 10.2378 11.813C11.3316 11.044 12.1621 9.95704 12.6163 8.69977ZM6.5 1.34926C7.22572 2.10099 7.77116 3.00768 8.09516 4.00091H4.90485C5.22884 3.00768 5.77428 2.10099 6.5 1.34926ZM4.90488 8.99915H8.09513C7.77113 9.99237 7.2257 10.8991 6.5 11.6508C5.7743 10.8991 5.22887 9.99237 4.90488 8.99915ZM4.6431 7.9995C4.4523 7.00895 4.4523 5.99111 4.6431 5.00056H8.3569C8.5477 5.99111 8.5477 7.00895 8.3569 7.9995H4.6431ZM9.37677 5.00056H11.7921C12.0693 5.981 12.0693 7.01906 11.7921 7.9995H9.37677C9.54108 7.0066 9.54108 5.99346 9.37677 5.00056ZM11.3983 4.00091H9.15048C8.85112 2.94765 8.33766 1.96744 7.64218 1.12153C8.44268 1.293 9.195 1.64032 9.84463 2.13833C10.4943 2.63634 11.025 3.27256 11.3983 4.00091H11.3983ZM7.64215 11.8785C8.33762 11.0326 8.85108 10.0524 9.15045 8.99915H11.3983C11.025 9.72751 10.4943 10.3637 9.84462 10.8617C9.19498 11.3598 8.44265 11.7071 7.64215 11.8785Z"
                        fill="black"
                      />
                    </svg>
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="text-[#64605F]">Location:</span>
                    <span className="text-[#211C1A]">
                      {candidate.location || "Remote"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[12px] leading-[-0.12px] font-bold ">
                  <span className="pt-[1px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                    >
                      <path
                        opacity="0.8"
                        d="M12.4786 8.76075C12.48 8.97188 12.4159 9.17824 12.2951 9.35143C12.1743 9.52462 12.0029 9.65614 11.8043 9.72788L8.44433 10.9658L7.20645 14.3258C7.13355 14.5236 7.00174 14.6943 6.82881 14.8148C6.65588 14.9354 6.45013 15.0001 6.23931 15.0001C6.02849 15.0001 5.82275 14.9354 5.64981 14.8148C5.47688 14.6943 5.34508 14.5236 5.27218 14.3258L4.03429 10.9658L0.674302 9.72788C0.47649 9.65498 0.305789 9.52318 0.185217 9.35025C0.0646446 9.17731 0 8.97157 0 8.76075C0 8.54993 0.0646446 8.34419 0.185217 8.17125C0.305789 7.99832 0.47649 7.86652 0.674302 7.79362L4.03429 6.55573L5.27218 3.19574C5.34508 2.99793 5.47688 2.82723 5.64981 2.70666C5.82275 2.58608 6.02849 2.52144 6.23931 2.52144C6.45013 2.52144 6.65588 2.58608 6.82881 2.70666C7.00174 2.82723 7.13355 2.99793 7.20645 3.19574L8.44433 6.55573L11.8043 7.79362C12.0029 7.86536 12.1743 7.99688 12.2951 8.17007C12.4159 8.34327 12.48 8.54962 12.4786 8.76075ZM8.81598 2.57673H9.84665V3.6074C9.84665 3.74408 9.90095 3.87516 9.99759 3.9718C10.0942 4.06844 10.2253 4.12274 10.362 4.12274C10.4987 4.12274 10.6297 4.06844 10.7264 3.9718C10.823 3.87516 10.8773 3.74408 10.8773 3.6074V2.57673H11.908C12.0447 2.57673 12.1757 2.52244 12.2724 2.4258C12.369 2.32915 12.4233 2.19808 12.4233 2.0614C12.4233 1.92472 12.369 1.79365 12.2724 1.697C12.1757 1.60036 12.0447 1.54607 11.908 1.54607H10.8773V0.515396C10.8773 0.37872 10.823 0.247643 10.7264 0.150999C10.6297 0.054355 10.4987 6.10352e-05 10.362 6.10352e-05C10.2253 6.10352e-05 10.0942 0.054355 9.99759 0.150999C9.90095 0.247643 9.84665 0.37872 9.84665 0.515396V1.54607H8.81598C8.67931 1.54607 8.54823 1.60036 8.45159 1.697C8.35494 1.79365 8.30065 1.92472 8.30065 2.0614C8.30065 2.19808 8.35494 2.32915 8.45159 2.4258C8.54823 2.52244 8.67931 2.57673 8.81598 2.57673ZM14.4847 4.63807H13.9693V4.12274C13.9693 3.98606 13.915 3.85499 13.8184 3.75834C13.7217 3.6617 13.5907 3.6074 13.454 3.6074C13.3173 3.6074 13.1862 3.6617 13.0896 3.75834C12.993 3.85499 12.9387 3.98606 12.9387 4.12274V4.63807H12.4233C12.2867 4.63807 12.1556 4.69237 12.0589 4.78901C11.9623 4.88565 11.908 5.01673 11.908 5.15341C11.908 5.29008 11.9623 5.42116 12.0589 5.5178C12.1556 5.61445 12.2867 5.66874 12.4233 5.66874H12.9387V6.18408C12.9387 6.32075 12.993 6.45183 13.0896 6.54847C13.1862 6.64512 13.3173 6.69941 13.454 6.69941C13.5907 6.69941 13.7217 6.64512 13.8184 6.54847C13.915 6.45183 13.9693 6.32075 13.9693 6.18408V5.66874H14.4847C14.6213 5.66874 14.7524 5.61445 14.8491 5.5178C14.9457 5.42116 15 5.29008 15 5.15341C15 5.01673 14.9457 4.88565 14.8491 4.78901C14.7524 4.69237 14.6213 4.63807 14.4847 4.63807Z"
                        fill="black"
                      />
                    </svg>{" "}
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="text-[#64605F]">Experience:</span>
                    <span className="text-gray-900">
                      {candidate.experience_years || "3"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-[40px] ml-10 ">
                <div className="w-full  flex flex-col items-start  relative">
                  <h3 className="text-[#A4A4A3] uppercase text-[10px] font-bold leading-[-0.1px] whitespace-nowrap">
                    Highlights:
                  </h3>
                  <p className="text-[#615D5C] text-start text-[12px] font-bold leading-[-0.12px] w-full">
                    {candidate.highlights ||
                      "Kairat’s recent project was a U.S.-based healthtech startup, where he built a mobile app that connected via Bluetooth to a physical sleep-tracking mask. The app integrated AI to provide sleep analytics, tips, and community features. He contributed advanced solutions like parallel reanimated animations (off the JS thread), Jest-based testing, and automated deployments with App Center and CodePush for seamless updates. Another key achievement was at a company, where he helped rebuild their mobile platform from scratch (React Native + native modules) to support 200K–300K daily active users, ensuring scalability and performance at high user loads."}{" "}
                  </p>
                  <div className="w-[calc(100%+10px)] h-[1px]  border-b border-dashed border-[#E5E5E5] absolute   -bottom-[20px] -left-2"></div>
                </div>

                <div className="w-full  flex flex-col items-start">
                  <h3 className="text-[#A4A4A3] uppercase text-[10px] font-bold leading-[-0.1px] whitespace-nowrap">
                    Requirements:{" "}
                  </h3>
                  <p className="text-[#615D5C] text-start text-[12px] font-bold leading-[-0.12px]">
                    {candidate.requirements ||
                      "	•	7+ years of experience in React Native and mobile development Has shipped apps to App Store & Google Play and also has experience with automated pipelines (App Center, GitHub/GitLab CI/CD, CodePush) Worked on hardware-integrated apps (Bluetooth mask device) and optimized native code Has been working with advanced animations & gesture handling (Reanimated, parallel native threads) Has been in collaboration with designers, backend, QA, PMs in a cross-functional setup, comfortable working in startup environment"}{" "}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full h-[1px] mb-[24px] border-t border-dashed border-[#E5E5E5]"></div>

            <div className="w-full bg-[#F5F5F5] px-[26px] py-[20px] rounded-lg mb-10">
              <div className="flex flex-row items-center gap-2 justify-center mb-4">
                <div className="w-[216px] h-[1px] border-t border-dashed border-[#E5E5E5]"></div>
                <h3 className="text-[#A4A4A3] uppercase text-[10px] font-bold leading-[-0.1px] whitespace-nowrap">
                  RM opinion
                </h3>
                <div className="w-[216px] h-[1px] border-t border-dashed border-[#E5E5E5]"></div>
              </div>
              <p className="text-[#615D5C] text-center text-[12px] font-bold leading-[-0.12px]">
                {candidate.opinion || "No opinion"}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white  flex items-center justify-between border-[#E3E3E3] p-6 rounded-b-md">
          <div className="text-left ">
            <div className="flex flex-row">
              <p className="text-2xl font-normal text-[#211C1A] leading-[21.6px] font-eb-garamond">
                ${candidate.salary.toLocaleString()}
              </p>
              <span className="text-[12px] text-[#211C1A] font-bold mt-[6px]">
                {" "}
                /month
              </span>
            </div>
            <p className="text-[12px] text-[#A6A4A3] font-bold">
              +Equity Package
            </p>
          </div>
          {isRejected && (
            <div className="absolute bottom-[9px] right-4 bg-[#1C2831] w-[451px] h-[126px] p-[12px]  rounded-lg flex flex-col justify-center gap-2 ">
              <h4 className="text-white text-[24px] font-normal  font-eb-garamond leading-[21.6px] w-[270px]">
                Make candidate matches more precise for you
              </h4>
              <div className="flex flex-row items-center gap-1">
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection"
                  className="w-[330px] border border-[#49535A] bg-transparent rounded-md px-3 py-2 outline-none text-[12px] text-[#BBBEC1]"
                />
                <button
                  className="flex items-center bg-[#2A353D] text-white justify-center text-[14px] leading-[-0.14px] font-bold    w-[92px] h-[40px] rounded-md  "
                  onClick={() => {
                    handleReject(candidate.id);
                  }}
                >
                  [R] Reject
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1 justify-center">
            <button
              className="flex items-center justify-center text-[14px] leading-[-0.14px] font-bold  bg-[#D3EBE2] w-[105px] h-[44px] rounded-md hover:bg-green-200 transition-colors "
              onClick={() => handleInterview(candidate.id)}
            >
              [A] Approve
            </button>
            <button
              className="flex items-center justify-center text-[14px] leading-[-0.14px] font-bold  border border-[#E5E5E5] w-[105px] h-[44px] rounded-md hover:bg-gray-50 transition-colors "
              onClick={() => handleHold(candidate.id)}
            >
              [H] Hold
            </button>
            <button
              className="flex items-center justify-center text-[14px] leading-[-0.14px] font-bold  border border-[#E5E5E5] w-[105px] h-[44px] rounded-md hover:bg-gray-50 transition-colors "
              onClick={() => setIsRejected(true)}
            >
              [R] Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
