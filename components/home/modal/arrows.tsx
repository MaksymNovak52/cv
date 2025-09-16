export function CandidateArrow({
  counts,
  goToPrevious,
  goToNext,
}: {
  counts: number;
  goToPrevious: () => void;
  goToNext: () => void;
}) {
  return (
    <>
      <span
        className={`fixed top-1/2 right-[370px] z-10 translate-x-1/2 cursor-pointer translate-y-1/2   ${
          counts === 1 ? "hidden" : ""
        }`}
        onClick={goToPrevious}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M13 20H29"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M22.4531 13L28.9986 20L22.4531 27"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <rect
            opacity="0.2"
            x="0.5"
            y="0.5"
            width="39"
            height="39"
            rx="19.5"
            stroke="white"
          />
        </svg>
      </span>
      <span
        className={`fixed top-1/2 left-[330px] z-10 translate-x-1/2 cursor-pointer translate-y-1/2  ${
          counts === 1 ? "hidden" : ""
        }`}
        onClick={goToNext}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M28 20H12"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M18.5469 13L12.0014 20L18.5469 27"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <rect
            opacity="0.2"
            x="-0.5"
            y="0.5"
            width="39"
            height="39"
            rx="19.5"
            transform="matrix(-1 0 0 1 39 0)"
            stroke="white"
          />
        </svg>
      </span>
    </>
  );
}
