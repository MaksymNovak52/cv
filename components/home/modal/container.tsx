"use client";
import {
  MAX_SWIPE_TIME,
  SWIPE_THRESHOLD,
  VERTICAL_RESTRAINT,
} from "@/constants";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/provider";
import {
  useToggleFavorite,
  useUpdateApplicationStatus,
} from "@/queries/candidates";
import { CandidateRow, Job } from "@/type";
import { PlusCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  CandidateArrow,
  CandidateFooter,
  CandidateList,
  LeftAsside,
  MockVacancy,
  ModalHeader,
  NewCandidatesList,
  RightAsside,
  RmOpinion,
} from "./index";

interface CandidateModalProps {
  candidate: CandidateRow;
  candidates: CandidateRow[];
  isOpen: boolean;
  onClose: () => void;
  selectedJobId: string;
  onCandidateChange: (candidate: CandidateRow) => void;
  jobDetails: Job;
  onEditCandidate: (candidate: CandidateRow) => void;
  handleDeleteCandidate: (id: string) => void;
}

export function CandidateModal({
  candidate,
  jobDetails,
  candidates,
  isOpen,
  onClose,
  selectedJobId,
  onCandidateChange,
  onEditCandidate,
  handleDeleteCandidate,
}: CandidateModalProps) {
  const currentIndex = candidates.findIndex((c) => c.id === candidate.id);
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { mutate: rejectStatus } = useUpdateApplicationStatus();
  const swipeState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    active: false,
  });
  const [hasScroll, setHasScroll] = useState(false);
  const [rejectionError, setRejectionError] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const { isAdmin, user } = useUser();
  const [comments, setComments] = useState<
    {
      author_email: string;
      comment: string;
      id: string;
    }[]
  >([]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = async () => {
    if (newComment.trim().length === 0) {
      return;
    }

    try {
      await supabase.rpc("add_rejection_comment", {
        application_id: candidate.application_id,
        comment: newComment.trim(),
        author_id: user?.id,
      });

      fetchRejectionComments(candidate.application_id);

      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrolled = el.scrollTop > 0;
      setHasScroll(scrolled);
    };

    el.addEventListener("scroll", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isInteractiveTarget = (t: EventTarget | null) => {
    if (!(t instanceof Element)) return false;
    return !!t.closest(
      'input, textarea, select, [contenteditable="true"], button, a'
    );
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (candidates.length <= 1) return;
    if (isInteractiveTarget(e.target)) return;

    const touch = e.changedTouches[0];
    swipeState.current.startX = touch.clientX;
    swipeState.current.startY = touch.clientY;
    swipeState.current.startTime = Date.now();
    swipeState.current.active = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (candidates.length <= 1) return;
    if (isInteractiveTarget(e.target)) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - swipeState.current.startX;
    const dy = touch.clientY - swipeState.current.startY;

    if (
      !swipeState.current.active &&
      Math.abs(dx) > 12 &&
      Math.abs(dx) > Math.abs(dy) * 1.2
    ) {
      swipeState.current.active = true;
    }

    if (swipeState.current.active) {
      e.preventDefault();
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (candidates.length <= 1) return;
    if (isInteractiveTarget(e.target)) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - swipeState.current.startX;
    const dy = touch.clientY - swipeState.current.startY;
    const dt = Date.now() - swipeState.current.startTime;

    const isSwipe =
      Math.abs(dx) >= SWIPE_THRESHOLD &&
      Math.abs(dy) <= VERTICAL_RESTRAINT &&
      dt <= MAX_SWIPE_TIME;

    if (isSwipe) {
      if (dx < 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    swipeState.current.active = false;
  };

  const goToPrevious = () => {
    if (candidates.length <= 1) return;

    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevCandidate = candidates[prevIndex];

      if (prevCandidate && prevCandidate.id) {
        onCandidateChange(prevCandidate);
      }
    }
  };

  const goToNext = () => {
    if (candidates.length <= 1) return;

    if (currentIndex < candidates.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextCandidate = candidates[nextIndex];

      if (nextCandidate && nextCandidate.id) {
        onCandidateChange(nextCandidate);
      }
    }
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

  const handleReject = async (id: string) => {
    try {
      if (rejectionReason.trim().length < 1) {
        setRejectionError("Please provide a reason for rejection");
        return;
      }

      await addRejectionComment(
        candidate.application_id,
        rejectionReason.trim()
      );

      await rejectStatus({
        applicationId: candidate.application_id,
        statusName: "Rejected",
        rejectionReason: rejectionReason.trim(),
      });
      setIsRejected(true);
      setRejectionReason("");
      onClose();
    } catch (error) {
      console.error("Failed to reject candidate:", error);
    }
  };

  const handleUnReject = async (id: string) => {
    try {
      await removeRejectionComments(candidate.application_id);

      await rejectStatus({
        applicationId: candidate.application_id,
        statusName: "Pending",
        rejectionReason: "",
      });

      setIsRejected(false);
    } catch (error) {
    } finally {
      setRejectionReason("");
      onClose();
    }
  };

  const addRejectionComment = async (
    applicationId: string,
    comment: string
  ) => {
    await supabase.rpc("add_rejection_comment", {
      application_id: applicationId,
      comment: comment,
      author_id: user?.id,
    });
  };
  const removeRejectionComments = async (applicationId: string) => {
    const { data, error } = await supabase
      .from("rejection_comments")
      .delete()
      .eq("application_id", applicationId);

    if (error) {
      console.error("Помилка при видаленні коментарів:", error);
      return;
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
  const { mutate: toggleFav } = useToggleFavorite(selectedJobId);
  const handleFavorite = async (id: string) => {
    try {
      const newValue = !candidate.is_favorite;

      toggleFav(id);

      onCandidateChange({
        ...candidate,
        is_favorite: newValue,
      });
    } catch (error) {
      console.error("❌ Failed to toggle favorite:", error);
    }
  };

  const fetchRejectionComments = async (applicationId: string) => {
    const { data, error } = await supabase.rpc(
      "fetch_rejection_comments_with_email",
      {
        app_id: applicationId,
      }
    );

    if (error) {
      console.error("Error fetching rejection comments:", error);
      return;
    }

    setComments(data || []);
  };

  useEffect(() => {
    if (candidate.application_id) {
      fetchRejectionComments(candidate.application_id);
    }
  }, [candidate.application_id]);

  useEffect(() => {
    fetchRejectionComments(candidate.application_id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-md overflow-hidden">
      <div className="bg-white mt-[120px] lg:mt-0  min-[2000px]:w-[1200px] w-[98%] lg:w-[636px] lg:h-[99%] rounded-md max-w-4xl max-h-screen relative flex flex-col">
        <NewCandidatesList
          counts={candidates.length}
          title={jobDetails.title}
        />
        <div
          className="fixed right-[32px] cursor-pointer flex flex-col items-start top-[24px] lg:top-[28px] text-[16px] text-white font-bold leading-[-0.16px] z-10"
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
        {candidates.length >= 2 && <MockVacancy />}
        <CandidateList
          candidates={candidates}
          candidate={candidate}
          handleCandidateClick={handleCandidateClick}
        />

        <div
          className="flex-1 overflow-y-auto pb-20 touch-pan-y border-t "
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          ref={contentRef}
        >
          <CandidateArrow
            counts={candidates.length}
            goToPrevious={goToPrevious}
            goToNext={goToNext}
            isBackBlock={currentIndex > 0}
            isNextBlock={currentIndex < candidates.length - 1}
          />
          <div className="flex-1 pb-20 ">
            <div className="px-6 ">
              <ModalHeader
                candidate={candidate}
                onCandidateChange={onCandidateChange}
                onEditCandidate={onEditCandidate}
                isAdmin={isAdmin}
                onClose={onClose}
                handleDeleteCandidate={handleDeleteCandidate}
                toggleFav={handleFavorite}
              />

              <div
                className={`${
                  candidate.full_name.length >= 13 ? "mt-[10px]" : "mt-[18px]"
                } w-full h-[1px] mt-[10px] mb-[22px] border-t border-dashed border-[#E5E5E5]`}
              ></div>

              <div className="w-full flex flex-col lg:flex-row gap-2 justify-between relative">
                <div className="w-[2px] hidden lg:block h-[calc(100%+12px)] border-l border-dashed border-[#E5E5E5] absolute left-[126px] -top-[18px]"></div>
                <LeftAsside candidate={candidate} />
                <RightAsside candidate={candidate} />
              </div>
              <div className="w-full h-[1px] mb-[24px] border-t border-dashed border-[#E5E5E5]"></div>
              <RmOpinion opinion={candidate.opinion} />
              {comments.length > 0 &&
                candidate.rejection_reason &&
                candidate.rejection_reason?.length > 0 && (
                  <div className="w-full bg-[#F5F5F5] px-[26px] mt-4 py-[20px] rounded-lg mb-[100px] lg:mb-0 overflow-hidden">
                    <div className="flex flex-row items-center gap-2 justify-center mb-4">
                      <div className="w-[115px] lg:w-[216px] h-[1px] border-t border-dashed border-[#E5E5E5]"></div>
                      <h3 className="text-[#FF3636] uppercase text-[10px] font-bold leading-[-0.1px] whitespace-nowrap">
                        Reason for rejection
                      </h3>
                      <div className="w-[115px] lg:w-[216px] h-[1px] border-t border-dashed border-[#E5E5E5]"></div>
                    </div>
                    <div className="w-full flex flex-col items-start justify-between flex-wrap ">
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <div key={comment.id} className="mb-4 w-full">
                            <div className="text-[#615D5C] text-start text-[12px] font-bold leading-[-0.12px]  flex flex-col items-start justisfy-start">
                              <div className="">
                                <p className="text-[#615D5C] text-sm">
                                  {"Email:"} {comment.author_email}
                                </p>
                              </div>
                              <div className="flex flex-row items-start gap-2">
                                <p className="text-[#615D5C] text-sm">
                                  {"Reason:"}
                                </p>
                                <p className="text-[#FF3636] text-sm ">
                                  {comment.comment}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[#615D5C] text-center text-[12px] font-bold leading-[-0.12px]">
                          No comments yet.
                        </p>
                      )}
                    </div>

                    <div className="py-2 overflow-hidden w-[40px] h-[40px] hover:min-w-[270px] border  border-[#E5E5E5] shadow-[2px_2px_20px_rgba(0,0,0,0.08)] rounded-lg flex justify-between group items-center hover:duration-300 duration-300">
                      <div className="flex items-center justify-center fill-white pl-2">
                        <PlusCircle />
                      </div>
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="outline-none text-xs bg-transparent w-[120px] text-[#615D5C] font-normal px-4"
                      />
                      <button
                        onClick={handleAddComment}
                        className="flex items-center justify-center text-[14px] leading-[-0.14px] font-bold  border border-[#E5E5E5] w-[105px] h-[44px] rounded-md hover:bg-gray-50 transition-colors "
                      >
                        Add Reason
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>

          <CandidateFooter
            isAdmin={isAdmin}
            candidate={candidate}
            hasScroll={hasScroll}
            isRejected={isRejected}
            handleReject={handleReject}
            rejectionReason={rejectionReason}
            rejectionError={rejectionError}
            setRejectionReason={setRejectionReason}
            handleUnReject={handleUnReject}
            handleInterview={handleInterview}
            handleHold={handleHold}
            setIsRejected={setIsRejected}
            setRejectionError={setRejectionError}
          />
        </div>
      </div>
    </div>
  );
}
