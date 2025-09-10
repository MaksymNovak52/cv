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
}) => {
  const isEmpty = value === null || value === "";
  const showError = (isRequired && isEmpty && showValidation) || hasError;
  return (
    <>
      <div className="flex flex-row items-center justify-between w-full">
        <p className="text-[10px] font-bold uppercase text-[#BCBBBA]">
          [{label || placeholder}] {isRequired && "*"}
        </p>
        {showError ? (
          <span className="text-[10px] font-bold uppercase text-[#FF3636] mr-[39px] lg:mr-1">
            {`  ${
              placeholder === "CV URL" ? "Attach CV" : `Enter ${placeholder}`
            } `}
          </span>
        ) : null}
      </div>

      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={onChange}
        aria-invalid={showError}
        className={` w-[90%] lg:w-[330px] border rounded-md px-3 py-2 outline-none text-[16px] lg:text-[12px] font-bold focus:placeholder-[#4D4D4D]/50 ${
          showError
            ? "border-[#FF3636] text-[#FF3636] placeholder-[#FF3636]"
            : "border-[#CCCCCC] text-[#4D4D4D]/90 placeholder-[#4D4D4D]/90"
        } ${className}`}
      />
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

export { CloseButton, FormField, Input, Select, StepIndicator, TextArea };
