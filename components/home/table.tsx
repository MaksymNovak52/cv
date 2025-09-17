"use client";

import { pickAvatar } from "@/lib/avatar";
import { truncateWords } from "@/lib/text";
import { useToggleFavorite } from "@/queries/candidates";
import { CandidateRow } from "@/type";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function getContainerScroller(
  container: HTMLElement | null
): HTMLElement | null {
  if (!container) return null;
  const cs = getComputedStyle(container);
  const scrollable =
    (cs.overflowY === "auto" || cs.overflowY === "scroll") &&
    container.scrollHeight > container.clientHeight;
  return scrollable ? container : null;
}
function viewportTB(containerScroller: HTMLElement | null) {
  if (!containerScroller) return { top: 0, bottom: window.innerHeight };
  const r = containerScroller.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom };
}
function ratioVisible(el: HTMLElement, vp: { top: number; bottom: number }) {
  const r = el.getBoundingClientRect();
  const top = Math.max(r.top, vp.top);
  const bottom = Math.min(r.bottom, vp.bottom);
  const vis = Math.max(0, bottom - top);
  return r.height ? vis / r.height : 0;
}

function useEverSeenFirstN(
  containerRef: React.RefObject<HTMLElement>,
  cellRefs: React.MutableRefObject<(HTMLTableCellElement | null)[]>,
  n = 3,
  minVisibleRatio = 0.6,
  resetDeps: unknown[] = []
) {
  const [ever, setEver] = useState(false);
  const seen = useRef<Set<number>>(new Set());
  useEffect(() => {
    seen.current.clear();
    setEver(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  useEffect(() => {
    let rafId: number | null = null;
    const containerScroller = getContainerScroller(containerRef.current);

    const compute = () => {
      const need = Math.min(n, cellRefs.current.length);
      if (need === 0) return;

      const vp = viewportTB(containerScroller);
      for (let i = 0; i < need; i++) {
        const el = cellRefs.current[i];
        if (el && ratioVisible(el, vp) >= minVisibleRatio) {
          seen.current.add(i);
        }
      }
      if (!ever && seen.current.size >= need) setEver(true);
    };

    const onScroll = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        compute();
      });
    };

    const raf0 = requestAnimationFrame(compute);
    const t1 = setTimeout(compute, 80);
    const t2 = setTimeout(compute, 200);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);
    if (containerScroller) {
      containerScroller.addEventListener(
        "scroll",
        onScroll as any,
        {
          passive: true,
        } as AddEventListenerOptions
      );
    }

    return () => {
      if (raf0) cancelAnimationFrame(raf0);
      if (rafId != null) cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      if (containerScroller)
        containerScroller.removeEventListener("scroll", onScroll as any);
    };
  }, [containerRef, cellRefs, n, minVisibleRatio, ever, ...resetDeps]);

  return ever;
}

function useBelowFirstRow(
  containerRef: React.RefObject<HTMLElement>,
  firstCellRef: React.MutableRefObject<HTMLTableCellElement | null>,
  deps: unknown[] = []
) {
  const [below, setBelow] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;
    const containerScroller = getContainerScroller(containerRef.current);

    const compute = () => {
      const el = firstCellRef.current;
      if (!el) {
        setBelow(false);
        return;
      }
      const vp = viewportTB(containerScroller);
      const r = el.getBoundingClientRect();
      setBelow(r.top - vp.top <= 0);
    };

    const onScroll = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        compute();
      });
    };

    const raf0 = requestAnimationFrame(compute);
    const t1 = setTimeout(compute, 80);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);
    const scroller = getContainerScroller(containerRef.current);
    if (scroller)
      scroller.addEventListener(
        "scroll",
        onScroll as any,
        { passive: true } as AddEventListenerOptions
      );

    return () => {
      if (raf0) cancelAnimationFrame(raf0);
      if (rafId != null) cancelAnimationFrame(rafId);
      clearTimeout(t1);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      if (scroller) scroller.removeEventListener("scroll", onScroll as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, firstCellRef, ...deps]);

  return below;
}

function cleanClearanceStatus(clearance: string | null): string {
  if (!clearance) return "";
  return clearance.replace(/^English\s*/i, "").trim();
}

