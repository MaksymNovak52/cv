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

  return (
    <div className="pt-2">
      <div className="flex space-x-2 bg-[#F2F2F2] rounded-lg p-1 h-[40px] w-[380px]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative h-[32px] min-w-[80px] px-3 text-[12px] font-semibold rounded-lg transition-all duration-300
              ${
                activeTab === tab.id
                  ? "bg-white text-black"
                  : "text-gray-600 hover:text-gray-800"
              }`}
          >
            <span>{tab.label}</span>
            {activeTab !== tab.id && tab.id != ("reject" as const) && (
              <span className="absolute top-[4px] -right-3 w-[1px] h-[24px] bg-[#DADADA] rounded-full flex items-center justify-center text-white text-[8px]" />
            )}
            {activeTab === tab.id && (
              <div className="absolute inset-0 bg-white rounded-lg -z-10 opacity-20" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
