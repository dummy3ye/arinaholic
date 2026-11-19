import { formatResearchDate } from "@/lib/dates";
import type { ResearchMeta } from "@/lib/research";
import styles from "./MetaPanel.module.scss";

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

export function MetaPanel({ item }: { item: ResearchMeta }) {
  return (
    <dl className={styles.panel}>
      <div className={styles.row}>
        <dt className={styles.key}>published</dt>
        <dd className={styles.value}>
          <time dateTime={item.date}>{formatResearchDate(item.date)}</time>
        </dd>
      </div>
      <div className={styles.row}>
        <dt className={styles.key}>category</dt>
        <dd className={styles.value}>{item.category}</dd>
      </div>
      <div className={styles.row}>
        <dt className={styles.key}>topics</dt>
        <dd className={styles.value}>
          <ul className={styles.topics}>
            {item.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </dd>
      </div>
      {item.links.length > 0 && (
        <div className={styles.row}>
          <dt className={styles.key}>links</dt>
          <dd className={styles.value}>
            <ul className={styles.links}>
              {item.links.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <a
                    className={styles.link}
                    href={link.href}
                    {...(isExternal(link.href)
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      )}
    </dl>
  );
}
