import { CandidateRow } from "@/type";

export function RightAsside({ candidate }: { candidate: CandidateRow }) {
  return (
    <div className="flex flex-col items-start  w-full gap-[40px] lg:ml-6 ">
      <div className="w-full  flex flex-col items-start  relative">
        <h3 className="text-[#A4A4A3] uppercase text-[10px] font-bold leading-[-0.1px] whitespace-nowrap">
          Highlights:
        </h3>
        <p
          className="text-[#615D5C] text-start text-[12px] font-bold leading-[-0.12px] break-words whitespace-pre-wrap"
          style={{
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {candidate.highlights ||
            "Kairat’s recent project was a U.S.-based healthtech startup, where he built a mobile app that connected via Bluetooth to a physical sleep-tracking mask. The app integrated AI to provide sleep analytics, tips, and community features. He contributed advanced solutions like parallel reanimated animations (off the JS thread), Jest-based testing, and automated deployments with App Center and CodePush for seamless updates. Another key achievement was at a company, where he helped rebuild their mobile platform from scratch (React Native + native modules) to support 200K–300K daily active users, ensuring scalability and performance at high user loads."}{" "}
        </p>
        <div className="w-[calc(100%+10px)] h-[1px]  border-b border-dashed border-[#E5E5E5] absolute   -bottom-[20px] -left-2"></div>
      </div>

      <div className="w-full  flex flex-col items-start">
        <h3 className="text-[#A4A4A3] uppercase text-[10px] font-bold leading-[-0.1px] whitespace-nowrap">
          Requirements:{" "}
        </h3>
        <p
          className="text-[#615D5C] text-start text-[12px] font-bold leading-[-0.12px] break-words whitespace-pre-wrap"
          style={{
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {" "}
          {candidate.requirements ||
            "	•	7+ years of experience in React Native and mobile development Has shipped apps to App Store & Google Play and also has experience with automated pipelines (App Center, GitHub/GitLab CI/CD, CodePush) Worked on hardware-integrated apps (Bluetooth mask device) and optimized native code Has been working with advanced animations & gesture handling (Reanimated, parallel native threads) Has been in collaboration with designers, backend, QA, PMs in a cross-functional setup, comfortable working in startup environment"}{" "}
        </p>
      </div>
    </div>
  );
}
