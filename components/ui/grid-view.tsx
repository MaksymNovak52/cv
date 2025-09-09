"use client";
import { useState } from "react";

export function GridViewContainer({
  choosed,
  setChosen,
}: {
  choosed: number;
  setChosen: (mode: number) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredSecond, setIsHoveredSecond] = useState(false);

  return (
    <div className=" hidden sm:flex flex-row gap-2 items-center text-[#211C1A] leading-[-0.12px] text-[12px] font-bold">
      <span>View:</span>

      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        type="button"
        onClick={() => setChosen(1)}
        className={`flex items-center gap-1 cursor-pointer transition-colors ${
          choosed === 1
            ? "text-[#211C1A]"
            : "text-[#CACACA] hover:text-[#211C1A]"
        }`}
        aria-pressed={choosed === 1}
      >
        {choosed === 1 && <span>[</span>}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
        >
          <path
            d="M14 9.5V12C13.9997 12.2651 13.8942 12.5193 13.7068 12.7068C13.5193 12.8942 13.2651 12.9997 13 13H3C2.73488 12.9997 2.4807 12.8942 2.29323 12.7068C2.10576 12.5193 2.0003 12.2651 2 12V9.5C2.0003 9.23488 2.10576 8.9807 2.29323 8.79323C2.4807 8.60576 2.73488 8.5003 3 8.5H13C13.2651 8.5003 13.5193 8.60576 13.7068 8.79323C13.8942 8.9807 13.9997 9.23488 14 9.5ZM13 3H3C2.73488 3.0003 2.4807 3.10576 2.29323 3.29323C2.10576 3.4807 2.0003 3.73488 2 4V6.5C2.0003 6.76512 2.10576 7.0193 2.29323 7.20677C2.4807 7.39424 2.73488 7.4997 3 7.5H13C13.2651 7.4997 13.5193 7.39424 13.7068 7.20677C13.8942 7.0193 13.9997 6.76512 14 6.5V4C13.9997 3.73488 13.8942 3.4807 13.7068 3.29323C13.5193 3.10576 13.2651 3.0003 13 3Z"
            fill={choosed === 1 ? "#211C1A" : isHovered ? "#211C1A" : "#CACACA"}
          />
        </svg>
        {choosed === 1 && <span>]</span>}
      </button>

      {/* 2) Grid view */}
      <button
        onMouseEnter={() => setIsHoveredSecond(true)}
        onMouseLeave={() => setIsHoveredSecond(false)}
        type="button"
        onClick={() => setChosen(2)}
        className={`flex items-center gap-1 cursor-pointer transition-colors ${
          choosed === 2
            ? "text-[#211C1A]"
            : "text-[#CACACA] hover:text-[#211C1A]"
        }`}
        aria-pressed={choosed === 2}
      >
        {choosed === 2 && <span>[</span>}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className="shrink-0"
        >
          <path
            d="M7 2.5H3C2.72386 2.5 2.5 2.72386 2.5 3V7C2.5 7.27614 2.72386 7.5 3 7.5H7C7.27614 7.5 7.5 7.27614 7.5 7V3C7.5 2.72386 7.27614 2.5 7 2.5Z"
            fill={
              choosed === 2
                ? "#211C1A"
                : isHoveredSecond
                ? "#211C1A"
                : "#CACACA"
            }
          />
          <path
            d="M13 2.5H9C8.72386 2.5 8.5 2.72386 8.5 3V7C8.5 7.27614 8.72386 7.5 9 7.5H13C13.2761 7.5 13.5 7.27614 13.5 7V3C13.5 2.72386 13.2761 2.5 13 2.5Z"
            fill={
              choosed === 2
                ? "#211C1A"
                : isHoveredSecond
                ? "#211C1A"
                : "#CACACA"
            }
          />
          <path
            d="M7 8.5H3C2.72386 8.5 2.5 8.72386 2.5 9V13C2.5 13.2761 2.72386 13.5 3 13.5H7C7.27614 13.5 7.5 13.2761 7.5 13V9C7.5 8.72386 7.27614 8.5 7 8.5Z"
            fill={
              choosed === 2
                ? "#211C1A"
                : isHoveredSecond
                ? "#211C1A"
                : "#CACACA"
            }
          />
          <path
            d="M13 8.5H9C8.72386 8.5 8.5 8.72386 8.5 9V13C8.5 13.2761 8.72386 13.5 9 13.5H13C13.2761 13.5 13.5 13.2761 13.5 13V9C13.5 8.72386 13.2761 8.5 13 8.5Z"
            fill={
              choosed === 2
                ? "#211C1A"
                : isHoveredSecond
                ? "#211C1A"
                : "#CACACA"
            }
          />
        </svg>
        {choosed === 2 && <span>]</span>}
      </button>
    </div>
  );
}
