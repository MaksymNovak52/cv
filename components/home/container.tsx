"use client";

import { useIsMobile } from "@/hooks";
import { normalizeToTab } from "@/lib/candidate";
import { useCandidatesContext, useUser } from "@/provider";
import {
  useCandidatesByJob,
  useFavoritesCount,
  useJobDetails,
  useJobsByOrganization,
  usePendingCountsForAllJobs,
} from "@/queries/candidates";
import { CandidateRow, Job, TabKey } from "@/type";
import Cookies from "js-cookie";
import { useEffect, useMemo, useRef, useState } from "react";
import { CustomTabs, Dotbage, GridViewContainer } from "../ui";
import { CreateJobCandidateModal } from "./candidat-form/container";
import { CandidatesList } from "./list";
import { CandidateModal } from "./modal";
import { CandidatesTable } from "./table";
import { Card, JobOption, MobileJobSelect } from "./vacantion-card";

function VisibleCandidatesTracker({
  totalCandidates,
}: {
  totalCandidates: number;
}) {
  const [seenCount, setSeenCount] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const seenRowsRef = useRef(new Set<number>());

  useEffect(() => {
    seenRowsRef.current.clear();
    setSeenCount(0);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const rowIndex = parseInt(
            entry.target.getAttribute("data-row-index") || "0",
            10
          );
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            if (!seenRowsRef.current.has(rowIndex)) {
              seenRowsRef.current.add(rowIndex);
              setSeenCount(seenRowsRef.current.size);
            }
          }
        });
      },
      { threshold: 0.5, rootMargin: "0px" }
    );

    const tableRows = document.querySelectorAll("tbody tr");
    tableRows.forEach((row, index) => {
      row.setAttribute("data-row-index", index.toString());
      observerRef.current?.observe(row);
    });

    return () => observerRef.current?.disconnect();
  }, [totalCandidates]);

  return (
    <div className="w-[170px] h-[40px] bg-[#211C1A] fixed bottom-2 left-1/2 transform -translate-x-1/2 rounded-[4px] flex flex-col items-center justify-center ">
      <div className="flex flex-row items-center mb-1 gap-1">
        <p className="text-white text-[12px] font-bold leading-[-0.12px] ">
          {seenCount} out
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
                ? `${(seenCount / totalCandidates) * 100}%`
                : "0%",
          }}
        />
      </div>
    </div>
  );
}

