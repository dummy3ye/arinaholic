import type { ResearchMeta } from "@/lib/research";
import { ResearchCard } from "@/components/research/ResearchCard";
import styles from "./research.module.scss";

// Server-rendered fallback shown by Suspense until the interactive gallery
// hydrates. Keeps /research useful without JS and crawlable by bots.
export function StaticGrid({ items }: { items: ResearchMeta[] }) {
  const count = String(items.length).padStart(2, "0");

  return (
    <div className={styles.gallery}>
      <div className={styles.countRow}>
        <span className={styles.count}>
          {count} {items.length === 1 ? "paper" : "papers"}
        </span>
      </div>
      <div className={styles.divider} role="presentation" />
      <div className={styles.grid}>
        {items.map((item) => (
          <ResearchCard key={item.slug} item={item} />
        ))}
      </div>
    </div>
  );
}
