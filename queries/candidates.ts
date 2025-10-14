import { supabase } from "@/lib/supabase";
import {
  countFavorites,
  createJobWithCandidate,
  createOrganization,
  deleteJobAndRelated,
  deleteOrganization,
  fetchAllJobs,
  fetchAllOrganizations,
  fetchCandidateById,
  fetchCandidatesByJob,
  fetchCountsByOrganization,
  fetchJobDetails,
  fetchJobsByOrganization,
  fetchOrganizationById,
  fetchPendingCandidatesByJob,
  fetchPendingCountsForAllJobs,
  removeCandidateFromJob,
  toggleFavorite,
  updateApplicationStatusByName,
  updateJob,
  updateOrganization,
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

export const useOrganizations = () => {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: fetchAllOrganizations,
  });
};
export const useOrganization = (organizationId: string | null) => {
  return useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => fetchOrganizationById(organizationId as string),
    enabled: !!organizationId,
  });
};

export const useJobsByOrganization = (organizationId: string | null) => {
  return useQuery({
    queryKey: ["jobs", organizationId],
    queryFn: () => fetchJobsByOrganization(organizationId as string),
    enabled: !!organizationId,
  });
};

export const useJobs = () => {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: fetchAllJobs,
  });
};

export const useCreateOrganization = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, logoUrl }: { name: string; logoUrl?: string }) =>
      createOrganization(name, logoUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
};

export const useUpdateOrganization = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      logoUrl,
    }: {
      id: string;
      name: string;
      logoUrl?: string;
    }) => updateOrganization(id, name, logoUrl),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
      qc.invalidateQueries({ queryKey: ["organization", vars.id] });
    },
  });
};

export const useDeleteOrganization = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
    },
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
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
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

export const useCountsByOrganization = (organizationId: string | null) => {
  return useQuery({
    queryKey: ["counts", organizationId],
    queryFn: () => fetchCountsByOrganization(organizationId as string),
    enabled: !!organizationId,
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
        gender: string;
        has_equity: boolean;
      };
      skills: string[];
    }) => createJobWithCandidate(variables),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["pendingCounts"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["counts"] });
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
    mutationFn: (vars: {
      applicationId: string;
      statusName: string;
      rejectionReason?: string;
    }) =>
      updateApplicationStatusByName(
        vars.applicationId,
        vars.statusName,
        vars.rejectionReason
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["counts"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", jobId] });
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

type UpdatePayload = {
  has_equity: any;
  applicationId: string;

  organizationId?: string | null;
  jobId?: string | null;
  jobTitle?: string | null;
  jobDescription?: string | null;

  opinion?: string | null;
  skills?: string[] | string | null;

  candidate: {
    name?: string | null;
    title?: string | null;
    location?: string | null;
    experience?: string | number | null;
    deployment?: string | null;
    clearance?: string | null;
    salary?: number | null;
    portfolio?: string | null;
    linkedin?: string | null;
    requirements?: string[] | string | null;
    requirementsText?: string | null;
    highlights?: string | null;
    opinion?: string | null;
    gender?: string | null;
  };
};

function toTextOrNull(v: string | number | null | undefined): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function toTextArray(v?: string[] | string | null): string[] | null {
  if (v == null) return null;
  if (Array.isArray(v)) {
    const arr = v.map((s) => (s ?? "").trim()).filter(Boolean);
    return arr.length ? arr : null;
  }
  const arr = String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length ? arr : null;
}

export function useUpdateCandidateWithApplication(jobIdForInvalidate?: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (p: UpdatePayload) => {
      const c = p.candidate ?? {};

      const requirementsArr = toTextArray(
        c.requirements ?? c.requirementsText ?? null
      );
      const skillsArr = toTextArray(p.skills ?? null);

      const { data, error } = await supabase.rpc("update_application_bundle", {
        _application_id: p.applicationId,
        _has_equity: p.has_equity,
        _organization_id: p.organizationId ?? null,
        _job_id: p.jobId ?? null,
        _job_title: p.jobTitle ?? null,
        _job_description: p.jobDescription ?? null,

        _full_name: c.name ?? null,
        _current_title: c.title ?? null,
        _location: c.location ?? null,
        _experience_years: toTextOrNull(c.experience),
        _deployment_status: c.deployment ?? null,
        _clearance_status: c.clearance ?? null,
        _salary: c.salary ?? null,
        _portfolio_url: c.portfolio ?? null,
        _linkedin_url: c.linkedin ?? null,

        _requirements: requirementsArr,
        _gender: c.gender ?? null,
        _opinion: p.opinion ?? c.opinion ?? null,
        _highlights: c.highlights ?? null,
        _skills: skillsArr,
      });
      if (error) throw error;
      return data;
    },

    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["pendingCounts"] });
      qc.invalidateQueries({ queryKey: ["counts"] });
      qc.invalidateQueries({ queryKey: ["candidates"] });

      if (vars.jobId) {
        qc.invalidateQueries({ queryKey: ["candidates", vars.jobId] });
        qc.invalidateQueries({ queryKey: ["jobDetails", vars.jobId] });
        qc.invalidateQueries({ queryKey: ["favoritesCount", vars.jobId] });
      } else if (jobIdForInvalidate) {
        qc.invalidateQueries({ queryKey: ["candidates", jobIdForInvalidate] });
        qc.invalidateQueries({ queryKey: ["jobDetails", jobIdForInvalidate] });
        qc.invalidateQueries({
          queryKey: ["favoritesCount", jobIdForInvalidate],
        });
      }
    },
  });
}
export function useUpdateJob() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      title,
      description,
    }: {
      jobId: string;
      title: string;
      description: string;
    }) => updateJob(jobId, title, description),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
