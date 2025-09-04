import { useDeleteJob } from "@/queries/candidates";
import Image from "next/image";

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
  const { mutate: deleteJob } = useDeleteJob();

  return (
    <section
      role="tab"
      aria-selected={isActive}
      onDoubleClick={() => deleteJob(id)}
      onClick={onClick}
      className={`
        relative cursor-pointer transition-all duration-300
        w-[263px] h-[51px] rounded-t-lg
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

      <div className="relative z-10 h-full px-4 flex items-center justify-between">
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
