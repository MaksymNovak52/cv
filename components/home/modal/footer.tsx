import { CandidateRow } from "@/type";
import { useEffect } from "react";

export function CandidateFooter({
  candidate,
  hasScroll,
  isRejected,
  handleReject,
  rejectionReason,
  rejectionError,
  setRejectionReason,
  handleUnReject,
  handleInterview,
  handleHold,
  setIsRejected,
  isAdmin,
  setRejectionError,
}: {
  isAdmin: boolean;
  candidate: CandidateRow;
  hasScroll: boolean;
  isRejected: boolean;
  handleReject: (id: string) => void;
  rejectionReason: string;
  rejectionError: string;
  setRejectionReason: (reason: string) => void;
  handleUnReject: (id: string) => void;
  handleInterview: (id: string) => void;
  handleHold: (id: string) => void;
  setIsRejected: (rejected: boolean) => void;
  setRejectionError: (error: string) => void;
}) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (candidate.rejection_reason) {
        if (e.key.toLowerCase() === "r") handleUnReject(candidate.id);
        return;
      }

      switch (e.key.toLowerCase()) {
        case "a":
          !isRejected && handleInterview(candidate.id);
          break;
        case "h":
          !isRejected && handleHold(candidate.id);
          break;
        case "r":
          setIsRejected(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    candidate.id,
    handleInterview,
    handleHold,
    handleReject,
    isRejected,
    setIsRejected,
  ]);
  return (
    <div
      className={`absolute bottom-10 lg:bottom-0 left-0 right-0 bg-white flex lg:flex-row ${
        candidate.rejection_reason
          ? "flex-row items-center"
          : "flex-col items-start"
      } lg:items-center justify-between p-6 rounded-b-md
${hasScroll ? "border-t border-[#E3E3E3]" : ""}`}
      style={{
        boxShadow: hasScroll ? "1px -9px 5px 0px rgba(0,0,0,0.04)" : "",
      }}
    >
      <div className="text-left">
        <div className="flex flex-row ">
          <p className="text-2xl font-normal text-[#211C1A] leading-[21.6px] font-eb-garamond">
            ${candidate.salary.toLocaleString()}
          </p>
          <span className="text-[12px] text-[#211C1A] font-bold mt-[6px]">
            /month
          </span>
        </div>
        <div className="h-[20px]">
          {candidate.has_equity && (
            <p className="text-[12px] text-[#A6A4A3] font-bold">
              +Equity Package
            </p>
          )}
        </div>
      </div>
      {isRejected && (
        <div className="absolute bottom-[24px] lg:bottom-[9px] right-[1.5px]  z-[20] lg:right-4 bg-[#1C2831] w-full  lg:w-[451px] h-[126px] p-[12px]  rounded-lg flex flex-col justify-center gap-2 ">
          <h4
            className={`${
              rejectionError ? "text-[#FF3636] mb-2" : "text-white"
            } text-[24px] font-normal  font-eb-garamond leading-[21.6px] lg:w-[270px]`}
          >
            {rejectionError
              ? "Enter rejection reason"
              : " Make candidate matches more precise for you"}{" "}
          </h4>
          <div className="flex flex-row items-center gap-1">
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (rejectionError) setRejectionError("");
              }}
              placeholder="Reason for rejection"
              className={`
              w-[330px] border  bg-transparent rounded-md px-3 py-2 outline-none text-[12px] 
              ${
                rejectionError
                  ? "border-[#FF3636] text-[#FF3636] placeholder-[#FF3636]"
                  : "border-[#49535A] text-[#BBBEC1]"
              }
              `}
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
      <div className="flex items-center gap-1 justify-center z-10">
        {candidate.rejection_reason ? (
          <>
            {" "}
            <button
              className="flex items-center justify-center text-[14px] leading-[-0.14px] font-bold  border border-[#E5E5E5] w-[105px] h-[44px] rounded-md hover:bg-gray-50 transition-colors "
              onClick={() => handleUnReject(candidate.id)}
            >
              [R] Unreject
            </button>
          </>
        ) : (
          <>
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
              [H] No sure
            </button>
            <button
              className="flex items-center justify-center text-[14px] leading-[-0.14px] font-bold  border border-[#E5E5E5] w-[105px] h-[44px] rounded-md hover:bg-gray-50 transition-colors "
              onClick={() => setIsRejected(true)}
            >
              [R] Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}
