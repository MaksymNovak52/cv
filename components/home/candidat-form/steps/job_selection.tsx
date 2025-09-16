import { useUpdateJob } from "@/queries/candidates";
import { Job, JobFormData } from "@/type";
import { useState } from "react";
import { FormField, Input, TextArea } from "../form-items";

interface IJobSelectionBlockProps {
  jobs: Array<Job> | null;
  enterCreateMode: () => void;
  handleNextToCandidateInfo: () => void;
  jobData: JobFormData;
  updateJobData: (updates: Partial<JobFormData>) => void;
  isCreatingNewJob: boolean;
  showJobValidation: boolean;
  exitCreateMode: () => void;
  mode: string;
}

export function JobSelectionBlock({
  jobs,
  jobData,
  updateJobData,
  isCreatingNewJob,
  showJobValidation,
  exitCreateMode,
  handleNextToCandidateInfo,
  enterCreateMode,
  mode,
}: IJobSelectionBlockProps) {
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const updateJobMutation = useUpdateJob();

  const handleEditClick = (job: Job) => {
    setEditingJobId(job.job_id);
    updateJobData({
      title: job.title,
      description: job.description ?? "",
      selectedJobId: job.job_id,
    });
    enterCreateMode();
  };

  const handleSave = () => {
    if (editingJobId) {
      updateJobMutation.mutate({
        jobId: editingJobId,
        title: jobData.title ?? "",
        description: jobData.description ?? "",
      });
      setEditingJobId(null);
      exitCreateMode();
    } else {
      handleNextToCandidateInfo();
    }
  };

  return (
    <div className="space-y-2  ">
      <h5 className="text-[40px] text-center pt-10 font-eb-garamond">
        Select or Create Job
      </h5>

      <div className="flex flex-col items-center w-[280px] lg:w-[330px] mx-auto gap-1  ">
        <FormField
          label={
            isCreatingNewJob
              ? editingJobId
                ? "Edit Vacancy"
                : "New Vacancy"
              : "Existing Vacancy"
          }
          isRequired
          isEmpty={
            isCreatingNewJob
              ? !jobData.title?.trim() || !jobData.description?.trim()
              : !jobData.selectedJobId
          }
          showValidation={showJobValidation}
        >
          {!isCreatingNewJob ? (
            <div className="flex flex-col gap-2 w-full ">
              <div className="max-h-[160px]   overflow-auto pr-1 space-y-2">
                {(jobs ?? []).length === 0 && (
                  <div className="text-xs text-[#666] italic">
                    No vacancies yet.
                  </div>
                )}

                {jobs?.map((job) => {
                  const selected = jobData.selectedJobId === job.job_id;
                  return (
                    <div
                      key={job.job_id}
                      className="w-[90%] lg:w-[330px] h-[42px] border rounded-md flex items-center justify-between px-[14px] bg-[#FAFAFA] border-[#F0F0F0]"
                    >
                      <label className="flex flex-row gap-2 items-center cursor-pointer">
                        <input
                          type="radio"
                          name="job"
                          value={job.job_id}
                          checked={selected}
                          onChange={() =>
                            updateJobData({ selectedJobId: job.job_id })
                          }
                          className="hidden"
                        />
                        <span
                          className={`h-[10px] w-[10px] rounded-full border ${
                            selected
                              ? "bg-emerald-500 border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]"
                              : "border-[#CFCFCF]"
                          }`}
                        />
                        <span className="font-bold text-[14px] truncate">
                          {job.title}
                        </span>
                      </label>

                      <button onClick={() => handleEditClick(job)}>
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
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={enterCreateMode}
                className="w-[90%]  lg:w-[330px] h-[42px] mt-[5px] border border-dashed rounded-md"
              >
                + Create new
              </button>
            </div>
          ) : (
            <div className="w-full space-y-2">
              <FormField
                label="Job Title"
                isRequired
                isEmpty={!jobData.title?.trim()}
                showValidation={showJobValidation}
              >
                <Input
                  placeholder="Job Title"
                  value={jobData.title}
                  onChange={(e) => updateJobData({ title: e.target.value })}
                  className="w-[90%] lg:w-[330px]"
                />
              </FormField>

              <FormField
                label="Job description"
                isRequired
                isEmpty={!jobData.description?.trim()}
                showValidation={showJobValidation}
              >
                <TextArea
                  label="Job description"
                  placeholder="Job description"
                  value={jobData.description}
                  height="h-[204px]"
                  onChange={(e) =>
                    updateJobData({ description: e.target.value })
                  }
                />
              </FormField>
            </div>
          )}
        </FormField>

        <div
          className={`flex justify-between mt-auto  
            absolute ${
              !isCreatingNewJob ? "bottom-[44px]" : "bottom-[40px]"
            } w-[252px] lg:w-[330px] left-1/2 transform -translate-x-1/2`}
        >
          {isCreatingNewJob && (
            <button
              onClick={() => {
                setEditingJobId(null);
                exitCreateMode();
              }}
              className="text-sm font-bold flex items-center gap-2"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleSave}
            className={`px-4 py-2 bg-[#242537] text-white rounded-md ${
              !isCreatingNewJob
                ? "lg:w-[330px]  w-[280px] mx-auto"
                : "w-[100px] lg:w-[167px]"
            }`}
          >
            {editingJobId ? "Save" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
