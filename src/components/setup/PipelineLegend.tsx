"use client";

import styles from "@/app/setup/setup.module.scss";
import type { HighlightLane } from "@/lib/pipeline/types";

const items: { lane: HighlightLane; label: string; glyph: string }[] = [
  {
    lane: "llvm",
    label: "through llvm",
    glyph: `${styles.glyph} ${styles.llvmDot}`,
  },
  {
    lane: "native",
    label: "own native compiler",
    glyph: `${styles.glyph} ${styles.nativeDot}`,
  },
  {
    lane: "runtime",
    label: "runtime or interpreter",
    glyph: `${styles.glyph} ${styles.runtimeDot}`,
  },
  {
    lane: "debug",
    label: "debug loop",
    glyph: `${styles.glyph} ${styles.debugDash}`,
  },
];

function announce(lane: HighlightLane | null) {
  window.dispatchEvent(
    new CustomEvent<HighlightLane | null>("setup:lane", { detail: lane }),
  );
}

export function PipelineLegend() {
  return (
    <ul className={styles.legend} data-legend>
      {items.map((item) => (
        <li
          className={styles.legendItem}
          data-legend-item={item.lane}
          key={item.lane}
        >
          <button
            type="button"
            className={styles.legendButton}
            aria-label={`highlight ${item.label}`}
            onMouseEnter={() => announce(item.lane)}
            onMouseLeave={() => announce(null)}
            onFocus={() => announce(item.lane)}
            onBlur={() => announce(null)}
            onClick={() => announce(item.lane)}
          >
            <span className={item.glyph} aria-hidden="true" />
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
