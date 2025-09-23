export function RmOpinion({ opinion }: { opinion: string }) {
  return (
    <div className="w-full bg-[#F5F5F5] px-[26px] py-[20px] rounded-lg mb-[100px] lg:mb-0 overflow-hidden">
      <div className="flex flex-row items-center gap-2 justify-center mb-4 ">
        <div className="w-[115px] lg:w-[216px] h-[1px] border-t border-dashed border-[#E5E5E5]"></div>
        <h3 className="text-[#A4A4A3] uppercase text-[10px] font-bold leading-[-0.1px] whitespace-nowrap">
          RM opinion
        </h3>
        <div className="w-[115px] lg:w-[216px] h-[1px] border-t border-dashed border-[#E5E5E5]"></div>
      </div>
      <p className="text-[#615D5C] text-center text-[12px] font-bold leading-[-0.12px]">
        {opinion || "No opinion"}
      </p>
    </div>
  );
}
