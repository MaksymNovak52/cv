type Counts = {
  new: number;
  interview: number;
  notSure: number;
  reject: number;
};

export const CustomTabs = ({
  activeTab,
  setActiveTab,
  counts,
}: {
  activeTab: "new" | "interview" | "not-sure" | "reject";
  setActiveTab: (tab: "new" | "interview" | "not-sure" | "reject") => void;
  counts: Counts;
}) => {
  const tabs = [
    { id: "new" as const, label: "New", count: counts.new },
    { id: "interview" as const, label: "Interview", count: counts.interview },
    { id: "not-sure" as const, label: "Not sure", count: counts.notSure },
    { id: "reject" as const, label: "Reject", count: counts.reject },
  ];

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div className="pt-2">
      <div className="bg-[#F2F2F2] rounded-lg p-1 h-[40px] w-[330px]">
        <div className="flex h-full w-full">
          {tabs.map((tab, i) => {
            const isActive = activeTab === tab.id;
            const hideDivider = isActive || i === activeIndex - 1;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "relative h-[32px] flex-1 basis-0 px-3 text-[12px] font-semibold rounded-lg transition-all duration-300",
                  "before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:right-0 before:h-[24px] before:w-px before:bg-[#DADADA] last:before:hidden",
                  hideDivider ? "before:opacity-0" : "",
                  isActive
                    ? "bg-white text-black"
                    : "text-gray-600 hover:text-gray-800",
                ].join(" ")}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-white rounded-lg -z-10 opacity-20" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
