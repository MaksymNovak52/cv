import { CANDIDATA_FORM_DATA } from "@/constants";
import { CandidateFormData, FormErrors } from "@/type";
import { useEffect, useRef, useState } from "react";
import { FormField, TextArea } from "../form-items";

export function CandidateInfoBlock({
  candidateData,
  updateCandidateData,
  candidateFormFields,
  showValidationErrors,
  setShowValidationErrors,
  setStep,
  mutation,
  setErrors,
  handleNextToOpinion,
  mode,
}: {
  setShowValidationErrors: (showValidationErrors: boolean) => void;
  handleNextToOpinion: () => void;
  mutation: any;
  setStep: (mode: number) => void;
  setErrors: (errors: FormErrors) => void;
  candidateData: CandidateFormData;
  updateCandidateData: (updates: Partial<CandidateFormData>) => void;
  candidateFormFields: any[];
  mode: string;

  showValidationErrors: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrolled = el.scrollTop > 0;
      setHasScroll(scrolled);
    };

    el.addEventListener("scroll", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div className="flex flex-col gap-0   overflow-hidden">
      <div
        className=" h-[540px]  min-[1600px]:h-[600px]  overflow-y-scroll "
        ref={contentRef}
      >
        <h5 className="text-[40px] w-full text-center  font-medium text-[#211C1A] font-eb-garamond">
          {mode === "edit" ? "Edit candidate" : "  Candidate Info"}
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
          <FormField label="Short Brief">
            <TextArea
              placeholder="Key achievements, notable projects, impact delivered"
              value={candidateData.highlights}
              onChange={(e) =>
                updateCandidateData({ highlights: e.target.value })
              }
              isRequired
              showValidation={showValidationErrors}
              label="Short Brief"
            />
          </FormField>
        </div>
        <div className="  pl-6 lg:pl-0">
          <FormField label="requirements">
            <TextArea
              placeholder="List key requirements met (experience, shipped apps, integrations, teamwork)"
              value={candidateData.skills}
              onChange={(e) => updateCandidateData({ skills: e.target.value })}
              isRequired
              showValidation={showValidationErrors}
              label="Summary"
            />
          </FormField>
        </div>
      </div>

      <div
        className={` flex relative  mt-2 lg:mt-4 px-10 lg:px-0 
             ${
               mode !== "edit"
                 ? "justify-between "
                 : "w-full items-center justify-center  "
             }`}
      >
        <div
          className="w-[751px] h-[20px]  absolute -left-10 -top-2"
          style={{
            boxShadow: hasScroll ? "1px -12px 5px 0px rgba(0,0,0,0.02)" : "",
          }}
        ></div>
        {mode !== "edit" && (
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
        )}
        <button
          onClick={handleNextToOpinion}
          disabled={mutation.isPending}
          className="w-[167px] h-[40px] flex items-center justify-center bg-[#242537] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending
            ? "Saving..."
            : mode == "edit"
            ? "Save"
            : "  Next"}
        </button>
      </div>
    </div>
  );
}
