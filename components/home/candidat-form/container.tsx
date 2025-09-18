"use client";

import { CANDIDATA_FORM_DATA } from "@/constants";
import { useFormData, useLockBodyScroll } from "@/hooks";
import { useUrlValidation } from "@/hooks/useUrlValidation";
import {
  useCreateJobWithCandidate,
  useJobs,
  useUpdateCandidateWithApplication,
} from "@/queries/candidates";
import { CandidateFormData, CandidateRow, FormErrors } from "@/type";
import { useEffect, useState } from "react";
import {
  CloseButton,
  Input,
  RadioSelect,
  Select,
  StepIndicator,
} from "./form-items";
import { CandidateInfoBlock, JobSelectionBlock, RmOpinionBlock } from "./steps";

const getCandidateFormFields = (
  candidateData: CandidateFormData,
  updateCandidateData: (updates: Partial<CandidateFormData>) => void,
  errors: FormErrors,
  showValidationErrors: boolean = false,
  clearFieldError: (fieldName: keyof FormErrors | string) => void
) => [
  {
    label: "FULL NAME",
    component: (
      <Input
        placeholder="Full Name"
        value={candidateData.name}
        onChange={(e) => {
          updateCandidateData({ name: e.target.value });
          if (showValidationErrors && e.target.value.trim()) {
            clearFieldError("name");
          }
        }}
        isRequired
        showValidation={showValidationErrors}
      />
    ),
    isRequired: true,
    isEmpty: !candidateData.name?.trim(),
  },
  {
    label: "Current position",
    component: (
      <Input
        placeholder="Current position"
        value={candidateData.title}
        onChange={(e) => {
          updateCandidateData({ title: e.target.value });
          if (showValidationErrors && e.target.value.trim()) {
            clearFieldError("title");
          }
        }}
        isRequired
        showValidation={showValidationErrors}
      />
    ),
    isRequired: true,
    isEmpty: !candidateData.title?.trim(),
  },
  {
    label: "Location",
    component: (
      <Input
        placeholder="Location"
        value={candidateData.location}
        onChange={(e) => {
          updateCandidateData({ location: e.target.value });
          if (showValidationErrors && e.target.value.trim()) {
            clearFieldError("location");
          }
        }}
        isRequired
        showValidation={showValidationErrors}
      />
    ),
    isRequired: true,
    isEmpty: !candidateData.location?.trim(),
  },
  {
    label: "Experience",
    component: (
      <Input
        type="string"
        placeholder="Experience (years)"
        value={candidateData.experience}
        onChange={(e) => {
          updateCandidateData({ experience: e.target.value });
          if (showValidationErrors && e.target.value.trim()) {
            clearFieldError("experience");
          }
        }}
        isRequired
        showValidation={showValidationErrors}
      />
    ),
    isRequired: true,
    isEmpty:
      candidateData.experience === null || candidateData.experience === "",
  },
  {
    label: "Notice Period",
    component: (
      <Input
        placeholder="Notice Period"
        value={candidateData.deployment}
        onChange={(e) => {
          updateCandidateData({ deployment: e.target.value });
          if (showValidationErrors && e.target.value.trim()) {
            clearFieldError("deployment");
          }
        }}
        isRequired
        showValidation={showValidationErrors}
      />
    ),
    isRequired: true,
    isEmpty: !candidateData.deployment?.trim(),
  },
  {
    label: "English Level",
    component: (
      <Select
        value={candidateData.englishLevel}
        onChange={(e) => {
          updateCandidateData({ englishLevel: e.target.value });
          if (showValidationErrors && e.target.value.trim()) {
            clearFieldError("englishLevel");
          }
        }}
        options={CANDIDATA_FORM_DATA.ENGLISH_LEVELS.map((level) => ({
          value: level,
          label: level,
        }))}
        className="text-[12px]"
        placeholder="Select English Level"
        isRequired
        showValidation={showValidationErrors}
        label="English Level"
      />
    ),
    isRequired: true,
    isEmpty: !candidateData.englishLevel?.trim(),
  },
  {
    label: "Salary expected, in $usd",
    component: (
      <Input
        type="number"
        label="Salary expected, in $usd"
        placeholder="Enter expected salary"
        value={candidateData.salary}
        isRightBlock={true}
        equityChecked={!!candidateData.hasEquity}
        onEquityChange={(checked) =>
          updateCandidateData({ hasEquity: checked })
        }
        onChange={(e) => {
          const value = Number(e.target.value) || null;
          updateCandidateData({ salary: value });
          if (showValidationErrors && value !== null && value > 0) {
            clearFieldError("salary");
          }
        }}
        isRequired
        showValidation={showValidationErrors}
      />
    ),
    isRequired: true,
    isEmpty: candidateData.salary === null,
  },
  {
    label: "Portfolio URL",
    component: (
      <Input
        placeholder="Portfolio URL"
        value={candidateData.portfolioUrl}
        onChange={(e) => {
          updateCandidateData({ portfolioUrl: e.target.value });
          if (errors.portfolio && e.target.value.trim()) {
            clearFieldError("portfolio");
          }
        }}
        hasError={!!errors.portfolio}
      />
    ),
    isRequired: false,
    error: errors.portfolio,
    isEmpty: !candidateData.portfolioUrl?.trim(),
  },
  {
    label: "CV URL",
    component: (
      <Input
        placeholder="CV URL"
        value={candidateData.linkedinUrl}
        onChange={(e) => {
          updateCandidateData({ linkedinUrl: e.target.value });
          if (
            (showValidationErrors || errors.linkedin) &&
            e.target.value.trim()
          ) {
            clearFieldError("linkedin");
          }
        }}
        showValidation={showValidationErrors}
        isRequired
        hasError={Boolean(errors.linkedin)}
      />
    ),
    error: errors.linkedin,
    isRequired: true,
    isEmpty: !candidateData.linkedinUrl?.trim(),
  },
  {
    label: "Gender",
    component: (
      <RadioSelect
        value={candidateData.gender}
        onChange={(v) => {
          updateCandidateData({ gender: v });
          if (showValidationErrors && v.trim()) {
            clearFieldError("gender");
          }
        }}
        options={CANDIDATA_FORM_DATA.GENDERS.map((g) => ({
          value: g,
          label: g,
        }))}
        className="text-[12px]"
        isRequired
        showValidation={showValidationErrors}
        label="Gender"
      />
    ),
    isRequired: true,
    isEmpty: !candidateData.gender?.trim(),
  },
];

