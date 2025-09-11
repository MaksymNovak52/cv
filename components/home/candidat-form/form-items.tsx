import { useId } from "react";

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const getStepStyle = (step: number) => {
    if (step < currentStep) return "font-semibold text-[#259A6D]";
    if (step === currentStep) return "font-semibold text-[#211C1A]";
    return "font-normal text-[#CCCCCC]";
  };

  const getLineColor = (step: number) => {
    return step < currentStep ? "#259A6D" : "#CCCCCC";
  };

  return (
    <div className="flex justify-center gap-1 items-center text-sm text-gray-500">
      <span className={getStepStyle(1)}>[01]</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="44"
        height="2"
        viewBox="0 0 44 2"
        fill="none"
      >
        <path opacity="0.5" d="M0 1H44" stroke={getLineColor(1)} />
      </svg>
      <span className={getStepStyle(2)}>[02]</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="44"
        height="2"
        viewBox="0 0 44 2"
        fill="none"
      >
        <path opacity="0.5" d="M0 1H44" stroke={getLineColor(2)} />
      </svg>
      <span className={getStepStyle(3)}>[03]</span>
    </div>
  );
};

const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <div
    className="fixed lg:right-[32px] lg:top-[28px]  right-[20px] top-[10px] cursor-pointer flex flex-col items-start text-[16px] text-white font-bold leading-[-0.16px] z-10"
    onClick={onClose}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M15 1L1 15"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 15L1 1"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const FormField = ({
  label,
  children,
  error,
  isRequired = false,
  isEmpty = false,
  showValidation = false,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  isRequired?: boolean;
  isEmpty?: boolean;
  showValidation?: boolean;
}) => {
  const showRequired = isRequired && isEmpty && showValidation;
  const finalError = error || (showRequired ? "Required" : "");

  return (
    <div className="w-full  mx-auto   ">
      <div className="flex items-center justify-center mb-1"></div>
      {children}
    </div>
  );
};
const Input = ({
  placeholder,
  value,
  onChange,
  type = "text",
  hasError = false,
  className = "",
  isRequired = false,
  label = "",
  showValidation = false,
  isRightBlock = false,
  equityChecked,
  onEquityChange,
}: {
  placeholder: string;
  value: string | number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  label?: string;
  hasError?: boolean;
  className?: string;
  isRequired?: boolean;
  showValidation?: boolean;
  isRightBlock?: boolean;
  equityChecked?: boolean;
  onEquityChange?: (checked: boolean) => void;
}) => {
  const isEmpty = value === null || value === "";
  const showError = (isRequired && isEmpty && showValidation) || hasError;

  const checked = !!equityChecked;

  return (
    <>
      <div className="flex flex-row items-center justify-between w-full">
        <p className="text-[10px] font-bold uppercase text-[#BCBBBA]">
          [{label || placeholder}] {isRequired && "*"}
        </p>
        {showError ? (
          <span className="text-[10px] font-bold uppercase text-[#FF3636] mr-[39px] lg:mr-1">
            {placeholder === "CV URL" ? "Attach CV" : `Enter ${placeholder}`}
          </span>
        ) : null}
      </div>

      <div
        className={`flex flex-row items-center w-[90%] lg:w-[330px] border rounded-md px-3 py-2 outline-none text-[16px] lg:text-[12px] font-bold focus:placeholder-[#4D4D4D]/50 ${
          showError
            ? "border-[#FF3636] text-[#FF3636] placeholder-[#FF3636]"
            : "border-[#CCCCCC] text-[#4D4D4D]/90 placeholder-[#4D4D4D]/90"
        } ${className}`}
      >
        <input
          type={type}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={onChange}
          aria-invalid={showError}
          className="outline-none w-full bg-transparent no-spinners"
        />

        {isRightBlock && (
          <label className="ml-2 w-[160px] inline-flex items-center  gap-[0px] cursor-pointer select-none">
            <span className="text-[10px] font-bold text-[#BCBBBA] w-full uppercase">
              Equity Package
            </span>
            <input
              type="checkbox"
              className="sr-only peer"
              checked={checked}
              onChange={(e) => onEquityChange?.(e.target.checked)}
            />
            <span
              className="relative inline-flex items-center justify-center w-[13px] h-[13px] rounded-full p-[2px] bg-[#C0C0C0] shadow-md
                         peer-focus-visible:ring-2 peer-focus-visible:ring-[#597D9B] peer-focus-visible:ring-offset-1"
              aria-hidden
            >
              {checked ? (
                <svg
                  viewBox="0 0 24 24"
                  className="w-[11px] h-[11px]"
                  fill="none"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="w-[11px] h-[11px]"
                  fill="none"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
          </label>
        )}
      </div>
    </>
  );
};

const TextArea = ({
  placeholder,
  value,
  onChange,
  height = "h-[84px]",
  isRequired = false,
  label = "",
  showValidation = false,
}: {
  placeholder: string;
  label?: string;
  value: string;
  height?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isRequired?: boolean;
  showValidation?: boolean;
}) => {
  const isEmpty = !value || value.trim() === "";
  const showError = isRequired && isEmpty && showValidation;

  return (
    <>
      <div className="flex flex-row items-center justify-between w-[90%] lg:w-full">
        <p className="text-[10px] font-bold uppercase text-[#BCBBBA]">
          [{label}] {isRequired && "*"}
        </p>
        <p className="text-[10px] font-bold uppercase text-[#FF3636] mr-[0px] lg:mr-1">
          {showError ? `Enter ${label}` : ""}
        </p>
      </div>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={showError}
        className={`w-[90%] lg:min-w-[330px] sm:w-full ${height} max-[1400px]:h-[104px] border resize-none rounded-md px-3 py-2 outline-none text-[12px] font-bold focus:placeholder-[#4D4D4D]/50 ${
          showError
            ? "border-[#FF3636] text-[#FF3636] placeholder-[#FF3636]"
            : "border-[#CCCCCC] text-[#4D4D4D]/90 placeholder-[#4D4D4D]/90"
        }`}
      />
    </>
  );
};

const Select = ({
  value,
  onChange,
  options,
  placeholder = "",
  className = "",
  isRequired = false,
  showValidation = false,
  label,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
  isRequired?: boolean;
  showValidation?: boolean;
  label?: string;
}) => {
  const isEmpty = !value || value === "";
  const showError = isRequired && isEmpty && showValidation;

  return (
    <>
      <div className="flex flex-row items-center justify-between w-full">
        <p className="text-[10px] font-bold uppercase text-[#BCBBBA]">
          [{label}] {isRequired && "*"}
        </p>
        <p className="text-[10px] font-bold uppercase text-[#FF3636] mr-10 lg:mr-1">
          {showError ? `Select ${label}` : ""}
        </p>
      </div>
      <div
        className={` w-[90%] lg:w-[330px] border outline-none rounded-md px-3 py-2 text-[10px] font-bold ${
          showError
            ? "border-[#FF3636] text-[#FF3636]"
            : "border-[#CCCCCC] text-[#4D4D4D]/90"
        } ${className}`}
      >
        <select
          value={value}
          onChange={onChange}
          aria-invalid={showError}
          className=" w-[99%] lg:w-[305px]"
        >
          {placeholder && (
            <option value="" className="text-[#4D4D4D]/60">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-[#4D4D4D]/90 font-bold"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

type RadioOption = { value: string; label: string };

function RadioSelect({
  value,
  onChange,
  options,
  label,
  className = "",
  isRequired = false,
  showValidation = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
  className?: string;
  isRequired?: boolean;
  showValidation?: boolean;
}) {
  const name = useId();
  const isEmpty = !value || value === "";
  const showError = isRequired && isEmpty && showValidation;

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <p className="text-[10px] font-bold uppercase text-[#BCBBBA]">
          [{label}] {isRequired && "*"}
        </p>
        <p className="text-[10px] font-bold uppercase text-[#FF3636] mr-10 lg:mr-1">
          {showError ? `Select ${label}` : ""}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={label ? `${name}-label` : undefined}
        aria-required={isRequired}
        aria-invalid={showError}
        className={`w-[90%] lg:w-[330px] flex items-center gap-[17px] py-2 ${className}`}
      >
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className="inline-flex items-center gap-1 cursor-pointer select-none"
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="sr-only peer"
              />
              <span
                className={[
                  "relative inline-flex items-center justify-center w-4 h-4 rounded-full border transition-colors",
                  checked ? "border-[#4D4D4D]" : "border-[#CFCFCF]",
                  "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#597D9B] peer-focus-visible:ring-offset-1",
                ].join(" ")}
                aria-hidden
              >
                <span
                  className={[
                    "h-2.5 w-2.5 rounded-full transition-transform",
                    checked
                      ? "scale-100 bg-[#4D4D4D]"
                      : "scale-0 bg-transparent",
                  ].join(" ")}
                />
              </span>
              <span
                className={`text-[12px] font-semibold ${
                  checked ? "text-[#211C1A]" : "text-[#A6A4A3]"
                }`}
              >
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </>
  );
}

export {
  CloseButton,
  FormField,
  Input,
  RadioSelect,
  Select,
  StepIndicator,
  TextArea,
};
