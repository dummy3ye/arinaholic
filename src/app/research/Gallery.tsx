"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ResearchCard } from "@/components/research/ResearchCard";
import { formatResearchDate } from "@/lib/dates";
import type { ResearchMeta } from "@/lib/research";
import styles from "./research.module.scss";

type SortKey = "recent" | "oldest" | "az";
type ViewMode = "gallery" | "list";

const SORT_LABEL: Record<SortKey, string> = {
  recent: "most recent",
  oldest: "oldest",
  az: "a to z",
};

const padCount = (value: number) => String(value).padStart(2, "0");

function Chevron() {
  return (
    <svg
      className={styles.chevron}
      width="10"
      height="6"
      viewBox="0 0 10 6"
      aria-hidden="true"
    >
      <path
        d="M1 1l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useDismiss(
  open: boolean,
  onDismiss: (refocus: boolean) => void,
  rootRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      onDismiss(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onDismiss(true);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onDismiss, rootRef]);
}

function Dropdown({
  label,
  buttonLabel,
  menuLabel,
  multi = false,
  children,
}: {
  label: string;
  buttonLabel: ReactNode;
  menuLabel: string;
  multi?: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);
  const dismiss = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }, []);
  useDismiss(open, dismiss, rootRef);

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const options = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
    );
    if (options.length === 0) return;
    const current = options.indexOf(document.activeElement as HTMLElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      options[(current + 1) % options.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      options[(current - 1 + options.length) % options.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      options[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      options[options.length - 1]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className={styles.dropdown} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.control}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
      >
        {buttonLabel}
        <Chevron />
      </button>
      {open && (
        <div
          ref={menuRef}
          role="listbox"
          aria-label={menuLabel}
          aria-multiselectable={multi ? "true" : undefined}
          className={styles.menu}
          onKeyDown={onMenuKeyDown}
        >
          {/* close only reads buttonRef from an event handler, never during render. */}
          {children(close)}
        </div>
      )}
    </div>
  );
}

export function Gallery({ items }: { items: ResearchMeta[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [cats, setCats] = useState<string[]>(() => {
    const raw = searchParams.get("cat");
    return raw
      ? raw
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean)
      : [];
  });
  const [sort, setSort] = useState<SortKey>(() => {
    const raw = searchParams.get("sort");
    return raw === "oldest" || raw === "az" ? raw : "recent";
  });
  const [view, setView] = useState<ViewMode>(() =>
    searchParams.get("view") === "list" ? "list" : "gallery",
  );

  const syncUrl = (
    next: Partial<{
      q: string;
      cats: string[];
      sort: SortKey;
      view: ViewMode;
    }>,
  ) => {
    const merged = { q, cats, sort, view, ...next };
    const params = new URLSearchParams();
    if (merged.q.trim()) params.set("q", merged.q.trim());
    if (merged.cats.length) params.set("cat", merged.cats.join(","));
    if (merged.sort !== "recent") params.set("sort", merged.sort);
    if (merged.view !== "gallery") params.set("view", merged.view);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))].sort(),
    [items],
  );

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    const words = query ? query.split(/\s+/) : [];
    const filtered = items.filter((item) => {
      if (cats.length > 0 && !cats.includes(item.category)) return false;
      if (words.length === 0) return true;
      const haystack = [item.title, item.summary, item.category, ...item.tags]
        .join(" ")
        .toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
    if (sort === "oldest") {
      return [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    }
    if (sort === "az") {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }
    return filtered; // items arrive sorted by date, most recent first
  }, [items, q, cats, sort]);

  const clearFilters = () => {
    setQ("");
    setCats([]);
    syncUrl({ q: "", cats: [] });
  };

  const toggleCategory = (category: string) => {
    const next = cats.includes(category)
      ? cats.filter((entry) => entry !== category)
      : [...cats, category];
    setCats(next);
    syncUrl({ cats: next });
  };

  const updateQuery = (value: string) => {
    setQ(value);
    syncUrl({ q: value });
  };

  const updateSort = (value: SortKey) => {
    setSort(value);
    syncUrl({ sort: value });
  };

  const updateView = (value: ViewMode) => {
    setView(value);
    syncUrl({ view: value });
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.countRow}>
        <span className={styles.count}>
          {padCount(visible.length)} {visible.length === 1 ? "paper" : "papers"}
        </span>
      </div>

      <div className={styles.divider} role="presentation" />

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <Dropdown
            label="filter"
            menuLabel="filter by category"
            multi
            buttonLabel={
              cats.length > 0 ? (
                <>
                  filter<span className={styles.badge}>{cats.length}</span>
                </>
              ) : (
                "filter"
              )
            }
          >
            {() => (
              <>
                {categories.map((category) => {
                  const selected = cats.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={styles.option}
                      data-selected={selected ? "true" : "false"}
                      onClick={() => toggleCategory(category)}
                    >
                      <span className={styles.check} aria-hidden="true">
                        {selected ? "✓" : ""}
                      </span>
                      {category}
                    </button>
                  );
                })}
              </>
            )}
          </Dropdown>
        </div>

        <div className={styles.controlGroup}>
          <Dropdown
            label="sort"
            menuLabel="sort papers"
            buttonLabel={SORT_LABEL[sort]}
          >
            {(close) => (
              <>
                {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="option"
                    aria-selected={sort === key}
                    className={styles.option}
                    data-selected={sort === key ? "true" : "false"}
                    onClick={() => {
                      updateSort(key);
                      close();
                    }}
                  >
                    <span className={styles.check} aria-hidden="true">
                      {sort === key ? "✓" : ""}
                    </span>
                    {SORT_LABEL[key]}
                  </button>
                ))}
              </>
            )}
          </Dropdown>

          <fieldset className={styles.viewToggle} aria-label="view">
            <button
              type="button"
              aria-pressed={view === "gallery"}
              onClick={() => updateView("gallery")}
            >
              gallery
            </button>
            <button
              type="button"
              aria-pressed={view === "list"}
              onClick={() => updateView("list")}
            >
              list
            </button>
          </fieldset>

          <label className={styles.search}>
            <span className={styles.srOnly}>search research</span>
            <input
              type="search"
              placeholder="search"
              value={q}
              aria-label="search research"
              onChange={(event) => updateQuery(event.target.value)}
            />
            <svg
              className={styles.magnifier}
              width="14"
              height="14"
              viewBox="0 0 14 14"
              aria-hidden="true"
            >
              <circle
                cx="6"
                cy="6"
                r="4.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M9.6 9.6L13 13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </label>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className={styles.empty}>
          <p>nothing matches that.</p>
          {(q || cats.length > 0) && (
            <button
              type="button"
              className={styles.clearFilters}
              onClick={clearFilters}
            >
              clear filters
            </button>
          )}
        </div>
      ) : view === "gallery" ? (
        <div className={styles.grid}>
          {visible.map((item) => (
            <ResearchCard key={item.slug} item={item} />
          ))}
        </div>
      ) : (
        <ol className={styles.list}>
          {visible.map((item) => (
            <li key={item.slug} className={styles.listRow}>
              <Link href={`/research/${item.slug}`} className={styles.listLink}>
                <div className={styles.listLeft}>
                  <h2 className={styles.listTitle}>{item.title}</h2>
                  <p className={styles.listMeta}>
                    <span>{item.category}</span>
                    <span aria-hidden="true"> · </span>
                    <time dateTime={item.date}>
                      {formatResearchDate(item.date)}
                    </time>
                  </p>
                </div>
                <div className={styles.listRight}>
                  <p className={styles.listSummary}>{item.summary}</p>
                  <ul className={styles.listTags}>
                    {item.tags.map((tag) => (
                      <li key={tag}>#{tag}</li>
                    ))}
                  </ul>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
