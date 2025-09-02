"use client";
import { CandidateRow, Job } from "@/type";
import { createContext, ReactNode, useContext, useState } from "react";

interface CandidatesContextType {
  selectedJobId: string | null;
  selectedCandidate: CandidateRow | null;
  isModalOpen: boolean;
  viewMode: number;

  setSelectedJobId: (jobId: string | null) => void;
  setSelectedCandidate: (candidate: CandidateRow | null) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setViewMode: (mode: number) => void;

  handleCandidateClick: (candidate: CandidateRow) => void;
  handleCloseModal: () => void;
  handleCandidateChange: (candidate: CandidateRow) => void;

  setJobCount: (jobs: number) => void;
  jobCount: number;
  setCandidateCount: (jobs: number) => void;
  candidateCount: number;
  getTotalCandidatesCount: (candidates?: CandidateRow[]) => number;
  getFavoriteCandidatesCount: (candidates?: CandidateRow[]) => number;
  getApprovedCandidatesCount: (candidates?: CandidateRow[]) => number;
  getRejectedCandidatesCount: (candidates?: CandidateRow[]) => number;
  getHoldCandidatesCount: (candidates?: CandidateRow[]) => number;
  getTotalJobsCount: (jobs?: Job[]) => number;
  getActiveJobsCount: (jobs?: Job[]) => number;
}

const CandidatesContext = createContext<CandidatesContextType | undefined>(
  undefined
);

interface CandidatesProviderProps {
  children: ReactNode;
}

export function CandidatesProvider({ children }: CandidatesProviderProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<number>(1);
  const [jobCount, setJobCount] = useState<number>(0);
  const [candidateCount, setCandidateCount] = useState<number>(0);
  const handleCandidateClick = (candidate: CandidateRow) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleCandidateChange = (candidate: CandidateRow) => {
    setSelectedCandidate(candidate);
  };

  const getTotalCandidatesCount = (candidates?: CandidateRow[]) => {
    return candidates?.length || 0;
  };

  const getFavoriteCandidatesCount = (candidates?: CandidateRow[]) => {
    return candidates?.filter((candidate) => candidate.is_favorite).length || 0;
  };

  const getApprovedCandidatesCount = (candidates?: CandidateRow[]) => {
    return (
      candidates?.filter((candidate) => candidate.status === "approved")
        .length || 0
    );
  };

  const getRejectedCandidatesCount = (candidates?: CandidateRow[]) => {
    return (
      candidates?.filter((candidate) => candidate.status === "rejected")
        .length || 0
    );
  };

  const getHoldCandidatesCount = (candidates?: CandidateRow[]) => {
    return (
      candidates?.filter((candidate) => candidate.status === "hold").length || 0
    );
  };

  const getTotalJobsCount = (jobs?: Job[]) => {
    return jobs?.length || 0;
  };

  const getActiveJobsCount = (jobs?: Job[]) => {
    return jobs?.filter((job) => job.status === "active").length || 0;
  };

  const value: CandidatesContextType = {
    selectedJobId,
    selectedCandidate,
    isModalOpen,
    viewMode,
    setJobCount,
    candidateCount,
    setCandidateCount,
    jobCount,
    setSelectedJobId,
    setSelectedCandidate,
    setIsModalOpen,
    setViewMode,

    handleCandidateClick,
    handleCloseModal,
    handleCandidateChange,

    getTotalCandidatesCount,
    getFavoriteCandidatesCount,
    getApprovedCandidatesCount,
    getRejectedCandidatesCount,
    getHoldCandidatesCount,
    getTotalJobsCount,
    getActiveJobsCount,
  };

  return (
    <CandidatesContext.Provider value={value}>
      {children}
    </CandidatesContext.Provider>
  );
}

export function useCandidatesContext() {
  const context = useContext(CandidatesContext);
  if (context === undefined) {
    throw new Error(
      "useCandidatesContext must be used within a CandidatesProvider"
    );
  }
  return context;
}
