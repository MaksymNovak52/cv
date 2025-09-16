export function NewCandidatesList({
  title,
  counts,
}: {
  title: string;
  counts: number;
}) {
  return (
    <div className="fixed  lg:left-[28px] lg:flex flex-col items-start left-[12px] top-[12px] lg:top-[28px] text-[16px] text-white font-bold leading-[-0.16px] z-10">
      <span>{title}</span>
      <p className="text-[10px] text-[#CFCDCB] leading-[-0.1px] uppercase">
        {counts} new candidates
      </p>
    </div>
  );
}