export function AllCandidatesList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCandidate, setEditCandidate] = useState<CandidateRow | null>(null);
  const [editApplicationId, setEditApplicationId] = useState<
    string | undefined
  >(undefined);
  const { isAdmin } = useUser();
  const [activeTab, setActiveTab] = useState<TabKey>("new");
  const [isStickyBtn, setIsStickyBtn] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const {
    selectedJobId,
    setSelectedJobId,
    selectedCandidate,
    isModalOpen,
    handleCandidateClick,
    handleCloseModal,
    handleCandidateChange,
    viewMode,
    setViewMode,
  } = useCandidatesContext();

  const orgId = Cookies.get("organizationId");
  const { data: jobs, isLoading: jobsLoading } = useJobsByOrganization(
    orgId as string
  );
  const { data: jobDetails } = useJobDetails((selectedJobId || "") as string);
  const { data: candidatesByJob = [], refetch } = useCandidatesByJob(
    (selectedJobId || "") as string
  );
  const { data: favoritesCount } = useFavoritesCount(
    (selectedJobId || "") as string
  );
  const { data: pendingCounts = [] } = usePendingCountsForAllJobs();

  const isMobile = useIsMobile(450);
  const effectiveViewMode = isMobile ? 2 : viewMode;

  const counts = useMemo(() => {
    let c = { new: 0, interview: 0, notSure: 0, reject: 0 };
    for (const cand of candidatesByJob) {
      const status =
        cand.status ??
        (cand as any).status_name ??
        (cand as any).current_status_name ??
        "";
      const bucket = normalizeToTab(status);
      if (bucket === "new") c.new++;
      else if (bucket === "interview") c.interview++;
      else if (bucket === "not-sure") c.notSure++;
      else if (bucket === "reject") c.reject++;
    }
    return c;
  }, [candidatesByJob]);

  const filteredCandidates = useMemo(() => {
    let list = candidatesByJob.filter((cand) => {
      const status =
        cand.status ??
        (cand as any).status_name ??
        (cand as any).current_status_name ??
        "";
      return normalizeToTab(status) === activeTab;
    });

    if (showFavoritesOnly) {
      list = list.filter((cand) => cand.is_favorite === true);
    }

    return list;
  }, [candidatesByJob, activeTab, showFavoritesOnly]);

  useEffect(() => {
    if ((!selectedJobId && jobs?.[0]?.job_id) || jobs?.length === 1) {
      setSelectedJobId(jobs?.[0]?.job_id);
    }
  }, [jobs, selectedJobId, setSelectedJobId]);

  const options: JobOption[] = (jobs ?? []).map((job: Job) => ({
    id: job.job_id,
    title: job.title,
    newCount:
      pendingCounts.find((c) => c.job_id === job.job_id)?.pending_count ?? 0,
    dotClass: "bg-[#259A6D]",
  }));

  const handleEditCandidate = (c: CandidateRow) => {
    setEditCandidate(c);
    setEditApplicationId(c.application_id);
    setIsEditModalOpen(true);
  };
  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete candidate");
      }
      refetch();
    } catch (e) {
      console.error("❌ Error deleting candidate:", e);
    }
  };

  return (
    <main className="overflow-hidden">
      <div className="flex flex-row mt-6 lg:w-[1416px] mx-auto gap-1 overflow-x-scroll scrollbar-hide">
        {!jobs?.length && (
          <section
            className={`flex w-[140px] flex-row justify-between items-center px-2 cursor-pointer transition-all duration-300`}
          >
            <div
              className={`flex flex-row justify-between flex-1 items-center bg-white h-[42px] rounded-lg px-2`}
            >
              <div className="flex flex-row gap-4 items-center">
                <span className={`w-[7px] h-[7px] rounded-full`} />
                <h4 className="text-[#211C1A] text-[14px] font-semibold">
                  No jobs
                </h4>
              </div>
            </div>
          </section>
        )}

        {jobs?.map((job: Job) => {
          const count =
            pendingCounts.find((c) => c.job_id === job.job_id)?.pending_count ??
            0;
          return (
            <Card
              key={job.job_id}
              id={job.job_id}
              title={job.title}
              newCount={count}
              skills={job.skills ?? []}
              description={job.description ?? ""}
              onClick={() => setSelectedJobId(job.job_id)}
              isActive={selectedJobId === job.job_id}
            />
          );
        })}

        {!!jobs?.length && (
          <MobileJobSelect
            options={options}
            value={(selectedJobId || "") as string}
            onChange={setSelectedJobId}
          />
        )}
      </div>

      <section
        className={`max-w-[1416px] mx-2   p-8 lg:mx-auto bg-[#F3F2F1] min-h-[526px] mb-10  relative 
        ${isMobile && "rounded-lg"}
          ${
            selectedJobId == null
              ? "rounded-tr-lg rounded-b-lg"
              : "rounded-b-lg rounded-tr-lg"
          }
          transition-all duration-300`}
      >
        <div className="w-full flex flex-col lg:flex-row items-start justify-between">
          <span className="text-[#211C1A] text-[12px] font-semibold max-w-[70%]">
            {jobDetails?.description ?? "No description"}
          </span>

          <div className="flex flex-row flex-wrap w-[330px] gap-2">
            {jobDetails?.skills?.map((tag: string, i: number) => (
              <Dotbage tag={tag} key={i} />
            ))}
          </div>

          <div className="flex flex-row items-start mt-10 sm:mt-0 justify-start gap-2 ">
            <button
              className={`w-[104px] lg:w-[146px] h-[40px] ${
                showFavoritesOnly && "bg-[#cdcccc]"
              } transition-all duration-300 gap-1 rounded-[4px] border flex items-center justify-center border-[#E0DFDD] text-[14px] font-semibold text-[#211C1A]`}
              onClick={() => setShowFavoritesOnly((prev) => !prev)}
            >
              <p className="hidden lg:block">[{favoritesCount || 0}]</p>
              Favorites
            </button>
            {isAdmin && (
              <button
                className="w-[104px] lg:w-[129px] h-[40px] flex items-center justify-center gap-1 bg-[#597D9B] text-[14px] font-bold rounded-[4px] text-white"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <p className="hidden lg:block">[V]</p>
                Vacancy
              </button>
            )}
          </div>
        </div>

        <div className="h-[1px] w-full border-dashed border-[1px] border-[#E3E3E3] mt-10" />

        <div
          className={`flex flex-1 justify-between items-center ${
            isStickyBtn && "fixed w-full top-0 left-0 bg-red-400"
          }`}
        >
          <CustomTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            counts={{
              new: counts.new,
              interview: counts.interview,
              notSure: counts.notSure,
              reject: counts.reject,
            }}
          />
          <GridViewContainer choosed={viewMode} setChosen={setViewMode} />
        </div>

        {!filteredCandidates.length && (
          <div className="text-center mt-10 ">
            No candidates in{" "}
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tabs
          </div>
        )}

        {effectiveViewMode === 2 ? (
          <CandidatesList
            candidatesByJob={filteredCandidates}
            selectedJobId={(selectedJobId || "") as string}
            handleCandidateClick={handleCandidateClick}
            onEditCandidate={handleEditCandidate}
            handleDeleteCandidate={handleDeleteCandidate}
          />
        ) : (
          <CandidatesTable
            handleDeleteCandidate={handleDeleteCandidate}
            setIsStickyBtn={setIsStickyBtn}
            candidatesByJob={filteredCandidates}
            selectedJobId={(selectedJobId || "") as string}
            handleCandidateClick={handleCandidateClick}
            onEditCandidate={handleEditCandidate}
          />
        )}

        {filteredCandidates.length > 0 && effectiveViewMode === 1 && (
          <VisibleCandidatesTracker
            totalCandidates={filteredCandidates.length}
          />
        )}

        {selectedCandidate && filteredCandidates && (
          <CandidateModal
            jobDetails={jobDetails}
            candidate={selectedCandidate}
            candidates={filteredCandidates}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            selectedJobId={(selectedJobId || "") as string}
            onCandidateChange={handleCandidateChange}
            onEditCandidate={handleEditCandidate}
          />
        )}
      </section>

      <CreateJobCandidateModal
        open={isCreateModalOpen}
        setOpen={setIsCreateModalOpen}
        mode="create"
        initialCandidate={null}
        initialJobId={selectedJobId || null}
      />

      <CreateJobCandidateModal
        open={isEditModalOpen}
        setOpen={setIsEditModalOpen}
        mode="edit"
        initialCandidate={editCandidate}
        initialJobId={selectedJobId || null}
        applicationId={editApplicationId}
      />
    </main>
  );
}
