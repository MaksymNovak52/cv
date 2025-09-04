"use client";
import { useEffect, useRef } from "react";

export function useLockBodyScroll(locked: boolean) {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!locked) return;

    const { documentElement, body } = document;
    scrollYRef.current = window.scrollY || window.pageYOffset;

    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      body.style.paddingRight = "";
      documentElement.style.overflow = "";
      window.scrollTo(0, scrollYRef.current);
    };
  }, [locked]);
}
