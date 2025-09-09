"use client";
import { useIsMobile } from "@/hooks";
import { useCandidatesContext } from "@/provider";
import {
  useCandidatesByJob,
  useFavoritesCount,
  useJobDetails,
  useJobs,
  usePendingCountsForAllJobs,
} from "@/queries/candidates";
import { Job } from "@/type";
import { useEffect, useMemo, useRef, useState } from "react";
import { CustomTabs, Dotbage, GridViewContainer } from "../ui";
import { CandidatesList } from "./list";
import { CandidateModal } from "./modal";
import { CandidatesTable } from "./table";
import { Card, JobOption, MobileJobSelect } from "./vacantion-card";

type TabKey = "new" | "interview" | "not-sure" | "reject";

function normalizeToTab(statusRaw?: string | null): TabKey {
  const s = (statusRaw || "").trim().toLowerCase();

  if (!s) return "new";

  if (/(reject|rejected|declin)/.test(s)) return "reject";

  if (/(hold|not[\s_-]?sure)/.test(s)) return "not-sure";

  if (/interview/.test(s)) return "interview";

  if (/(new|pending|applied|submitted)/.test(s)) return "new";

  return "new";
}

function VisibleCandidatesTracker({
  totalCandidates,
}: {
  totalCandidates: number;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const visibleRowsRef = useRef(new Set<number>());

  useEffect(() => {
    visibleRowsRef.current.clear();
    setVisibleCount(0);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const rowIndex = parseInt(
            entry.target.getAttribute("data-row-index") || "0"
          );

          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            visibleRowsRef.current.add(rowIndex);
          } else {
            visibleRowsRef.current.delete(rowIndex);
          }
        });

        setVisibleCount(visibleRowsRef.current.size);
      },
      {
        threshold: 0.5,
        rootMargin: "0px",
      }
    );

    const tableRows = document.querySelectorAll("tbody tr");
    tableRows.forEach((row, index) => {
      row.setAttribute("data-row-index", index.toString());
      observerRef.current?.observe(row);
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

export function AllCandidatesList() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("new");
  const [isStickyBtn, setIsStickyBtn] = useState(false);
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

  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: jobDetails } = useJobDetails(selectedJobId as string);
  const { data: candidatesByJob = [] } = useCandidatesByJob(
    selectedJobId as string
  );
  const { data: favoritesCount } = useFavoritesCount(selectedJobId as string);
  const { data: pendingCounts = [] } = usePendingCountsForAllJobs();
  const isMobile = useIsMobile(450);
  const effectiveViewMode = isMobile ? 2 : viewMode;
  const counts = useMemo(() => {
    let c = { new: 0, interview: 0, notSure: 0, reject: 0 };
    for (const cand of candidatesByJob) {
      const status =
        (cand as any).status ??
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
    return candidatesByJob.filter((cand) => {
      console.log("cand", cand);

      const status =
        (cand as any).status ??
        (cand as any).status_name ??
        (cand as any).current_status_name ??
        "";
      return normalizeToTab(status) === activeTab;
    });
  }, [candidatesByJob, activeTab]);

  const getCandidatesNewCountForJob = (jobId: string) => {
    if (jobId === selectedJobId) {
      return counts.new;
    }

    return 0;
  };

  useEffect(() => {
    if ((!selectedJobId && jobs?.[0]?.job_id) || jobs?.length === 1) {
      setSelectedJobId(jobs?.[0]?.job_id);
    }
  }, [jobs]);

  if (jobsLoading) {
    return <p className="text-center mt-10 h-screen">Loading jobs...</p>;
  }
  const options: JobOption[] = (jobs ?? []).map((job: Job) => ({
    id: job.job_id,
    title: job.title,
    newCount:
      pendingCounts.find((c) => c.job_id === job.job_id)?.pending_count ?? 0,
    dotClass: "bg-[#259A6D]",
  }));

  return (
    <main>
      <div className="flex flex-row mt-6 max-w-[1416px] mx-auto gap-1">
        {!jobs?.length && (
          <section
            className={`flex flex-row justify-between items-center px-2 cursor-pointer
                : "bg-white/45 w-[155px] h-[42px] mb-1 rounded-lg"
            transition-all duration-300`}
          >
            <div
              className={`flex flex-row justify-between flex-1 items-center
        ${true ? "bg-white h-[42px] rounded-lg px-2" : ""}`}
            >
              <div className="flex flex-row gap-4 items-center">
                <span className={`w-[7px] h-[7px] rounded-full `} />
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
        <MobileJobSelect
          options={options}
          value={selectedJobId as string}
          onChange={setSelectedJobId}
        />
      </div>

      <section
        className={`max-w-[1416px] p-8 mx-auto bg-[#F9F7F5] min-h-[526px] lg:max-h-screen relative 
        ${
          selectedJobId == null
            ? "rounded-tr-lg rounded-b-lg"
            : "rounded-b-lg rounded-tr-lg"
        }
        transition-all duration-300`}
      >
        <div className="w-full flex flex-col lg:flex-row items-start justify-between">
          <span className="text-[#211C1A] text-[12px] font-semibold max-w-[490px]">
            {jobDetails?.description ?? "No description"}
          </span>

          <div className="flex flex-row flex-wrap w-[330px] gap-2">
            {jobDetails &&
              jobDetails?.skills?.map((tag: string, i: number) => (
                <Dotbage tag={tag} key={i} />
              ))}
          </div>

          <div className="flex flex-row items-start  mt-10 sm:mt-0 justify-start gap-2 ">
            <button className="w-[104px] lg:w-[146px] h-[40px] gap-1 rounded-[4px] border flex items-center justify-center border-[#E0DFDD] text-[14px] font-semibold text-[#211C1A] ">
              <p className="hidden lg:block"> [{favoritesCount}]</p>
              Favorites
            </button>
            <button
              className=" w-[104px] lg:w-[129px] h-[40px] flex items-center justify-center gap-1 bg-[#597D9B] text-[14px] font-bold rounded-[4px] text-white"
              onClick={() => setIsAddModalOpen(true)}
            >
              <p className="hidden lg:block">[V]</p>
              Vacancy
            </button>
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
            selectedJobId={selectedJobId as string}
            handleCandidateClick={handleCandidateClick}
          />
        ) : (
          <CandidatesTable
            setIsStickyBtn={setIsStickyBtn}
            candidatesByJob={filteredCandidates}
            selectedJobId={selectedJobId as string}
            handleCandidateClick={handleCandidateClick}
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
            selectedJobId={selectedJobId as string}
            onCandidateChange={handleCandidateChange}
          />
        )}
      </section>
    </main>
  );
}
