import { CANDIDATA_FORM_DATA } from "@/constants";
import { CandidateFormData } from "@/type";
import { FormField, TextArea } from "../form-items";

export function RmOpinionBlock({
  candidateData,
  updateCandidateData,
  setStep,
  handleSubmit,
  mutation,
  isCreatingNewJob,
}: {
  mutation: any;
  handleSubmit: () => void;
  candidateData: CandidateFormData;
  updateCandidateData: (updates: Partial<CandidateFormData>) => void;
  setStep: (step: number) => void;
  isCreatingNewJob: boolean;
}) {
  return (
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
            onChange={(e) => updateCandidateData({ opinion: e.target.value })}
            label="RM opinion"
            height="h-[256px]"
            placeholder="Write recruiter/manager opinion about candidate"
            isRequired
            showValidation={candidateData.opinion?.length > 1}
          />
        </FormField>

        <div className="flex justify-between mt-4 w-full">
          <button
            onClick={() => setStep(CANDIDATA_FORM_DATA.STEPS.CANDIDATE_INFO)}
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
            disabled={mutation.isPending || !candidateData.opinion?.trim()}
            className="w-[167px] h-[40px] flex items-center justify-center bg-[#242537] text-white rounded-md disabled:opacity-50"
          >
            {mutation.isPending
              ? "Saving..."
              : isCreatingNewJob
              ? "Create"
              : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
