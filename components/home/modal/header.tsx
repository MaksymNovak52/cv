import { pickAvatar } from "@/lib/avatar";
import { CandidateRow } from "@/type";
import Link from "next/link";

export function ModalHeader({
  candidate,
  isAdmin,
  onEditCandidate,
  onClose,
}: {
  candidate: CandidateRow;
  isAdmin: boolean;
  onClose: () => void;
  onCandidateChange: (candidate: CandidateRow) => void;
  onEditCandidate: (candidate: CandidateRow) => void;
}) {
  return (
    <div className="sticky top-0 bg-white z-10 pb-4 pt-6">
      <div className="flex flex-row items-center justify-between">
        <div className="lg:flex flex-row items-center hidden ">
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

            <span className="text-white text-[8px] uppercase leading-[-0.08px] rounded-[4px]  py-[3px] px-[5px] font-bold flex items-center justify-center bg-[#259A6D]  w-auto max-w-[72px] mt-4">
              {candidate.status === "Pending"
                ? "New"
                : candidate.status === "Hold"
                ? "Not sure"
                : candidate.status || "To interview"}
            </span>
          </div>
        </div>
        <div className="absolute top-[16px] right-0  block lg:hidden">
          <img
            src={pickAvatar(candidate)}
            alt="profile"
            className="w-[64px] h-[64px] rounded-full object-cover"
          />
          <span className="text-white text-[8px] leading-[-0.08px] rounded-[4px]  py-[3px] px-[5px] font-bold flex items-center justify-center bg-[#259A6D]  w-auto max-w-[72px] relative top-[-10px]">
            {candidate.status === "Pending"
              ? "New"
              : candidate.status === "Hold"
              ? "Not sure"
              : candidate.status || "To interview"}
          </span>
        </div>
        <div className="flex items-start gap-2 flex-col w-1/2 text-start">
          <h3 className=" lg:hidden text-[40px] font-medium text-[#211C1A] font-eb-garamond  leading-[36px] break-words ">
            {/* {candidate.full_name.length > 11
                        ? candidate.full_name.slice(0, 11) + "..."
                        : candidate.full_name} */}
            {candidate.full_name}
          </h3>
          <p className="text-[#A6A4A3] text-[12px] text-start font-bold leading-[-0.12px] max-w-[90%]">
            {candidate.current_title ||
              "Multidisciplinary Designer & Artist, Interactive Design, 3D & Motion"}
          </p>
          {isAdmin && (
            <button
              className="p-[6px]   hover:bg-gray-100 rounded-md transition-colors absolute right-[0px] top-[20px] "
              onClick={(e) => {
                e.stopPropagation();
                onEditCandidate(candidate);
                onClose();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
              >
                <path
                  d="M14.4375 2.53479C14.7524 2.53479 15.0546 2.65975 15.2773 2.88245L19.1172 6.72327C19.3397 6.94587 19.4647 7.24738 19.4648 7.56213C19.4648 7.87708 19.3399 8.17928 19.1172 8.40198L8.45703 19.0621H4.125C3.81006 19.0621 3.50786 18.9372 3.28516 18.7145C3.06258 18.4918 2.9375 18.1895 2.9375 17.8746V14.0348C2.9375 13.8789 2.96868 13.7247 3.02832 13.5807C3.088 13.4366 3.17489 13.3052 3.28516 13.1949L13.5977 2.88245C13.8204 2.65975 14.1226 2.53479 14.4375 2.53479Z"
                  stroke="#211C1A"
                />
                <path d="M11.6875 5.5L16.5 10.3125" stroke="#211C1A" />
              </svg>
            </button>
          )}
          <div className="flex flex-row items-center gap-2">
            {candidate.portfolio_url && (
              <div className="flex flex-row items-center gap-1">
                <Link
                  href={candidate.portfolio_url || candidate.linkedin_url}
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
            {candidate.linkedin_url && (
              <div className="flex flex-row items-center gap-1 cursor-pointer">
                <Link
                  target="_blank"
                  href={candidate.linkedin_url}
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
  );
}
