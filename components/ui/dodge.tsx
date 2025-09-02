export function Dotbage({ tag, bg }: { tag: string; bg?: string }) {
  return (
    <span
      className={`text-[#000000] text-[12px] leading-[-0.12px] px-[8px] py-1 ${
        bg ? bg : "bg-[#EFEEED]"
      } rounded-[4px] font-bold`}
    >
      {tag}
    </span>
  );
}
