"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/markdown";
import styles from "./Toc.module.scss";

export function Toc({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState<string>(entries[0]?.id ?? "");

  useEffect(() => {
    if (entries.length === 0) return;

    const observer = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    for (const { id } of entries) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav aria-label="table of contents" className={styles.toc}>
      <ol className={styles.list}>
        {entries.map((entry, index) => {
          const isActive = active === entry.id;
          return (
            <li key={entry.id} className={styles.item}>
              <a
                href={`#${entry.id}`}
                className={styles.link}
                aria-current={isActive ? "true" : undefined}
                data-active={isActive ? "true" : undefined}
                onClick={(event) => {
                  const target = document.getElementById(entry.id);
                  if (!target) return;
                  event.preventDefault();
                  const reduceMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches;
                  target.scrollIntoView({
                    behavior: reduceMotion ? "auto" : "smooth",
                    block: "start",
                  });
                  window.history.pushState(null, "", `#${entry.id}`);
                }}
              >
                <span className={styles.num}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.label}>{entry.text}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
