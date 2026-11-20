"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Nav } from "./Nav";

const HIDE_AFTER = 600;
const MIN_DELTA = 2;

function getScrollY() {
  return (
    window.scrollY ||
    document.documentElement?.scrollTop ||
    document.body?.scrollTop ||
    0
  );
}

const MOBILE_QUERY = "(max-width: 820px)";

// "/" stays a transparent one-screen navbar and "/contact" is intentionally
// left without a background too; every other page gets the solid navbar
// background on phones (desktop keeps the scrollable-only behavior).
const routeAllowsBackground = (pathname: string) =>
  pathname !== "/" && pathname !== "/contact";

export function Header() {
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const [scrollable, setScrollable] = useState(false);
  const lastY = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    const check = () => {
      const phone =
        typeof window.matchMedia === "function" &&
        window.matchMedia(MOBILE_QUERY).matches;
      setScrollable(
        routeAllowsBackground(pathname) &&
          (phone ||
            document.documentElement.scrollHeight > window.innerHeight + 1),
      );
    };
    check();

    window.addEventListener("resize", check);
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(check);
      ro.observe(document.body);
    }

    return () => {
      window.removeEventListener("resize", check);
      ro?.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    lastY.current = getScrollY();

    const onScroll = () => {
      const y = getScrollY();
      const delta = y - lastY.current;

      if (y <= 0) {
        setCompact(false);
        setHidden(false);
      } else if (delta > MIN_DELTA) {
        setCompact(true);
        if (y > HIDE_AFTER) {
          setHidden(true);
        }
      } else if (delta < -MIN_DELTA) {
        setCompact(false);
        setHidden(false);
      }

      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    return () =>
      window.removeEventListener("scroll", onScroll, { capture: true });
  }, []);

  return (
    <header
      data-hidden={hidden ? "true" : undefined}
      data-scrollable={scrollable ? "true" : undefined}
    >
      <Link
        className="logo"
        data-compact={compact ? "true" : undefined}
        aria-label="sagittarius"
        href="/"
      >
        <span className="logo-sag" aria-hidden="true">
          sag
        </span>
        <span className="logo-tail" aria-hidden="true">
          <span className="logo-tail-long">ittarius</span>
          <span className="logo-tail-short">e</span>
        </span>
      </Link>
      <Nav />
    </header>
  );
}
