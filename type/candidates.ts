type CandidateRow = {
  has_equity: any;
  gender: string;
  cv_url: any;
  linkedin_url: any;
  highlights: any;
  opinion: any;
  requirements: string;
  status: string;
  application_id: any;
  id: string;
  full_name: string;
  is_favorite: boolean;
  current_title: string;
  rejection_reason?: string | null;
  subtitle: string | null;
  avatar_url: string;
  match_percentage: number;
  deployment_status: string | null;
  clearance_status: string | null;
  location: string | null;
  experience_years: number;

  skills: string[] | null;
  salary: number;
  portfolio_url: string | null;
};
interface Job {
  status: string;
  job_id: string;
  title: string;
  description?: string;
  skills?: string[];
}

interface FormErrors {
  portfolio?: string;
  linkedin?: string;
}

interface CandidateFormData {
  name: string;
  highlights: string;
  hasEquity?: boolean;
  gender: string;
  title: string;
  location: string;
  experience: string | null;
  deployment: string;
  englishLevel: string;
  salary: number | null;
  portfolioUrl: string;
  linkedinUrl: string;
  skills: string;
  opinion: string;
}

interface JobFormData {
  title: string;
  description: string;
  selectedJobId: string | null;
}
type TabKey = "new" | "interview" | "not-sure" | "reject";

export type {
  CandidateFormData,
  CandidateRow,
  FormErrors,
  Job,
  JobFormData,
  TabKey,
};
