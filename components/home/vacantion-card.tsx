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
      onDoubleClick={() => deleteJob(id)}
      className={`flex flex-row justify-between items-center px-2 cursor-pointer
        ${
          isActive
            ? "bg-[#F9F7F5] w-[263px] h-[51px] rounded-t-lg"
            : "bg-white/45 w-[255px] h-[42px] mb-1 rounded-lg"
        }
        transition-all duration-300`}
      onClick={onClick}
    >
      <div
        className={`flex flex-row justify-between flex-1 items-center
        ${isActive ? "bg-white h-[42px] rounded-lg px-2" : ""}`}
      >
        <div className="flex flex-row gap-4 items-center">
          <span className={`w-[7px] h-[7px] rounded-full ${dotsStyle}`} />
          <h4 className="text-[#211C1A] text-[14px] font-semibold">{title}</h4>
        </div>
        <div
          className={`w-[70px] h-[22px] bg-[#2D2C2A] rounded-[4px] text-[10px] font-bold flex items-center justify-center ${badgeStyle}`}
        >
          <p>{newCount} new</p>
          <Image
            src="/fire.png"
            alt="logo"
            width={10}
            height={14}
            className="ml-2"
          />
        </div>
      </div>
    </section>
  );
};
