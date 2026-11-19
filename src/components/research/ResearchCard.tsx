import Link from "next/link";
import type { CSSProperties } from "react";
import type { ResearchMeta } from "@/lib/research";
import { formatResearchDate } from "@/lib/dates";
import { ResearchCover } from "./ResearchCover";
import styles from "./ResearchCard.module.scss";

export function ResearchCard({ item }: { item: ResearchMeta }) {
  return (
    <article
      className={styles.card}
      style={
        {
          "--span": String(item.span),
          "--offset": String(item.offset),
        } as CSSProperties
      }
    >
      <Link href={`/research/${item.slug}`} className={styles.link}>
        <div className={styles.meta}>
          <span>{item.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={item.date}>{formatResearchDate(item.date)}</time>
        </div>
        <ResearchCover
          cover={item.cover}
          aspectRatio={item.span === 2 ? "21 / 9" : "4 / 5"}
          className={styles.cover}
        />
        <h2 className={styles.title}>{item.title}</h2>
        <p className={styles.summary}>{item.summary}</p>
      </Link>
    </article>
  );
}
