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
    className="fixed right-[32px] cursor-pointer flex flex-col items-start top-[28px] text-[16px] text-white font-bold leading-[-0.16px] z-10"
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
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) => (
  <div className="">
    <p className="text-[#BCBBBA] text-[10px] font-bold uppercase">[{label}]</p>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const Input = ({
  placeholder,
  value,
  onChange,
  type = "text",
  hasError = false,
  className = "",
}: {
  placeholder: string;
  value: string | number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  hasError?: boolean;
  className?: string;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value ?? ""}
    onChange={onChange}
    className={`w-[330px] border rounded-md px-3 py-2 outline-none text-[12px]   text-[#4D4D4D]/90 placeholder-[#4D4D4D]/90  font-bold ${
      hasError ? "border-red-500" : "border-[#CCCCCC]"
    } ${className}`}
  />
);

const TextArea = ({
  placeholder,
  value,
  onChange,
  height = "h-[84px]",
}: {
  placeholder: string;
  value: string;
  height?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`min-w-[330px] w-full ${height}  max-[1400px]:h-[104px] border resize-none border-[rgba(0, 0, 0, 1)] rounded-md px-3 py-2 outline-none text-[12px] text-[#4D4D4D]/90 placeholder-[#4D4D4D]/90  font-bold`}
  />
);

const Select = ({
  value,
  onChange,
  options,
  placeholder = "",
  className = "",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}) => (
  <select
    value={value}
    onChange={onChange}
    className={`w-[330px] border border-[#CCCCCC] text-[#4D4D4D]/90 placeholder-[#4D4D4D]/90 outline-none rounded-md px-3 py-2 text-[10px] font-bold ${className}`}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((option) => (
      <option
        key={option.value}
        value={option.value}
        className="text-[#4D4D4D]/90 placeholder-[#4D4D4D]/90 font-bold"
      >
        {option.label}
      </option>
    ))}
  </select>
);
export { CloseButton, FormField, Input, Select, StepIndicator, TextArea };
