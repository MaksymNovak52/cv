import Image from "next/image";
import { useMemo } from "react";

interface CardProps {
  title: string;
  newCount: number;
  onClick: () => void;
  isActive: boolean;
  dotsStyle?: string;
  badgeStyle?: string;
  description?: string;
  id: string;
  skills?: string[];
}

export const Card = ({
  title,
  newCount,
  onClick,
  isActive,
  id,
  dotsStyle = "bg-[#259A6D]",
  badgeStyle = "text-white",
}: CardProps) => {
  return (
    <section
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`
        relative cursor-pointer transition-all duration-300
        w-[263px] h-[51px] rounded-t-lg hidden lg:block 
      `}
    >
      <div
        className={`
          absolute inset-0 rounded-t-lg bg-[#F9F7F5]
          transition-opacity duration-300 pointer-events-none
          ${isActive ? "opacity-100" : "opacity-0"}
        `}
      />

      <div
        className={`
          absolute left-1 right-1 top-1 h-[42px] rounded-lg
          transition-shadow duration-300
           ${isActive ? "shadow-sm bg-white" : "bg-[#F9F7F5]"}
        `}
      />

      <div className="relative z-10 h-full px-4 flex items-center justify-between min-w-[260px]">
        <div className="flex items-center gap-4 min-w-0">
          <span className={`w-[7px] h-[7px] rounded-full ${dotsStyle}`} />
          <h4 className="text-[#211C1A] text-[14px] font-semibold truncate">
            {title}
          </h4>
        </div>

        {newCount !== 0 && (
          <div
            className={`
              w-[70px] h-[22px] bg-[#2D2C2A] rounded-[4px]
              text-[10px] font-bold flex items-center justify-center ${badgeStyle}
            `}
          >
            <p className="tabular-nums">{newCount} new</p>
            <Image
              src="/fire.png"
              alt="new"
              width={10}
              height={14}
              className="ml-2"
            />
          </div>
        )}
      </div>
    </section>
  );
};
export interface JobOption {
  id: string;
  title: string;
  newCount: number;
  dotClass?: string;
}

export function MobileJobSelect({
  options,
  value,
  onChange,
}: {
  options: JobOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const selected = useMemo(
    () => options.find((o) => o.id === value) ?? options[0],
    [options, value]
  );

  return (
    <div
      className="
        hidden max-[450px]:flex
        items-center justify-between
        w-[97%] h-[48px] rounded-[10px] bg-white shadow-sm px-3
        border border-[#ECEAE8] relative mx-auto mb-[6px]
      "
    >
      <span
        className={`w-[8px] h-[8px] rounded-full mr-2 ${
          selected?.dotClass ?? "bg-[#259A6D]"
        }`}
        aria-hidden
      />

      <select
        value={selected?.id ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="
          appearance-none bg-transparent outline-none cursor-pointer
          text-[#211C1A] text-[14px] font-semibold truncate
          pr-[110px]  /* місце під бейдж, розділювач і стрілку */
          flex-1
        "
        aria-label="Select job"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.title}
          </option>
        ))}
      </select>

      {selected?.newCount ? (
        <span
          className="
            absolute right-8 top-1/2 -translate-y-1/2
            h-[24px] px-2 bg-[#2D2C2A] rounded-md
            text-[10px] font-bold uppercase text-white
            inline-flex items-center justify-center mr-[16px]
          "
        >
          <span className="tabular-nums">{selected.newCount} NEW</span>
          <Image
            src="/fire.png"
            alt="new"
            width={12}
            height={12}
            className="ml-2"
          />
        </span>
      ) : null}

      <span className="absolute right-[36px] top-1/2 -translate-y-1/2 w-px h-6 bg-[#E6E2DF]" />

      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="#211C1A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
