"use client";

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
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Linkedin,
  LocateFixed,
} from "lucide-react";
import Link from "next/link";
import React, {
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ────────────────────────────────────────────────────────────
   helpers
   ──────────────────────────────────────────────────────────── */
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

/* ────────────────────────────────────────────────────────────
   hook: ever seen first N (sticky true once reached)
   ──────────────────────────────────────────────────────────── */
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

/* ────────────────────────────────────────────────────────────
   hook: is scrolled BELOW the first row (past its top)
   ──────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────── */

interface SkillTagProps {
  children: ReactNode;
}
const SkillTag: React.FC<SkillTagProps> = ({ children }) => (
  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-md">
    {children}
  </span>
);

function cleanClearanceStatus(clearance: string | null): string {
  if (!clearance) return "";
  return clearance.replace(/^English\s*/i, "").trim();
}

export function CandidatesTable({
  selectedJobId,
  candidatesByJob,
  handleCandidateClick,
  setIsStickyBtn,
}: {
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
                src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${c.full_name}`}
                alt={c.full_name}
                className="w-12 h-12 rounded-full"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-[#211C1A] text-[24px] font-normal leading-[21.6px]">
                  {c.full_name}
                </h2>
                <p className="text-[12px] text-[#A6A4A3] my-2 font-bold">
                  {(c.current_title ?? "") + (c.subtitle ?? "")}
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    href={(c as any).portfolio_url || ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-[#211C1A] font-bold hover:underline"
                  >
                    Portfolio
                  </Link>
                  <Linkedin size={16} className="text-gray-400" />
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
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[12px] font-bold">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-[#64605F]">Deployment:</span>
                <span className="text-[#211C1A]">{c.deployment_status}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-bold">
                <CheckCircle2 size={16} className="text-gray-400" />
                <span className="text-[#64605F]">English:</span>
                <span className="text-[#211C1A]">
                  {cleanClearanceStatus(c.clearance_status) || "B2"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-bold">
                <LocateFixed size={16} className="text-gray-400" />
                <span className="text-[#64605F]">Location:</span>
                <span className="text-[#211C1A]">{c.location}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-bold">
                <Briefcase size={16} className="text-gray-400" />
                <span className="text-[#64605F]">Experience:</span>
                <span className="text-gray-900">
                  {c.experience_years} Years
                </span>
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
            <div className="space-y-3" onClick={() => handleCandidateClick(c)}>
              <p className="text-[12px] text-[#000]">
                {c.requirements.length > 340
                  ? c.requirements?.slice(0, 340) + " ..."
                  : c.requirements}
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
              className="flex flex-col justify-between relative"
              onClick={() => handleCandidateClick(c)}
            >
              <div className="text-left mb-4">
                <p className="text-2xl font-normal text-[#211C1A] leading-[21.6px]">
                  ${c.salary?.toLocaleString() || "N/A"}
                  <span className="text-[12px] text-[#211C1A] font-bold">
                    /Year
                  </span>
                </p>
                <p className="text-[12px] text-[#A6A4A3] font-bold">
                  +Equity Package
                </p>
              </div>
              <button
                className="p-2 hover:bg-gray-100 rounded-md transition-colors absolute right-10 top-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFav(c.application_id);
                }}
                aria-label={c.is_favorite ? "Unfavorite" : "Favorite"}
              >
                {c.is_favorite ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="19"
                    viewBox="0 0 13 19"
                    fill="currentColor"
                  >
                    <path
                      d="M11.3125 0.5C11.6294 0.5 11.9321 0.62767 12.1543 0.852539C12.3762 1.07711 12.4999 1.38028 12.5 1.69531V17.9082L11.7324 17.4229L6.49902 14.1123L1.26758 17.4229L0.5 17.9082V1.69531C0.500089 1.38028 0.623835 1.07711 0.845703 0.852539C1.06794 0.627671 1.37064 0.5 1.6875 0.5H11.3125Z"
                      stroke="#211C1A"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="19"
                    viewBox="0 0 13 19"
                    fill="none"
                  >
                    <path
                      d="M11.3125 0.5C11.6294 0.5 11.9321 0.62767 12.1543 0.852539C12.3762 1.07711 12.4999 1.38028 12.5 1.69531V17.9082L11.7324 17.4229L6.49902 14.1123L1.26758 17.4229L0.5 17.9082V1.69531C0.500089 1.38028 0.623835 1.07711 0.845703 0.852539C1.06794 0.627671 1.37064 0.5 1.6875 0.5H11.3125Z"
                      stroke="#211C1A"
                    />
                  </svg>
                )}
              </button>
              <div className="flex items-center gap-2 text-sm text-[#211C1A]">
                <button className="flex items-center justify-center bg-[#D3EBE2] w-[106px] h-[40px] rounded-md hover:bg-green-200 transition-colors font-medium">
                  [A] Approve
                </button>
                <button className="flex items-center justify-center border border-[#E5E5E5] w-[106px] h-[40px] rounded-md transition-colors font-medium">
                  [H] Hold
                </button>
                <button className="flex items-center justify-center border border-[#E5E5E5] w-[106px] h-[40px] rounded-md transition-colors font-medium">
                  [R] Reject
                </button>
              </div>
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

  const sticky = firstThreeEver && belowFirstRow;

  return (
    <div className="font-sans overflow-auto" ref={scrollRef}>
      <div className="rounded-lg overflow-hidden">
        <div
          className={` mt-5 rounded-lg  max-h-[calc(100vh-100px)] overflow-y-auto ${
            sticky && " overflow-y-auto"
          }`}
          ref={scrollRef}
        >
          <table className="w-full">
            <thead className="bg-white sticky top-0 z-10">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-4 text-left text-xs text-gray-500 font-medium uppercase tracking-wider"
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
                                <ChevronUp
                                  size={14}
                                  className="text-gray-400"
                                />
                              )}
                              {header.column.getIsSorted() === "desc" && (
                                <ChevronDown
                                  size={14}
                                  className="text-gray-400"
                                />
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
                      className="px-6 py-6 align-top"
                      style={{ width: cell.column.getSize(), height: "100px" }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
