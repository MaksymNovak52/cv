"use client";

import { CANDIDATA_FORM_DATA } from "@/constants";
import { useFormData, useLockBodyScroll } from "@/hooks";
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
  errors: FormErrors,
  showValidationErrors: boolean = false
) => [
  {
    label: "FULL NAME",
    component: (
      <Input
        placeholder="Full Name"
        value={candidateData.name}
        onChange={(e) => updateCandidateData({ name: e.target.value })}
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
        onChange={(e) => updateCandidateData({ title: e.target.value })}
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
        onChange={(e) => updateCandidateData({ location: e.target.value })}
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
        onChange={(e) => updateCandidateData({ experience: e.target.value })}
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
        onChange={(e) => updateCandidateData({ deployment: e.target.value })}
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
        onChange={(e) => updateCandidateData({ englishLevel: e.target.value })}
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
    label: "Gender",
    component: (
      <Select
        value={candidateData.gender}
        onChange={(e) => updateCandidateData({ gender: e.target.value })}
        options={CANDIDATA_FORM_DATA.GENDERS.map((g) => ({
          value: g,
          label: g,
        }))}
        className="text-[12px]"
        placeholder="Select Gender"
        isRequired
        showValidation={showValidationErrors}
        label="Gender"
      />
    ),
    isRequired: true,
    isEmpty: !candidateData.gender?.trim(),
  },
  {
    label: "Salary expected, in $usd",
    component: (
      <Input
        type="number"
        label="Salary expected, in $usd"
        placeholder="Salary"
        value={candidateData.salary}
        onChange={(e) =>
          updateCandidateData({ salary: Number(e.target.value) || null })
        }
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
        onChange={(e) => updateCandidateData({ portfolioUrl: e.target.value })}
        hasError={!!errors.portfolio}
        showValidation={showValidationErrors}
        isRequired
      />
    ),
    error: errors.portfolio,
    isRequired: true,
    isEmpty: !candidateData.portfolioUrl?.trim(),
  },
  {
    label: "CV URL",
    component: (
      <Input
        placeholder="CV URL"
        value={candidateData.linkedinUrl}
        onChange={(e) => updateCandidateData({ linkedinUrl: e.target.value })}
        showValidation={showValidationErrors}
      />
    ),
    error: errors.linkedin,
    isRequired: false,
    isEmpty: !candidateData.linkedinUrl?.trim(),
  },
];

export function CreateJobCandidateModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  useLockBodyScroll(open);

  const [step, setStep] = useState<number>(
    CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION
  );
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [showJobValidation, setShowJobValidation] = useState(false);
  const [isCreatingNewJob, setIsCreatingNewJob] = useState(false);

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
      Number(candidateData.experience) < 0 ||
      !candidateData.englishLevel?.trim() ||
      candidateData.salary === null ||
      Number(candidateData.salary) < 0 ||
      !candidateData.highlights?.trim() ||
      !candidateData.deployment?.trim() ||
      !candidateData.portfolioUrl?.trim() ||
      !candidateData.skills?.trim() ||
      !candidateData.gender?.trim()
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
    if (!isCandidateInfoValid()) {
      setShowValidationErrors(true);
      const urlErrors = validateUrls(
        candidateData.portfolioUrl,
        candidateData.linkedinUrl
      );
      setErrors(urlErrors);
      return;
    }
    setShowValidationErrors(false);
    setStep(CANDIDATA_FORM_DATA.STEPS.RM_OPINION);
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
        setOpen(false);
        resetForm();
        setStep(CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION);
        setShowValidationErrors(false);
        setShowJobValidation(false);
        setIsCreatingNewJob(false);
      },
      onError: (e) => {
        console.error("Error creating job with candidate:", e);
      },
    });
  };

  const enterCreateMode = () => {
    setIsCreatingNewJob(true);
    setShowJobValidation(false);
    updateJobData({ selectedJobId: null });
  };

  const exitCreateMode = () => {
    setIsCreatingNewJob(false);
    setShowJobValidation(false);
  };

  const candidateFormFields = getCandidateFormFields(
    candidateData,
    updateCandidateData,
    errors,
    showValidationErrors
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center  justify-center z-50 box-border  overflow-hidden   lg: h-screen">
      <div
        className={`bg-white rounded-xl shadow-lg   ${
          step === CANDIDATA_FORM_DATA.STEPS.CANDIDATE_INFO &&
          "w-[360px] lg:w-full max-w-[751px]   lg:h-[99%] overflow-y-scroll lg:overflow-hidden lg:max-h-[801px] min-[1200px]:max-h-max px-[39px] py-[28px]"
        }
        ${
          step === CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION &&
          " w-[360px] lg:w-[464px] h-[537px] pt-[28px] px-[50px] lg:px-[67px]"
        }
        ${
          step === CANDIDATA_FORM_DATA.STEPS.RM_OPINION &&
          "pt-[28px] w-[360px] lg:w-[464px]"
        }`}
      >
        <CloseButton onClose={() => setOpen(false)} />
        <StepIndicator currentStep={step} />

        {step === CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION && (
          <div className="space-y-2 ">
            <h5 className="text-[40px] leading-[-0.14px]  text-center pt-10 font-eb-garamond lg:w-full w-[70%] mx-auto">
              Select or Create Job
            </h5>

            <div className="flex flex-col justify-center items-center flex-1 w-[280px] lg:w-[330px]  mx-auto gap-1">
              <FormField
                label={isCreatingNewJob ? "New Vacancy" : "Existing Vacancy"}
                isRequired
                isEmpty={
                  isCreatingNewJob
                    ? !jobData.title?.trim() || !jobData.description?.trim()
                    : !jobData.selectedJobId
                }
                showValidation={showJobValidation}
              >
                {!isCreatingNewJob ? (
                  <div className="flex flex-col gap-2 w-full  ">
                    <div className="max-h-[160px] overflow-auto   pr-1 space-y-2">
                      {(jobs ?? []).length === 0 && (
                        <div className="text-xs text-[#666] italic">
                          No vacancies yet.
                        </div>
                      )}

                      {jobs?.map((job: Job) => {
                        const selected = jobData.selectedJobId === job.job_id;
                        return (
                          <div
                            key={job.job_id}
                            role="button"
                            tabIndex={0}
                            aria-selected={selected}
                            onClick={() =>
                              updateJobData({ selectedJobId: job.job_id })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                updateJobData({ selectedJobId: job.job_id });
                              }
                            }}
                            className={`w-[90%] lg:w-[330px] h-[42px] border rounded-md flex items-center justify-between px-[14px] cursor-pointer transition
                             bg-[#FAFAFA] border-[#F0F0F0] hover:bg-[#eaeaea]`}
                          >
                            <div className="flex flex-row gap-2 items-center">
                              <span
                                className={`h-[10px] w-[10px] rounded-full border ${
                                  selected
                                    ? "bg-emerald-500 border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]"
                                    : "border-[#CFCFCF]"
                                }`}
                                aria-hidden
                              />
                              <input
                                type="radio"
                                id={job.job_id}
                                name="job"
                                value={job.job_id}
                                checked={selected}
                                accept=""
                                onChange={() =>
                                  updateJobData({
                                    selectedJobId: job.job_id,
                                  })
                                }
                                className="hidden"
                              />
                              <label
                                htmlFor={job.job_id}
                                className="text-[#211C1A] font-bold text-[14px] leading-[-0.14px] line-clamp-1"
                                title={job.title}
                              >
                                {job.title}
                              </label>
                            </div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                            >
                              <path
                                d="M13.667 3.51434L10.4861 0.333583C10.3804 0.227824 10.2548 0.143932 10.1166 0.0866955C9.97845 0.0294592 9.83035 0 9.68078 0C9.53121 0 9.38311 0.0294592 9.24493 0.0866955C9.10675 0.143932 8.9812 0.227824 8.87545 0.333583L7.00038 2.20857L7.00028 2.20868L7.00017 2.20878L0.333634 8.87506C0.227531 8.98056 0.14341 9.10606 0.0861415 9.2443C0.0288734 9.38253 -0.000404079 9.53075 4.21222e-06 9.68038V12.8611C0.000349543 13.1631 0.120453 13.4525 0.333965 13.666C0.547478 13.8796 0.836964 13.9997 1.13892 14H4.31979C4.46942 14.0004 4.61764 13.9711 4.75587 13.9139C4.8941 13.8566 5.0196 13.7725 5.12511 13.6664L13.667 5.1249C13.8802 4.91115 14 4.62155 14 4.31961C14 4.01768 13.8802 3.72808 13.667 3.51434ZM11.3891 5.79207L8.20827 2.61132L9.68076 1.13887L12.8616 4.31962L11.3891 5.79207Z"
                                fill="#211C1A"
                              />
                            </svg>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={enterCreateMode}
                      className="w-[90%] lg:w-[330px] h-[42px] flex items-center justify-center rounded-md mt-[5px] border border-dashed border-[#CFCFCF] text-[#211C1A] font-bold text-[14px] leading-[-0.14px] hover:bg-[#fafafa] transition"
                    >
                      + Create new
                    </button>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold"></span>
                    </div>

                    <div className="space-y-2">
                      <FormField
                        label="Job Title"
                        isRequired
                        isEmpty={!jobData.title?.trim()}
                        showValidation={showJobValidation}
                      >
                        <Input
                          placeholder="Job Title"
                          value={jobData.title}
                          onChange={(e) =>
                            updateJobData({ title: e.target.value })
                          }
                          className="w-[90%] lg:w-[330px]"
                          isRequired
                          showValidation={showJobValidation}
                        />
                      </FormField>

                      <FormField
                        label="Job description"
                        isRequired
                        isEmpty={!jobData.description?.trim()}
                        showValidation={showJobValidation}
                      >
                        <TextArea
                          placeholder="Job Description"
                          value={jobData.description}
                          label="Job description"
                          onChange={(e) =>
                            updateJobData({ description: e.target.value })
                          }
                          isRequired
                          showValidation={showJobValidation}
                        />
                      </FormField>
                    </div>
                  </div>
                )}
              </FormField>

              <div className="flex justify-between mt-[20px] lg:mt-[90px] w-full ">
                {isCreatingNewJob && (
                  <button
                    type="button"
                    onClick={exitCreateMode}
                    className="text-[14px] leading-[-0.14px] font-bold  4 hover:opacity-80 flex flex-row items-center gap-2 "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="12"
                      viewBox="0 0 14 12"
                      fill="none"
                    >
                      <path
                        d="M12.4257 6H0.997088"
                        stroke="black"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.67188 1L0.996551 6L5.67188 11"
                        stroke="black"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    Back
                  </button>
                )}
                <button
                  onClick={handleNextToCandidateInfo}
                  className={`px-4 py-2 bg-[#242537] text-white rounded-md ${
                    isCreatingNewJob ? "w-[167px]" : "w-[90%] lg:w-[330px]"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {step === CANDIDATA_FORM_DATA.STEPS.CANDIDATE_INFO && (
          <div className="flex flex-col gap-0  ">
            <div className=" h-[540px]  min-[1600px]:h-[600px] overflow-y-scroll">
              <h5 className="text-[40px] w-full text-center  font-medium text-[#211C1A] font-eb-garamond">
                Candidate Info
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 w-full  pl-6 lg:pl-0">
                {candidateFormFields.map((field, index) => (
                  <FormField
                    key={index}
                    label={field.label}
                    error={field.error}
                    isRequired={field.isRequired}
                    isEmpty={field.isEmpty}
                    showValidation={showValidationErrors}
                  >
                    {field.component}
                  </FormField>
                ))}
              </div>
              <div className="  pl-6 lg:pl-0">
                <FormField label="Highlights">
                  <TextArea
                    placeholder="Key achievements, notable projects, impact delivered"
                    value={candidateData.highlights}
                    onChange={(e) =>
                      updateCandidateData({ highlights: e.target.value })
                    }
                    isRequired
                    showValidation={showValidationErrors}
                    label="Highlights"
                  />
                </FormField>
              </div>
              <div className="  pl-6 lg:pl-0">
                <FormField label="requirements">
                  <TextArea
                    placeholder="List key requirements met (experience, shipped apps, integrations, teamwork)"
                    value={candidateData.skills}
                    onChange={(e) =>
                      updateCandidateData({ skills: e.target.value })
                    }
                    isRequired
                    showValidation={showValidationErrors}
                    label="Requirements met"
                  />
                </FormField>
              </div>
            </div>
            <div className="flex justify-between  mt-2 lg:mt-4">
              <button
                onClick={() => {
                  setStep(CANDIDATA_FORM_DATA.STEPS.JOB_SELECTION);
                  setShowValidationErrors(false);
                }}
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
                onClick={handleNextToOpinion}
                disabled={mutation.isPending}
                className="w-[167px] h-[40px] flex items-center justify-center bg-[#242537] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? "Saving..." : "  Next"}
              </button>
            </div>
          </div>
        )}

        {step === CANDIDATA_FORM_DATA.STEPS.RM_OPINION && (
          <div className="space-y-2 w-[300px] lg:w-[464px]  h-[500px] mx-auto ">
            <h5 className="text-[40px] leading-[-0.14px] w-full text-center pt-4">
              RM opinion
            </h5>

            <div className="flex flex-col justify-center items-center flex-1   w-[300px] pl-6 lg:pl-0 lg:w-[330px] mx-auto gap-1">
              <FormField
                label="RM opinion"
                isRequired
                isEmpty={!candidateData.opinion?.trim()}
                showValidation
              >
                <TextArea
                  value={candidateData.opinion ?? ""}
                  onChange={(e) =>
                    updateCandidateData({ opinion: e.target.value })
                  }
                  label="RM opinion"
                  height="h-[256px]"
                  placeholder="Write recruiter/manager opinion about candidate"
                  isRequired
                  showValidation
                />
              </FormField>

              <div className="flex justify-between mt-4 w-full">
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
