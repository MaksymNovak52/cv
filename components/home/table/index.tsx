"use client";

import { useUser } from "@/provider";
import { useToggleFavorite } from "@/queries/candidates";
import { CandidateRow } from "@/type";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useTableColumns from "./column";

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

export function CandidatesTable({
  selectedJobId,
  candidatesByJob,
  handleCandidateClick,
  setIsStickyBtn,
  handleDeleteCandidate,

  onEditCandidate,
}: {
  onEditCandidate: (candidate: CandidateRow) => void;
  handleDeleteCandidate: (candidateId: string) => void;
  setIsStickyBtn: React.Dispatch<SetStateAction<boolean>>;
  selectedJobId: string;
  candidatesByJob: CandidateRow[];
  handleCandidateClick: (candidate: CandidateRow) => void;
}): JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const { mutate: toggleFav } = useToggleFavorite(selectedJobId);
  const { isAdmin } = useUser();

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

  const columns = useTableColumns(
    handleCandidateClick,
    onEditCandidate,
    toggleFav,
    isAdmin,
    handleDeleteCandidate
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