export function CandidatesTable({
  selectedJobId,
  candidatesByJob,
  handleCandidateClick,
  setIsStickyBtn,
  onEditCandidate,
}: {
  onEditCandidate: (candidate: CandidateRow) => void;
  setIsStickyBtn: React.Dispatch<SetStateAction<boolean>>;
  selectedJobId: string;
  candidatesByJob: CandidateRow[];
  handleCandidateClick: (candidate: CandidateRow) => void;
}): JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const { mutate: toggleFav } = useToggleFavorite(selectedJobId);

  const scrollRef = useRef<HTMLDivElement>(null);
  const firstCellRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const firstCell0Ref = useRef<HTMLTableCellElement | null>(null);

  const setFirstCellRef = useCallback(
    (rowIdx: number) => (el: HTMLTableCellElement | null) => {
      firstCellRefs.current[rowIdx] = el || null;
      if (rowIdx === 0) firstCell0Ref.current = el || null;
    },
    []
  );

  const columnHelper = createColumnHelper<CandidateRow>();

  const columns = useMemo<ColumnDef<CandidateRow, any>[]>(
    () => [
      columnHelper.accessor("full_name", {
        id: "overview",
        header: "OVERVIEW",
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div
              className="flex items-start gap-4 cursor-pointer"
              onClick={() => handleCandidateClick(c)}
            >
              <img
                src={pickAvatar(c)}
                alt={c.full_name}
                className="w-12 h-12 rounded-full"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-[#211C1A] text-[24px] font-normal leading-[21.6px] font-eb-garamond">
                  {c.full_name}
                </h2>
                <p className="text-[12px] text-[#A6A4A3] my-2 font-bold">
                  {c.current_title}
                </p>
                <div className="flex items-center gap-3">
                  {c?.portfolio_url && (
                    <Link
                      href={(c as any).portfolio_url || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-[#211C1A] font-bold hover:underline"
                    >
                      Portfolio
                    </Link>
                  )}
                  <Link
                    href={(c as any).portfolio_url || ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-[#211C1A] font-bold hover:underline"
                  >
                    CV
                  </Link>
                </div>
              </div>
            </div>
          );
        },
        minSize: 280,
        size: 280,
      }),
      columnHelper.accessor("deployment_status", {
        id: "stats",
        header: "STATS",
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div
              className="space-y-2 text-sm cursor-pointer"
              onClick={() => handleCandidateClick(c)}
            >
              <div className="flex items-center gap-2 text-[12px] font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="14"
                  viewBox="0 0 13 14"
                  fill="none"
                >
                  <path
                    opacity="0.8"
                    d="M11.9167 1.07692H10.2917V0.538462C10.2917 0.395653 10.2346 0.258693 10.133 0.157712C10.0314 0.0567306 9.89366 0 9.75 0C9.60634 0 9.46857 0.0567306 9.36698 0.157712C9.2654 0.258693 9.20833 0.395653 9.20833 0.538462V1.07692H3.79167V0.538462C3.79167 0.395653 3.7346 0.258693 3.63302 0.157712C3.53143 0.0567306 3.39366 0 3.25 0C3.10634 0 2.96857 0.0567306 2.86698 0.157712C2.7654 0.258693 2.70833 0.395653 2.70833 0.538462V1.07692H1.08333C0.796103 1.07721 0.520717 1.19076 0.317614 1.39266C0.114511 1.59456 0.000283758 1.86832 0 2.15385V12.9231C0.000283758 13.2086 0.114511 13.4824 0.317614 13.6843C0.520717 13.8862 0.796103 13.9997 1.08333 14H11.9167C12.2039 13.9997 12.4793 13.8862 12.6824 13.6843C12.8855 13.4824 12.9997 13.2086 13 12.9231V2.15385C12.9997 1.86831 12.8855 1.59456 12.6824 1.39266C12.4793 1.19076 12.2039 1.07721 11.9167 1.07692ZM4.8754 11.5769C4.66208 11.5775 4.45076 11.536 4.25365 11.4549C4.05654 11.3738 3.87756 11.2547 3.72703 11.1045C3.62539 11.0035 3.56824 10.8666 3.56816 10.7238C3.56808 10.581 3.62506 10.444 3.72659 10.343C3.82811 10.2419 3.96585 10.1851 4.10951 10.185C4.25317 10.1849 4.39098 10.2416 4.49262 10.3425C4.55564 10.4051 4.6332 10.4512 4.71844 10.4769C4.80368 10.5025 4.89397 10.5069 4.98132 10.4896C5.06866 10.4723 5.15036 10.4338 5.21919 10.3776C5.28801 10.3214 5.34184 10.2492 5.37589 10.1674C5.40995 10.0856 5.42319 9.99674 5.41444 9.90863C5.40569 9.82052 5.37522 9.73592 5.32573 9.66231C5.27624 9.58871 5.20925 9.52837 5.1307 9.48664C5.05215 9.44491 4.96446 9.42308 4.8754 9.42308H4.87507C4.85821 9.42308 4.84134 9.42209 4.82452 9.42051C4.81913 9.42002 4.81387 9.4192 4.80855 9.41856C4.79727 9.41716 4.78603 9.41554 4.77483 9.41345C4.76858 9.41227 4.7624 9.41095 4.75622 9.40957C4.74603 9.40731 4.73588 9.40468 4.7258 9.4018C4.71965 9.40004 4.7135 9.39833 4.70745 9.39636C4.69727 9.39306 4.68719 9.38928 4.67717 9.38535C4.67171 9.38322 4.66619 9.38128 4.66084 9.37898C4.64917 9.37396 4.63769 9.36831 4.62625 9.36243C4.62295 9.3607 4.61948 9.35926 4.6162 9.35748C4.60192 9.34971 4.5879 9.34124 4.57415 9.33208C4.56952 9.32899 4.56522 9.32552 4.5607 9.3223C4.55276 9.31666 4.54473 9.31122 4.53702 9.30509C4.53603 9.30431 4.53517 9.3034 4.53418 9.3026C4.52601 9.29599 4.51834 9.28886 4.51058 9.28179C4.50492 9.27667 4.49897 9.27175 4.49358 9.26643C4.48836 9.26127 4.48363 9.25567 4.4786 9.25029C4.41306 9.17998 4.36748 9.09363 4.34653 9.00006C4.34616 8.99835 4.34557 8.99669 4.3452 8.99498C4.34332 8.98591 4.3422 8.97658 4.34077 8.96734C4.33949 8.95898 4.33783 8.95068 4.33694 8.94227C4.33618 8.93535 4.33608 8.92826 4.33558 8.92126C4.33482 8.91024 4.334 8.89923 4.33393 8.88817C4.3339 8.88697 4.33373 8.88582 4.33373 8.88462C4.33373 8.87903 4.33439 8.87361 4.33459 8.86805C4.33492 8.85689 4.33525 8.84575 4.33628 8.83461C4.33697 8.82709 4.33816 8.81974 4.33919 8.81231C4.34054 8.80229 4.34187 8.79228 4.34378 8.78232C4.34534 8.77432 4.34735 8.76653 4.34924 8.75864C4.35145 8.74947 4.35364 8.74031 4.35635 8.7312C4.35879 8.72305 4.36167 8.71511 4.36448 8.70713C4.36749 8.6986 4.37043 8.69005 4.37387 8.68162C4.37724 8.67339 4.38108 8.66544 4.38485 8.6574C4.38855 8.64955 4.39212 8.64168 4.39622 8.63394C4.40065 8.62556 4.40561 8.61749 4.41047 8.60937C4.41467 8.60239 4.4187 8.59534 4.42323 8.58848C4.42899 8.57986 4.43523 8.57164 4.44144 8.56336C4.44521 8.55835 4.44845 8.55312 4.45242 8.54821L4.83172 8.07692H4.0629C3.91924 8.07692 3.78146 8.02019 3.67988 7.91921C3.5783 7.81823 3.52123 7.68127 3.52123 7.53846C3.52123 7.39565 3.5783 7.25869 3.67988 7.15771C3.78146 7.05673 3.91924 7 4.0629 7H5.95873C6.06077 7 6.16073 7.02865 6.2471 7.08265C6.33347 7.13665 6.40275 7.2138 6.44695 7.30522C6.49115 7.39664 6.50848 7.49861 6.49693 7.59939C6.48539 7.70017 6.44545 7.79566 6.38171 7.87487L5.78119 8.62107C6.07037 8.81401 6.28952 9.09423 6.40632 9.42039C6.52312 9.74656 6.53138 10.1014 6.42989 10.4326C6.3284 10.7638 6.12253 11.0538 5.84265 11.2598C5.56276 11.4659 5.22367 11.577 4.8754 11.5769ZM9.20873 11.0385C9.20873 11.1813 9.15166 11.3182 9.05008 11.4192C8.9485 11.5202 8.81072 11.5769 8.66706 11.5769C8.52341 11.5769 8.38563 11.5202 8.28405 11.4192C8.18246 11.3182 8.1254 11.1813 8.1254 11.0385V8.61539L7.90872 8.77695C7.79378 8.86263 7.64932 8.89942 7.5071 8.87921C7.36488 8.85901 7.23656 8.78347 7.15037 8.66922C7.06418 8.55496 7.02717 8.41135 7.0475 8.26998C7.06782 8.1286 7.14381 8.00104 7.25874 7.91536L8.34208 7.10767C8.42256 7.04768 8.51825 7.01115 8.61843 7.00218C8.71862 6.9932 8.81934 7.01214 8.90931 7.05686C8.99928 7.10158 9.07494 7.17033 9.12783 7.25539C9.18071 7.34045 9.20873 7.43847 9.20873 7.53846V11.0385ZM11.9167 4.30769H1.08333V2.15385H2.70833V2.69231C2.70833 2.83512 2.7654 2.97208 2.86698 3.07306C2.96857 3.17404 3.10634 3.23077 3.25 3.23077C3.39366 3.23077 3.53143 3.17404 3.63302 3.07306C3.7346 2.97208 3.79167 2.83512 3.79167 2.69231V2.15385H9.20833V2.69231C9.20833 2.83512 9.2654 2.97208 9.36698 3.07306C9.46857 3.17404 9.60634 3.23077 9.75 3.23077C9.89366 3.23077 10.0314 3.17404 10.133 3.07306C10.2346 2.97208 10.2917 2.83512 10.2917 2.69231V2.15385H11.9167V4.30769Z"
                    fill="black"
                  />
                </svg>
                <span className="text-[#64605F]">Notice period:</span>
                <span className="text-[#211C1A]">{c.deployment_status}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="12"
                  viewBox="0 0 13 12"
                  fill="none"
                >
                  <path
                    opacity="0.8"
                    d="M12.451 9.56315C12.8072 8.90109 12.9956 8.16265 12.9999 7.41184C13.0042 6.66102 12.8243 5.92049 12.4757 5.25444C12.1271 4.58838 11.6204 4.01691 10.9994 3.58955C10.3785 3.16219 9.66208 2.89185 8.91231 2.80195C8.66598 2.22893 8.3055 1.71143 7.85261 1.28064C7.39971 0.849851 6.86377 0.514691 6.27708 0.295363C5.6904 0.0760339 5.06512 -0.0229223 4.43894 0.00445817C3.81275 0.0318387 3.19863 0.184989 2.63358 0.454678C2.06853 0.724367 1.56425 1.10501 1.15114 1.57367C0.73803 2.04232 0.424644 2.58929 0.229867 3.1816C0.0350913 3.7739 -0.037041 4.39928 0.017818 5.02005C0.072677 5.64082 0.253391 6.24411 0.549069 6.79358L0.190143 8.04277C0.150315 8.18128 0.14847 8.32786 0.1848 8.46732C0.221129 8.60678 0.29431 8.73404 0.39676 8.83591C0.499209 8.93779 0.627199 9.01057 0.767463 9.04672C0.907728 9.08287 1.05516 9.08106 1.19449 9.04149L2.4511 8.68456C2.9596 8.95516 3.51445 9.129 4.08712 9.19715C4.34029 9.78595 4.71387 10.316 5.18411 10.7536C5.65435 11.1911 6.21099 11.5267 6.81866 11.739C7.42633 11.9512 8.07176 12.0355 8.71396 11.9864C9.35615 11.9374 9.98106 11.7561 10.549 11.4541L11.8056 11.8111C11.9449 11.8506 12.0923 11.8524 12.2326 11.8163C12.3728 11.7802 12.5008 11.7074 12.6033 11.6055C12.7057 11.5037 12.7789 11.3764 12.8153 11.237C12.8516 11.0975 12.8498 10.9509 12.81 10.8124L12.451 9.56315ZM11.5522 9.26843C11.5198 9.3225 11.4989 9.38256 11.4908 9.44495C11.4826 9.50733 11.4874 9.57071 11.5048 9.63119L11.8597 10.8663L10.6174 10.5134C10.5566 10.4962 10.4929 10.4915 10.4301 10.4996C10.3674 10.5077 10.307 10.5284 10.2526 10.5606C9.82768 10.8109 9.35683 10.9746 8.86757 11.0419C8.3783 11.1092 7.88044 11.0789 7.40309 10.9528C6.92575 10.8266 6.47848 10.6071 6.08746 10.3071C5.69643 10.007 5.36948 9.63253 5.12573 9.20542C5.76169 9.13998 6.37718 8.94451 6.93352 8.63128C7.48986 8.31804 7.97505 7.89382 8.3586 7.38525C8.74215 6.87667 9.01578 6.29474 9.1623 5.67601C9.30882 5.05727 9.32507 4.41509 9.21002 3.78981C9.77729 3.92303 10.3051 4.18707 10.7507 4.56059C11.1964 4.9341 11.5474 5.40662 11.7754 5.93994C12.0034 6.47327 12.102 7.05245 12.0632 7.63066C12.0244 8.20888 11.8494 8.76992 11.5522 9.26843Z"
                    fill="black"
                  />
                </svg>{" "}
                <span className="text-[#64605F]">English:</span>
                <span className="text-[#211C1A]">
                  {cleanClearanceStatus(c.clearance_status) || "B2"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                >
                  <path
                    opacity="0.8"
                    d="M12.6163 8.69971C12.6256 8.67828 12.6334 8.65622 12.6396 8.63369C13.1204 7.25117 13.1201 5.74688 12.6389 4.36451C12.633 4.34304 12.6255 4.322 12.6167 4.30153C12.1627 3.04394 11.3323 1.95663 10.2384 1.18741C9.14443 0.418198 7.84008 0.00440463 6.50263 0.00228861L6.5 0L6.49738 0.00228861C5.16005 0.00440166 3.85581 0.418115 2.76194 1.18719C1.66807 1.95627 0.837638 3.04341 0.383514 4.30082C0.374435 4.32182 0.366818 4.34342 0.360718 4.36546C-0.120522 5.74867 -0.120231 7.25384 0.361542 8.63687C0.367356 8.65746 0.374491 8.67767 0.382904 8.69735C0.836763 9.95519 1.66716 11.0428 2.76116 11.8122C3.85516 12.5816 5.15968 12.9955 6.49732 12.9977L6.5 13L6.50269 12.9977C7.8399 12.9955 9.14402 12.5819 10.2378 11.8129C11.3316 11.0439 12.1621 9.95697 12.6163 8.69971ZM6.5 1.3492C7.22572 2.10093 7.77116 3.00762 8.09516 4.00085H4.90485C5.22884 3.00762 5.77428 2.10093 6.5 1.3492ZM4.90488 8.99909H8.09513C7.77113 9.99231 7.2257 10.899 6.5 11.6507C5.7743 10.899 5.22887 9.99231 4.90488 8.99909ZM4.6431 7.99944C4.4523 7.00889 4.4523 5.99105 4.6431 5.0005H8.3569C8.5477 5.99105 8.5477 7.00889 8.3569 7.99944H4.6431ZM9.37677 5.0005H11.7921C12.0693 5.98094 12.0693 7.019 11.7921 7.99944H9.37677C9.54108 7.00654 9.54108 5.9934 9.37677 5.0005ZM11.3983 4.00085H9.15048C8.85112 2.94759 8.33766 1.96738 7.64218 1.12147C8.44268 1.29294 9.195 1.64026 9.84463 2.13827C10.4943 2.63628 11.025 3.2725 11.3983 4.00085H11.3983ZM7.64215 11.8785C8.33762 11.0326 8.85108 10.0523 9.15045 8.99909H11.3983C11.025 9.72744 10.4943 10.3637 9.84462 10.8617C9.19498 11.3597 8.44265 11.707 7.64215 11.8785Z"
                    fill="black"
                  />
                </svg>{" "}
                <span className="text-[#64605F]">Location:</span>
                <span className="text-[#211C1A]">{c.location}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                >
                  <path
                    opacity="0.8"
                    d="M12.4786 8.76069C12.48 8.97182 12.4159 9.17817 12.2951 9.35137C12.1743 9.52456 12.0029 9.65608 11.8043 9.72782L8.44433 10.9657L7.20645 14.3257C7.13355 14.5235 7.00174 14.6942 6.82881 14.8148C6.65588 14.9354 6.45013 15 6.23931 15C6.02849 15 5.82275 14.9354 5.64981 14.8148C5.47688 14.6942 5.34508 14.5235 5.27218 14.3257L4.03429 10.9657L0.674302 9.72782C0.47649 9.65492 0.305789 9.52312 0.185217 9.35019C0.0646446 9.17725 0 8.97151 0 8.76069C0 8.54987 0.0646446 8.34413 0.185217 8.17119C0.305789 7.99826 0.47649 7.86646 0.674302 7.79356L4.03429 6.55567L5.27218 3.19568C5.34508 2.99787 5.47688 2.82717 5.64981 2.70659C5.82275 2.58602 6.02849 2.52138 6.23931 2.52138C6.45013 2.52138 6.65588 2.58602 6.82881 2.70659C7.00174 2.82717 7.13355 2.99787 7.20645 3.19568L8.44433 6.55567L11.8043 7.79356C12.0029 7.8653 12.1743 7.99682 12.2951 8.17001C12.4159 8.3432 12.48 8.54956 12.4786 8.76069ZM8.81598 2.57667H9.84665V3.60734C9.84665 3.74402 9.90095 3.8751 9.99759 3.97174C10.0942 4.06838 10.2253 4.12268 10.362 4.12268C10.4987 4.12268 10.6297 4.06838 10.7264 3.97174C10.823 3.8751 10.8773 3.74402 10.8773 3.60734V2.57667H11.908C12.0447 2.57667 12.1757 2.52238 12.2724 2.42574C12.369 2.32909 12.4233 2.19801 12.4233 2.06134C12.4233 1.92466 12.369 1.79359 12.2724 1.69694C12.1757 1.6003 12.0447 1.546 11.908 1.546H10.8773V0.515335C10.8773 0.378659 10.823 0.247582 10.7264 0.150938C10.6297 0.054294 10.4987 0 10.362 0C10.2253 0 10.0942 0.054294 9.99759 0.150938C9.90095 0.247582 9.84665 0.378659 9.84665 0.515335V1.546H8.81598C8.67931 1.546 8.54823 1.6003 8.45159 1.69694C8.35494 1.79359 8.30065 1.92466 8.30065 2.06134C8.30065 2.19801 8.35494 2.32909 8.45159 2.42574C8.54823 2.52238 8.67931 2.57667 8.81598 2.57667ZM14.4847 4.63801H13.9693V4.12268C13.9693 3.986 13.915 3.85492 13.8184 3.75828C13.7217 3.66164 13.5907 3.60734 13.454 3.60734C13.3173 3.60734 13.1862 3.66164 13.0896 3.75828C12.993 3.85492 12.9387 3.986 12.9387 4.12268V4.63801H12.4233C12.2867 4.63801 12.1556 4.69231 12.0589 4.78895C11.9623 4.88559 11.908 5.01667 11.908 5.15335C11.908 5.29002 11.9623 5.4211 12.0589 5.51774C12.1556 5.61439 12.2867 5.66868 12.4233 5.66868H12.9387V6.18402C12.9387 6.32069 12.993 6.45177 13.0896 6.54841C13.1862 6.64506 13.3173 6.69935 13.454 6.69935C13.5907 6.69935 13.7217 6.64506 13.8184 6.54841C13.915 6.45177 13.9693 6.32069 13.9693 6.18402V5.66868H14.4847C14.6213 5.66868 14.7524 5.61439 14.8491 5.51774C14.9457 5.4211 15 5.29002 15 5.15335C15 5.01667 14.9457 4.88559 14.8491 4.78895C14.7524 4.69231 14.6213 4.63801 14.4847 4.63801Z"
                    fill="black"
                  />
                </svg>{" "}
                <span className="text-[#64605F]">Experience:</span>
                <span className="text-gray-900">{c.experience_years}</span>
              </div>
            </div>
          );
        },
        minSize: 300,
        size: 300,
      }),
      columnHelper.accessor("skills", {
        id: "qualifications",
        header: "QUALIFICATIONS",
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div
              className="space-y-3 cursor-pointer"
              onClick={() => handleCandidateClick(c)}
            >
              <p className="text-[12px] text-[#000]">
                {c.highlights.length > 340
                  ? c.highlights?.slice(0, 340) + " ..."
                  : c.highlights}
              </p>
            </div>
          );
        },
        minSize: 350,
      }),
      columnHelper.accessor("salary", {
        id: "compensation",
        header: () => <div className="flex justify-end" />,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div
              className="flex flex-col justify-between   cursor-pointer relative  h-full"
              onClick={() => handleCandidateClick(c)}
            >
              <div className="text-left mb-4 pl-4">
                <div className="flex flex-row ">
                  <p className="text-2xl font-normal text-[#211C1A] leading-[21.6px] font-eb-garamond ">
                    ${c.salary?.toLocaleString() || "N/A"}
                  </p>
                  <span className="text-[12px] text-[#211C1A] font-bold mt-1">
                    /month
                  </span>
                </div>
                {c.has_equity && (
                  <p className="text-[12px] text-[#A6A4A3] font-semibold">
                    +Equity Package
                  </p>
                )}
              </div>

              <button
                className="p-[8px] border border-[#E5E5E5]  hover:bg-gray-100 rounded-md transition-colors absolute right-[54px] top-1 "
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCandidate(c);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                >
                  <path
                    d="M14.4375 2.53479C14.7524 2.53479 15.0546 2.65975 15.2773 2.88245L19.1172 6.72327C19.3397 6.94587 19.4647 7.24738 19.4648 7.56213C19.4648 7.87708 19.3399 8.17928 19.1172 8.40198L8.45703 19.0621H4.125C3.81006 19.0621 3.50786 18.9372 3.28516 18.7145C3.06258 18.4918 2.9375 18.1895 2.9375 17.8746V14.0348C2.9375 13.8789 2.96868 13.7247 3.02832 13.5807C3.088 13.4366 3.17489 13.3052 3.28516 13.1949L13.5977 2.88245C13.8204 2.65975 14.1226 2.53479 14.4375 2.53479Z"
                    stroke="#211C1A"
                  />
                  <path d="M11.6875 5.5L16.5 10.3125" stroke="#211C1A" />
                </svg>
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-md transition-colors absolute right-0 -top-1"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFav(c.application_id);
                }}
                aria-label={c.is_favorite ? "Unfavorite" : "Favorite"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill={c.is_favorite ? "#211C1A" : "none"}
                >
                  <path
                    opacity="0.1"
                    d="M4 0.5H36C37.933 0.5 39.5 2.067 39.5 4V36C39.5 37.933 37.933 39.5 36 39.5H4C2.067 39.5 0.5 37.933 0.5 36V4C0.500001 2.067 2.067 0.5 4 0.5Z"
                    stroke="black"
                  />
                  <path
                    d="M25.3125 11.5C25.6294 11.5 25.9321 11.6277 26.1543 11.8525C26.3762 12.0771 26.4999 12.3803 26.5 12.6953V28.9082L25.7324 28.4229L20.499 25.1123L15.2676 28.4229L14.5 28.9082V12.6953C14.5001 12.3803 14.6238 12.0771 14.8457 11.8525C15.0679 11.6277 15.3706 11.5 15.6875 11.5H25.3125Z"
                    stroke="#211C1A"
                  />
                </svg>
              </button>
              {c.rejection_reason && c.rejection_reason?.length > 0 ? (
                <div className="flex items-center  w-full justify-between text-sm text-[#211C1A]">
                  <div className="flex flex-row items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="35"
                      height="35"
                      viewBox="0 0 35 35"
                      fill="none"
                    >
                      <g filter="url(#filter0_d_416_3770)">
                        <path
                          d="M17.5 10C16.0166 10 14.5666 10.4399 13.3332 11.264C12.0999 12.0881 11.1386 13.2594 10.5709 14.6299C10.0032 16.0003 9.85472 17.5083 10.1441 18.9632C10.4335 20.418 11.1478 21.7544 12.1967 22.8033C13.2456 23.8522 14.582 24.5665 16.0368 24.8559C17.4917 25.1453 18.9997 24.9967 20.3701 24.4291C21.7406 23.8614 22.9119 22.9001 23.736 21.6668C24.5601 20.4334 25 18.9834 25 17.5C24.9977 15.5116 24.2068 13.6053 22.8008 12.1992C21.3947 10.7932 19.4884 10.0023 17.5 10ZM20.2156 19.3998C20.2693 19.4533 20.3118 19.5169 20.3409 19.5869C20.37 19.657 20.3849 19.732 20.385 19.8078C20.385 19.8836 20.3701 19.9587 20.3411 20.0287C20.3121 20.0988 20.2696 20.1624 20.216 20.216C20.1624 20.2696 20.0988 20.3121 20.0287 20.3411C19.9587 20.3701 19.8836 20.385 19.8078 20.385C19.732 20.3849 19.657 20.37 19.5869 20.3409C19.5169 20.3118 19.4533 20.2693 19.3998 20.2156L17.5 18.3158L15.6002 20.2156C15.492 20.3236 15.3453 20.3842 15.1924 20.3841C15.0396 20.384 14.8929 20.3233 14.7848 20.2152C14.6767 20.1071 14.616 19.9604 14.6159 19.8076C14.6158 19.6547 14.6764 19.508 14.7844 19.3998L16.6842 17.5L14.7844 15.6002C14.6764 15.492 14.6158 15.3453 14.6159 15.1924C14.616 15.0395 14.6767 14.8929 14.7848 14.7848C14.8929 14.6767 15.0396 14.616 15.1924 14.6159C15.3453 14.6158 15.492 14.6764 15.6002 14.7844L17.5 16.6842L19.3998 14.7844C19.508 14.6764 19.6547 14.6158 19.8076 14.6159C19.9605 14.616 20.1071 14.6767 20.2152 14.7848C20.3233 14.8929 20.384 15.0395 20.3841 15.1924C20.3842 15.3453 20.3236 15.492 20.2156 15.6002L18.3158 17.5L20.2156 19.3998Z"
                          fill="#EF5E5E"
                        />
                      </g>
                      <defs>
                        <filter
                          id="filter0_d_416_3770"
                          x="0.3232"
                          y="0.3232"
                          width="34.3536"
                          height="34.3536"
                          filterUnits="userSpaceOnUse"
                          color-interpolation-filters="sRGB"
                        >
                          <feFlood
                            flood-opacity="0"
                            result="BackgroundImageFix"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset />
                          <feGaussianBlur stdDeviation="4.8384" />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0.937255 0 0 0 0 0.368627 0 0 0 0 0.368627 0 0 0 0.5 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow_416_3770"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow_416_3770"
                            result="shape"
                          />
                        </filter>
                      </defs>
                    </svg>
                    <div className="max-w-[160px] ">
                      <p className="text-[#FF3636] text-[10px] font-bold  tracking-tighter leading-normal   uppercase  text-start ">
                        {truncateWords(c.rejection_reason, 7)}
                      </p>
                    </div>
                  </div>
                  <button className="flex items-center justify-center border border-[#E5E5E5] w-[106px] h-[40px] rounded-md transition-colors font-medium">
                    [R] Unreject
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2  w-full justify-end text-sm text-[#211C1A]">
                  <button className="flex items-center justify-center bg-[#D3EBE2] w-[106px] h-[40px] rounded-md hover:bg-green-200 transition-colors font-medium">
                    [A] Approve
                  </button>
                  <button className="flex items-center justify-center border border-[#E5E5E5] w-[106px] h-[40px] rounded-md transition-colors font-medium">
                    [H] Not Sure
                  </button>
                  <button className="flex items-center justify-center border border-[#E5E5E5] w-[106px] h-[40px] rounded-md transition-colors font-medium">
                    [R] Reject
                  </button>
                </div>
              )}
            </div>
          );
        },
        minSize: 300,
        size: 300,
      }),
    ],
    [columnHelper, handleCandidateClick, toggleFav]
  );

  const table = useReactTable({
    data: candidatesByJob || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter },
  });

  const rows = table.getRowModel().rows;
  const rowsLen = rows.length;

  useEffect(() => {
    firstCellRefs.current = new Array(rowsLen).fill(null);
    firstCell0Ref.current = null;
  }, [rowsLen]);

  const firstThreeEver = useEverSeenFirstN(scrollRef, firstCellRefs, 2, 0.6, [
    selectedJobId,
    rowsLen,
  ]);

  const belowFirstRow = useBelowFirstRow(
    scrollRef,
    { current: firstCell0Ref.current },
    [rowsLen]
  );

  if (candidatesByJob.length <= 0) return <></>;
  return (
    <div className=" ">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-20  ">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 pb-[12px] text-left text-xs bg-[#F3F3F1] text-gray-500 font-medium uppercase tracking-wider"
                  style={{ width: header.getSize() }}
                >
                  {!header.isPlaceholder && (
                    <div
                      className={`flex items-start gap-2 text-[#A9A9A8] text-[10px] font-bold ${
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        ) !== "OVERVIEW"
                          ? "pl-4"
                          : ""
                      }`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <div
                          className="cursor-pointer"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.column.getIsSorted() === "asc" && (
                            <ChevronUp size={14} className="text-gray-400" />
                          )}
                          {header.column.getIsSorted() === "desc" && (
                            <ChevronDown size={14} className="text-gray-400" />
                          )}
                          {!header.column.getIsSorted() && (
                            <div className="w-3.5 h-3.5" />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, rowIdx) => (
            <tr
              key={row.id}
              className="hover:bg-gray-50 transition-colors rounded-lg"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  ref={
                    cell.column.id === "overview"
                      ? setFirstCellRef(rowIdx)
                      : undefined
                  }
                  className="px-4 pt-4 pb-4 align-top"
                  style={{ width: cell.column.getSize(), height: "150px" }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
