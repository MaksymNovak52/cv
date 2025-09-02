"use client";

import { CANDIDATA_FORM_DATA } from "@/constants";
import { useFormData } from "@/hooks";
import { useUrlValidation } from "@/hooks/useUrlValidation";
import { useCreateJobWithCandidate, useJobs } from "@/queries/candidates";
import { CandidateFormData, FormErrors, Job } from "@/type";
import { useState } from "react";
import {
  CloseButton,
  FormField,
  Input,
  Select,
  StepIndicator,
  TextArea,
} from "./form-items";

const getCandidateFormFields = (
  candidateData: CandidateFormData,
  updateCandidateData: (updates: Partial<CandidateFormData>) => void,
  errors: FormErrors
) => [
  {
    label: "FULL NAME",
    component: (
      <Input
        placeholder="Full Name"
        value={candidateData.name}
        onChange={(e) => updateCandidateData({ name: e.target.value })}
      />
    ),
  },
  {
    label: "Current position",
    component: (
      <Input
        placeholder="Current position"
        value={candidateData.title}
        onChange={(e) => updateCandidateData({ title: e.target.value })}
      />
    ),
  },
  {
    label: "Location",
    component: (
      <Input
        placeholder="Location"
        value={candidateData.location}
        onChange={(e) => updateCandidateData({ location: e.target.value })}
      />
    ),
  },
  {
    label: "Experience",
    component: (
      <Input
        type="number"
        placeholder="Experience (years)"
        value={candidateData.experience}
        onChange={(e) =>
          updateCandidateData({ experience: Number(e.target.value) || null })
        }
      />
    ),
  },
  {
    label: "Notice Period",
    component: (
      <Input
        placeholder="Notice Period"
        value={candidateData.deployment}
        onChange={(e) => updateCandidateData({ deployment: e.target.value })}
      />
    ),
  },
  {
    label: "English Level",
    component: (
      <Select
        value={candidateData.englishLevel}
        onChange={(e) => updateCandidateData({ englishLevel: e.target.value })}
        options={CANDIDATA_FORM_DATA.ENGLISH_LEVELS.map((level) => ({
          value: level,
          label: level,
        }))}
        className="text-[12px]"
      />
    ),
  },
  {
    label: "Salary expected",
    component: (
      <Input
        type="number"
        placeholder="Salary"
        value={candidateData.salary}
        onChange={(e) =>
          updateCandidateData({ salary: Number(e.target.value) || null })
        }
      />
    ),
  },
  {
    label: "Portfolio URL",
    component: (
      <Input
        placeholder="Portfolio URL"
        value={candidateData.portfolioUrl}
        onChange={(e) => updateCandidateData({ portfolioUrl: e.target.value })}
        hasError={!!errors.portfolio}
      />
    ),
    error: errors.portfolio,
  },
  {
    label: "CV URL",
    component: (
      <Input
        placeholder="LinkedIn URL"
        value={candidateData.linkedinUrl}
        onChange={(e) => updateCandidateData({ linkedinUrl: e.target.value })}
        hasError={!!errors.linkedin}
      />
    ),
    error: errors.linkedin,
  },
];

