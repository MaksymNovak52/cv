"use client";
import { useEffect, useState } from "react";

export function useIsMobile(max = 450) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${max}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
    onChange(mq);
    mq.addEventListener?.("change", onChange as any);
    return () => mq.removeEventListener?.("change", onChange as any);
  }, [max]);
  return isMobile;
}
