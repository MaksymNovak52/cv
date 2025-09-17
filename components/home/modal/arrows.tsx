export function CandidateArrow({
  counts,
  goToPrevious,
  goToNext,
  isBackBlock,
  isNextBlock,
}: {
  isBackBlock: boolean;
  isNextBlock: boolean;
  counts: number;
  goToPrevious: () => void;
  goToNext: () => void;
}) {
  const handleClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    callback();

    setTimeout(() => {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    }, 100);
  };

  const buttonStyle = {
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
    MozUserSelect: "none" as const,
    msUserSelect: "none" as const,
    WebkitTouchCallout: "none" as const,
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <>
      <span
        className={`fixed top-1/2 right-[370px] z-10 translate-x-1/2 cursor-pointer translate-y-1/2  ${
          counts === 1 ? "hidden" : ""
        }
        ${!isNextBlock && "cursor-not-allowed opacity-50"}
        `}
        onClick={handleClick(goToNext)}
        onMouseDown={(e) => e.preventDefault()}
        style={buttonStyle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          style={{ pointerEvents: "none" }}
        >
          <path
            d="M13 20H29"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22.4531 13L28.9986 20L22.4531 27"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
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
        className={`fixed top-1/2 left-[330px] z-10 translate-x-1/2 cursor-pointer translate-y-1/2 ${
          counts === 1 ? "hidden" : ""
        }
           ${!isBackBlock && "cursor-not-allowed opacity-50"}
        `}
        onClick={handleClick(goToPrevious)}
        onMouseDown={(e) => e.preventDefault()}
        style={buttonStyle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          style={{ pointerEvents: "none" }}
        >
          <path
            d="M28 20H12"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.5469 13L12.0014 20L18.5469 27"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
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