export function CreateJobCandidateModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [step, setStep] = useState<number>(
    CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION
  );
  const { data: jobs } = useJobs();
  const mutation = useCreateJobWithCandidate();

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
    if (
      !candidateData.name?.trim() ||
      !candidateData.title?.trim() ||
      !candidateData.location?.trim() ||
      candidateData.experience === null ||
      candidateData.experience < 0 ||
      !candidateData.englishLevel?.trim() ||
      candidateData.salary === null ||
      candidateData.salary < 0
    ) {
      return false;
    }

    const urlErrors = validateUrls(
      candidateData.portfolioUrl,
      candidateData.linkedinUrl
    );

    if (Object.keys(urlErrors).length > 0) {
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    const urlErrors = validateUrls(
      candidateData.portfolioUrl,
      candidateData.linkedinUrl
    );
    if (Object.keys(urlErrors).length > 0) {
      setErrors(urlErrors);
      return;
    }

    const skillsArray = candidateData.skills
      ? candidateData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

    const payload = {
      organizationId: CANDIDATA_FORM_DATA.ORGANIZATION_ID,
      opinion: candidateData.opinion || "",
      candidate: {
        name: candidateData.name || "",
        title: candidateData.title || "",
        location: candidateData.location || "",
        experience: candidateData.experience || 0,
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
      },
      skills: skillsArray,
      ...(jobData.selectedJobId
        ? { jobId: jobData.selectedJobId }
        : {
            jobTitle: jobData.title || "",
            jobDescription: jobData.description || "",
          }),
    };

    mutation.mutate(payload, {
      onSuccess: () => {
        console.log("Success: Job with candidate created");
        setOpen(false);
        resetForm();
        setStep(CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION);
      },
      onError: (e) => {
        console.error("Error creating job with candidate:", e);
      },
    });
  };

  const jobOptions =
    jobs?.map((job: Job) => ({
      value: job.job_id,
      label: job.title,
    })) || [];

  const candidateFormFields = getCandidateFormFields(
    candidateData,
    updateCandidateData,
    errors
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 box-border ">
      <div
        className={`bg-white rounded-xl shadow-lg  ${
          step === CANDIDATA_FORM_DATA.STEPS.CANDIDATE_INFO &&
          "w-full max-w-[751px] h-[98%] max-h-[801px] px-[39px] py-[28px]"
        }
        
        ${
          step === CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION &&
          "w-[464px] h-[537px] pt-[28px] px-[67px] "
        }
        ${
          step === CANDIDATA_FORM_DATA.STEPS.RM_OPINION &&
          " pt-[28px] w-[464px] "
        }
        `}
      >
        <CloseButton onClose={() => setOpen(false)} />

        <StepIndicator currentStep={step} />

        {step === CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION && (
          <div className="space-y-2  ">
            <h5 className="text-[40px] leading-[-0.14px] w-full text-center pt-10 font-eb-garamond">
              Select or Create Job
            </h5>

            <div className="flex flex-col justify-center items-center flex-1 w-[330px] mx-auto gap-1">
              <FormField label="Existing Vacancy">
                <Select
                  value={jobData.selectedJobId ?? ""}
                  onChange={(e) =>
                    updateJobData({ selectedJobId: e.target.value || null })
                  }
                  options={jobOptions}
                  placeholder="Create New"
                />
              </FormField>

              {!jobData.selectedJobId && (
                <>
                  <FormField label="Job Title">
                    <Input
                      placeholder="Job Title"
                      value={jobData.title}
                      onChange={(e) => updateJobData({ title: e.target.value })}
                      className="w-[330px]"
                    />
                  </FormField>

                  <FormField label="Job description">
                    <TextArea
                      placeholder="Job Description"
                      value={jobData.description}
                      onChange={(e) =>
                        updateJobData({ description: e.target.value })
                      }
                    />
                  </FormField>
                </>
              )}

              <div className="flex justify-end mt-4">
                <button
                  disabled={
                    !jobData.selectedJobId &&
                    (!jobData.title?.trim() || !jobData.description?.trim())
                  }
                  onClick={() =>
                    setStep(CANDIDATA_FORM_DATA.STEPS.CANDIDATE_INFO)
                  }
                  className="px-4 py-2 bg-[#242537] text-white rounded-md w-[330px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {step === CANDIDATA_FORM_DATA.STEPS.CANDIDATE_INFO && (
          <div className="flex flex-col gap-0 ">
            <h5 className="text-[40px] leading-[-0.14px] w-full text-center">
              Candidate Info
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 w-full">
              {candidateFormFields.map((field, index) => (
                <FormField key={index} label={field.label} error={field.error}>
                  {field.component}
                </FormField>
              ))}
            </div>

            <FormField label="Highlights">
              <TextArea
                placeholder="Key achievements, notable projects, impact delivered"
                value={candidateData.highlights}
                onChange={(e) =>
                  updateCandidateData({ highlights: e.target.value })
                }
              />
            </FormField>

            <FormField label="requirements">
              <TextArea
                placeholder="List key requirements met (experience, shipped apps, integrations, teamwork)"
                value={candidateData.skills}
                onChange={(e) =>
                  updateCandidateData({ skills: e.target.value })
                }
              />
            </FormField>

            <div className="flex justify-between mt-2">
              <button
                onClick={() => setStep(CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION)}
                className=" flex items-center justify-center gap-1 text-[14px] font-bold"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="12"
                  viewBox="0 0 14 12"
                  fill="none"
                >
                  <path
                    d="M12.4297 6H1.00112"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.67578 1L1.00046 6L5.67578 11"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back
              </button>
              <button
                onClick={() => setStep(CANDIDATA_FORM_DATA.STEPS.RM_OPINION)}
                disabled={mutation.isPending || !isCandidateInfoValid()}
                className="w-[167px] h-[40px] flex items-center justify-center bg-[#242537] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? "Saving..." : "  Next"}
              </button>
            </div>
          </div>
        )}

        {step === CANDIDATA_FORM_DATA.STEPS.RM_OPINION && (
          <div className="space-y-2 w-[464px] h-[500px]">
            <h5 className="text-[40px] leading-[-0.14px] w-full text-center pt-4">
              RM opinion
            </h5>

            <div className="flex flex-col justify-center items-center flex-1 w-[330px] mx-auto gap-1">
              <FormField label="RM opinion">
                <TextArea
                  value={candidateData.opinion ?? ""}
                  onChange={(e) =>
                    updateCandidateData({ opinion: e.target.value })
                  }
                  height="h-[256px]"
                  placeholder="Write recruiter/manager opinion about candidate"
                />
              </FormField>

              <div className="flex justify-between mt-2 w-full">
                <button
                  onClick={() =>
                    setStep(CANDIDATA_FORM_DATA.STEPS.CANDIDATE_INFO)
                  }
                  className=" flex items-center justify-center gap-1 text-[14px] font-bold"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="12"
                    viewBox="0 0 14 12"
                    fill="none"
                  >
                    <path
                      d="M12.4297 6H1.00112"
                      stroke="black"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.67578 1L1.00046 6L5.67578 11"
                      stroke="black"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    mutation.isPending || !candidateData.opinion?.trim()
                  }
                  className="w-[167px] h-[40px] flex items-center justify-center bg-[#242537] text-white rounded-md disabled:opacity-50"
                >
                  {mutation.isPending ? "Saving..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
