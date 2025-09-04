import {
  countFavorites,
  createJobWithCandidate,
  deleteJobAndRelated,
  fetchAllJobs,
  fetchCandidateById,
  fetchCandidatesByJob,
  fetchCounts,
  fetchJobDetails,
  fetchPendingCandidatesByJob,
  fetchPendingCountsForAllJobs,
  removeCandidateFromJob,
  toggleFavorite,
  updateApplicationStatusByName,
} from "@/service";
import { CandidateRow } from "@/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useJobDetails = (jobId: string) => {
  return useQuery({
    queryKey: ["jobDetails", jobId],
    queryFn: () => fetchJobDetails(jobId),
    enabled: !!jobId,
  });
};

export const useJobs = () => {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: fetchAllJobs,
  });
};

export const useCandidatesByJob = (jobId: string) => {
  return useQuery<CandidateRow[]>({
    queryKey: ["candidates", jobId],
    queryFn: () => fetchCandidatesByJob(jobId),
    enabled: !!jobId,
  });
};

export const useToggleFavorite = (jobId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: string) => toggleFavorite(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates", jobId] });
      queryClient.invalidateQueries({ queryKey: ["favoritesCount", jobId] });
    },
  });
};

export const useFavoritesCount = (jobId: string) => {
  return useQuery({
    queryKey: ["favoritesCount", jobId],

    queryFn: () => countFavorites(jobId),
    enabled: !!jobId,
  });
};
export const useCandidateById = (candidateId: string | null) => {
  return useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: () => fetchCandidateById(candidateId as string),
    enabled: !!candidateId,
  });
};

export const useCounts = () => {
  return useQuery({
    queryKey: ["counts"],
    queryFn: fetchCounts,
  });
};
export const useCreateJobWithCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      organizationId: string;
      jobId?: string | null;
      jobTitle?: string;
      jobDescription?: string;
      opinion: string;
      candidate: {
        name: string;
        requirements: string;
        title: string;
        location: string;
        experience: string;
        deployment: string;
        clearance: string;
        highlights: string;
        salary: number;
        portfolio: string;
        linkedin: string;
        requirementsText: string;
        opinion: string;
      };
      skills: string[];
    }) => createJobWithCandidate(variables),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["pendingCounts"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => deleteJobAndRelated(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
};
export const useRemoveCandidateFromJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { jobId: string; candidateId: string }) =>
      removeCandidateFromJob(data.jobId, data.candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (error: any) => {},
  });
};
export const useUpdateApplicationStatus = (jobId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { applicationId: string; statusName: string }) =>
      updateApplicationStatusByName(vars.applicationId, vars.statusName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["pendingCounts"] });
      queryClient.invalidateQueries({ queryKey: ["favoritesCount", jobId] });
    },
  });
};
export const usePendingCandidatesByJob = (jobId: string) => {
  return useQuery({
    queryKey: ["pendingCandidates", jobId],
    queryFn: () => fetchPendingCandidatesByJob(jobId),
    enabled: !!jobId,
  });
};
export const usePendingCountsForAllJobs = () => {
  return useQuery({
    queryKey: ["pendingCounts"],
    queryFn: fetchPendingCountsForAllJobs,
  });
};
