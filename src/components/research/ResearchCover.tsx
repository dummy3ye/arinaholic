import Image from "next/image";
import type { ResearchMeta } from "@/lib/research";
import { COVER_SHAPES } from "@/lib/research-covers";
import styles from "./ResearchCover.module.scss";

const BACKGROUND = {
  cream: "var(--bg)",
  blue: "var(--blue)",
  sage: "var(--sage)",
  red: "var(--red)",
} as const;

export function ResearchCover({
  cover,
  className,
  aspectRatio = "4 / 5",
}: {
  cover: ResearchMeta["cover"];
  className?: string;
  aspectRatio?: string;
}) {
  const classes = [styles.cover, className].filter(Boolean).join(" ");
  const imageRatio =
    cover.width && cover.height ? `${cover.width} / ${cover.height}` : null;

  if (cover.image) {
    return (
      <div
        className={classes}
        style={{ aspectRatio: imageRatio ?? aspectRatio }}
        aria-hidden="true"
      >
        <Image
          src={cover.image}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 700px"
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }

  return (
    <div className={classes} style={{ aspectRatio }} aria-hidden="true">
      <svg
        className={styles.art}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <rect width="100" height="100" fill={BACKGROUND[cover.bg]} />
        {cover.shapes.map((name) => {
          const shape = COVER_SHAPES[name as keyof typeof COVER_SHAPES];
          if (!shape) return null;
          return (
            <circle
              key={name}
              cx={shape.cx}
              cy={shape.cy}
              r={shape.r}
              fill={shape.color}
            />
          );
        })}
      </svg>
    </div>
  );
}
