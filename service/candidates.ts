import { supabase } from "@/lib/supabase";
import { CandidateRow } from "@/type";

export const fetchAllCandidates = async () => {
  const { data, error } = await supabase.rpc("get_all_candidate_details");
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const fetchJobDetails = async (jobId: string) => {
  const { data, error } = await supabase.rpc("get_job_details", {
    job_uuid: jobId,
  });

  if (error) {
    throw new Error(error.message);
  }
  return data[0];
};

export const fetchAllJobs = async () => {
  const { data, error } = await supabase.rpc("get_all_jobs_with_skills");

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const fetchCandidatesByJob = async (
  jobId: string
): Promise<CandidateRow[]> => {
  const { data, error } = await supabase.rpc("get_candidates_by_job", {
    job_uuid: jobId,
  });

  if (error) {
    throw new Error(error.message);
  }
  console.log("data", data);

  if (!data) return [];

  return (data as CandidateRow[]).map(
    (c): CandidateRow => ({
      id: c.id,
      application_id: c.application_id,
      full_name: c.full_name,
      current_title: c.current_title,
      subtitle: c.subtitle ?? "",
      avatar_url: c.avatar_url,
      match_percentage: c.match_percentage,
      deployment_status: c.deployment_status,
      clearance_status: c.clearance_status,
      location: c.location,
      opinion: c.opinion,
      highlights: c.highlights,
      experience_years: c.experience_years,
      skills: c.skills ?? [],
      salary: Number(c.salary),
      portfolio_url: c.portfolio_url,
      is_favorite: c.is_favorite,
      requirements: c.requirements ?? "",
      status: c.status,
      linkedin_url: c.linkedin_url,
      cv_url: c.cv_url,
      rejection_reason: (c as any).rejection_reason ?? null,
      gender: c.gender || "",
    })
  );
};

export const toggleFavorite = async (applicationId: string) => {
  const { error } = await supabase.rpc("toggle_favorite", {
    app_id: applicationId,
  });

  if (error) throw new Error(error.message);
};

export const countFavorites = async (jobId: string): Promise<number> => {
  const { data, error } = await supabase.rpc("count_favorites_by_job", {
    job_id: jobId,
  });

  if (error) throw new Error(error.message);

  return data ?? 0;
};
export const fetchCandidateById = async (candidateId: string) => {
  const { data, error } = await supabase.rpc("get_candidate_by_id", {
    cand_id: candidateId,
  });

  if (error) throw new Error(error.message);

  return data?.[0] ?? null;
};

export const fetchCounts = async (): Promise<{
  total_candidates: number;
  total_jobs: number;
}> => {
  const { data, error } = await supabase.rpc("get_counts");

  if (error) throw new Error(error.message);

  return data?.[0] ?? { total_candidates: 0, total_jobs: 0 };
};
export interface CreateJobWithCandidateInput {
  organizationId: string;
  jobId?: string | null;
  jobTitle?: string;
  jobDescription?: string;
  requirementsText?: string;
  candidate: {
    gender: string;
    requirementsText: string;
    name: string;
    opinion: string;
    highlights: string;
    title: string;
    location: string;
    experience: string;
    deployment: string;
    clearance: string;
    salary: number;
    portfolio: string;
    linkedin: string;
  };
  skills: string[];
}

export const createJobWithCandidate = async (
  input: CreateJobWithCandidateInput
) => {
  const {
    organizationId,
    jobId,
    jobTitle,
    jobDescription,
    candidate,
    skills,
    requirementsText,
  } = input;

  const { data, error } = await supabase.rpc("create_job_with_candidate", {
    _organization_id: organizationId,
    _candidate_name: candidate.name ?? "",
    _candidate_title: candidate.title ?? "",
    _candidate_location: candidate.location ?? "",
    _candidate_experience: candidate.experience,
    _candidate_deployment: candidate.deployment ?? "",
    _candidate_clearance: candidate.clearance ?? "",
    _candidate_salary: candidate.salary,
    _opinion: candidate.opinion,
    _job_id: jobId,
    _job_title: jobTitle,
    _candidate_gender: candidate.gender ?? null,
    _job_description: jobDescription,
    _highlights: candidate.highlights,
    _candidate_portfolio: candidate.portfolio ?? null,
    _candidate_linkedin: candidate.linkedin ?? null,
    _skills: [],
    _candidate_requirements: candidate.requirementsText ?? null,
  });
  console.log("djasjdasjdasoidoia", data, candidate.gender);

  return data;
};

export const deleteJobAndRelated = async (jobId: string) => {
  const { error } = await supabase.rpc("delete_job_with_relations", {
    p_job: jobId,
  });

  if (error) throw new Error(error.message);
  return true;
};
export const removeCandidateFromJob = async (
  jobId: string,
  candidateId: string
) => {
  const { data, error } = await supabase.rpc("remove_candidate_from_job", {
    _job_id: jobId,
    _candidate_id: candidateId,
  });

  if (error) throw error;
  return data;
};

export const updateCandidateStatusToReject = async (candidateId: string) => {
  const { data, error } = await supabase.rpc(
    "update_candidate_status_to_reject",
    {
      candidate_id: candidateId,
    }
  );

  if (error) {
    console.error("Error updating candidate status:", error);
  } else {
    console.log("Candidate status updated to reject:", data);
  }
};

export const seedAllCandidatesIntoJob = async (jobId: string) => {
  const { data, error } = await supabase.rpc("seed_all_candidates_into_job", {
    _job_id: jobId,
    _interview_count: 3,
    _default_opinion: "Auto-seeded",
    _highlights: "Initial highlights",
  });
  if (error) throw new Error(error.message);
  return data as number;
};

export const updateApplicationStatusByName = async (
  applicationId: string,
  statusName: string,
  rejectionReason?: string
) => {
  const { error } = await supabase.rpc("update_application_status_by_name", {
    _application_id: applicationId,
    _status_name: statusName,
    _rejection_reason: rejectionReason ?? "",
  });
  if (error) throw new Error(error.message);
};

export const updateCandidateStatusForJob = async (
  candidateId: string,
  jobId: string,
  statusName: string
) => {
  const { error } = await supabase.rpc("update_candidate_status_for_job", {
    _candidate_id: candidateId,
    _job_id: jobId,
    _status_name: statusName,
  });
  if (error) throw new Error(error.message);
};

export async function fetchPendingCandidatesByJob(
  jobId: string
): Promise<CandidateRow[]> {
  const { data, error } = await supabase.rpc("get_pending_candidates_by_job", {
    _job_id: jobId,
  });

  if (error) {
    console.error("Error fetching pending candidates:", error);
    throw error;
  }
  return data as CandidateRow[];
}
export async function fetchPendingCountsForAllJobs() {
  const { data, error } = await supabase.rpc("get_pending_counts_for_all_jobs");
  if (error) throw error;
  return data as { job_id: string; pending_count: number }[];
}