export function CreateJobCandidateModal({
  open,
  setOpen,
  mode = "create",
  initialCandidate = null,
  initialJobId = null,
  initialStep,
  applicationId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode?: "create" | "edit";
  initialCandidate?: CandidateRow | null;
  initialJobId?: string | null;
  initialStep?: number;
  applicationId?: string;
}) {
  useLockBodyScroll(open);
  const defaultStep =
    mode === "edit"
      ? CANDIDATA_FORM_DATA.STEPS.CANDIDATE_INFO
      : CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION;

  const [step, setStep] = useState<number>(initialStep ?? defaultStep);

  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [showJobValidation, setShowJobValidation] = useState(false);
  const [isCreatingNewJob, setIsCreatingNewJob] = useState(false);

  const { data: jobs } = useJobs();
  const mutation = useCreateJobWithCandidate();
  const createMutation = useCreateJobWithCandidate();
  const updateMutation = useUpdateCandidateWithApplication();

  const {
    jobData,
    candidateData,
    errors,
    updateJobData,
    updateCandidateData,
    setErrors,
    resetForm,
  } = useFormData();

  const { validateUrls } = useUrlValidation();

  const isCandidateInfoValid = () => {
    const urlErrors = validateUrls(candidateData.linkedinUrl);

    if (
      !candidateData.name?.trim() ||
      !candidateData.title?.trim() ||
      !candidateData.location?.trim() ||
      candidateData.experience === null ||
      Number(candidateData.experience) < 0 ||
      !candidateData.englishLevel?.trim() ||
      candidateData.salary === null ||
      Number(candidateData.salary) < 0 ||
      !candidateData.highlights?.trim() ||
      !candidateData.deployment?.trim() ||
      !candidateData.linkedinUrl?.trim() ||
      !candidateData.skills?.trim() ||
      !candidateData.gender?.trim() ||
      Object.keys(urlErrors).length > 0
    ) {
      return false;
    }

    return true;
  };
  const clearFieldError = (fieldName: keyof FormErrors | string) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[fieldName as keyof FormErrors];
      return newErrors;
    });

    const hasRequiredFieldsComplete =
      candidateData.name?.trim() &&
      candidateData.title?.trim() &&
      candidateData.location?.trim() &&
      candidateData.experience !== null &&
      candidateData.englishLevel?.trim() &&
      candidateData.salary !== null &&
      candidateData.deployment?.trim() &&
      candidateData.linkedinUrl?.trim() &&
      candidateData.gender?.trim();

    if (hasRequiredFieldsComplete && showValidationErrors) {
      setShowValidationErrors(false);
    }
  };

  const handleNextToCandidateInfo = () => {
    const isJobDataValid = isCreatingNewJob
      ? !!(jobData.title?.trim() && jobData.description?.trim())
      : !!jobData.selectedJobId;

    if (!isJobDataValid) {
      setShowJobValidation(true);
      return;
    }

    setShowJobValidation(false);
    setStep(CANDIDATA_FORM_DATA.STEPS.CANDIDATE_INFO);
  };

  const handleNextToOpinion = () => {
    const urlErrors = validateUrls(candidateData.linkedinUrl);

    if (!isCandidateInfoValid() || Object.keys(urlErrors).length > 0) {
      setShowValidationErrors(true);
      setErrors(urlErrors);
      return;
    }
    setShowValidationErrors(false);
    setErrors({});
    setStep(CANDIDATA_FORM_DATA.STEPS.RM_OPINION);
  };

  const handleSubmit = () => {
    const urlErrors = validateUrls(candidateData.portfolioUrl);
    if (Object.keys(urlErrors).length > 0) {
      setErrors(urlErrors);
      return;
    }

    const skillsArray = candidateData.skills
      ? candidateData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const payload = {
      organizationId: CANDIDATA_FORM_DATA.ORGANIZATION_ID,
      opinion: candidateData.opinion || "",
      candidate: {
        name: candidateData.name || "",
        title: candidateData.title || "",
        location: candidateData.location || "",
        experience: candidateData.experience || "",
        deployment: candidateData.deployment || "",
        clearance:
          candidateData.englishLevel ||
          CANDIDATA_FORM_DATA.DEFAULT_ENGLISH_LEVEL,
        salary: candidateData.salary || 0,
        portfolio: candidateData.portfolioUrl || "",
        linkedin: candidateData.linkedinUrl || "",
        requirementsText: candidateData.skills || "",
        highlights: candidateData.highlights || "",
        opinion: candidateData.opinion || "",
        requirements: candidateData.skills || "",
        gender: candidateData.gender || "",
        has_equity: candidateData.hasEquity || false,
      },
      skills: skillsArray,
      ...(jobData.selectedJobId
        ? { jobId: jobData.selectedJobId }
        : {
            jobTitle: jobData.title || "",
            jobDescription: jobData.description || "",
          }),
    };

    if (mode === "edit") {
      if (!applicationId) {
        console.error("applicationId is required in edit mode");
        return;
      }
      updateMutation.mutate(
        {
          applicationId,
          ...payload,
          has_equity: candidateData.hasEquity,
        },
        {
          onSuccess: () => {
            setOpen(false);
            resetForm();
            setStep(defaultStep);
            setShowValidationErrors(false);
            setShowJobValidation(false);
            setIsCreatingNewJob(false);
          },
          onError: (e) => console.error("Error updating candidate:", e),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setOpen(false);
          resetForm();
          setStep(CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION);
          setShowValidationErrors(false);
          setShowJobValidation(false);
          setIsCreatingNewJob(false);
        },
        onError: (e) => console.error("Error creating job with candidate:", e),
      });
    }
  };

  const enterCreateMode = () => {
    setIsCreatingNewJob(true);
    setShowJobValidation(false);
    updateJobData({ selectedJobId: null });
  };

  const exitCreateMode = () => {
    setIsCreatingNewJob(false);
    setShowJobValidation(false);
    updateJobData({ title: "", description: "" });
  };
  const cleanClearance = (s?: string | null) =>
    (s || "").replace(/^English\s*/i, "").trim();

  useEffect(() => {
    if (!open) return;
    if (mode !== "edit" || !initialCandidate) return;

    if (initialJobId) {
      updateJobData({ selectedJobId: initialJobId });
    }

    updateCandidateData({
      name: initialCandidate.full_name || "",
      title: initialCandidate.current_title || "",
      location: initialCandidate.location || "",
      experience:
        (initialCandidate.experience_years as unknown as string) || "",
      deployment: initialCandidate.deployment_status || "",
      englishLevel:
        cleanClearance(initialCandidate.clearance_status) ||
        CANDIDATA_FORM_DATA.DEFAULT_ENGLISH_LEVEL,
      salary: Number(initialCandidate.salary) || null,
      portfolioUrl: initialCandidate.portfolio_url || "",
      linkedinUrl: initialCandidate.linkedin_url || "",
      skills: Array.isArray(initialCandidate.requirements)
        ? (initialCandidate.requirements as unknown as string[]).join(", ")
        : (initialCandidate.requirements as unknown as string) || "",
      highlights: initialCandidate.highlights || "",
      opinion: initialCandidate.opinion || "",
      gender: (initialCandidate as any).gender || "",
      hasEquity: initialCandidate.has_equity || false,
    });

    setShowValidationErrors(false);
    setShowJobValidation(false);
  }, [open, mode, initialCandidate, initialJobId]);

  const candidateFormFields = getCandidateFormFields(
    candidateData,
    updateCandidateData,
    errors,
    showValidationErrors,
    clearFieldError
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center  justify-center z-50 box-border  overflow-hidden   lg: h-screen">
      <div
        className={`bg-white rounded-xl shadow-lg   relative ${
          step === CANDIDATA_FORM_DATA.STEPS.CANDIDATE_INFO &&
          "w-[360px] lg:w-full max-w-[751px]   lg:h-[99%]  lg:overflow-hidden lg:max-h-[801px] min-[1200px]:max-h-max lg:px-[39px]  py-[28px]"
        }
        ${
          step === CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION &&
          " w-[360px] lg:w-[464px] h-[537px] pt-[28px] px-[50px] lg:px-[50px]"
        }
        ${
          step === CANDIDATA_FORM_DATA.STEPS.RM_OPINION &&
          "pt-[28px] w-[360px] lg:w-[464px]"
        }`}
      >
        <CloseButton onClose={() => setOpen(false)} />
        {mode !== "edit" && <StepIndicator currentStep={step} />}

        {step === CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION && (
          <JobSelectionBlock
            jobs={jobs}
            enterCreateMode={enterCreateMode}
            handleNextToCandidateInfo={handleNextToCandidateInfo}
            jobData={jobData}
            updateJobData={updateJobData}
            isCreatingNewJob={isCreatingNewJob}
            showJobValidation={showJobValidation}
            exitCreateMode={exitCreateMode}
            mode={mode}
            isJobValid={
              isCreatingNewJob
                ? !!(jobData.title?.trim() && jobData.description?.trim())
                : !!jobData.selectedJobId
            }
          />
        )}

        {step === CANDIDATA_FORM_DATA.STEPS.CANDIDATE_INFO && (
          <CandidateInfoBlock
            candidateData={candidateData}
            updateCandidateData={updateCandidateData}
            candidateFormFields={candidateFormFields}
            showValidationErrors={showValidationErrors}
            setShowValidationErrors={setShowValidationErrors}
            setStep={setStep}
            mutation={mutation}
            mode={mode}
            setErrors={setErrors}
            handleNextToOpinion={handleNextToOpinion}
          />
        )}

        {step === CANDIDATA_FORM_DATA.STEPS.RM_OPINION && (
          <RmOpinionBlock
            candidateData={candidateData}
            updateCandidateData={updateCandidateData}
            setStep={setStep}
            handleSubmit={handleSubmit}
            mutation={mutation}
            isCreatingNewJob={mode !== "edit"}
          />
        )}
      </div>
    </div>
  );
}
