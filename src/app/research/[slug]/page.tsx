// biome-ignore-all lint/security/noDangerouslySetInnerHtml: article HTML comes from trusted repository Markdown rendered by the local pipeline.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import { PageShell } from "@/components/content/PageShell";
import { MetaPanel } from "@/components/research/MetaPanel";
import { ResearchCover } from "@/components/research/ResearchCover";
import { Toc } from "@/components/research/Toc";
import { formatAuthors } from "@/lib/authors";
import { renderMarkdown } from "@/lib/markdown";
import { getAllResearch, getAllSlugs, getResearch } from "@/lib/research";
import styles from "./article.module.scss";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getResearch(slug);
  if (!item) {
    return { title: "not found" };
  }

  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/research/${item.slug}` },
    openGraph: {
      type: "article",
      title: item.title,
      description: item.summary,
      url: `https://arinaholic.me/research/${item.slug}`,
      publishedTime: item.date,
      tags: item.tags,
    },
  };
}

export default async function ResearchArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getResearch(slug);
  if (!item) {
    notFound();
  }

  const { html, toc } = renderMarkdown(item.content);
  const pdf = item.links.find((link) => link.label.toLowerCase() === "pdf");
  const title = item.title.endsWith(".") ? item.title : `${item.title}.`;
  const authors = item.authors ?? (item.author ? [item.author] : []);

  const ordered = getAllResearch();
  const index = ordered.findIndex((entry) => entry.slug === item.slug);
  const next = index >= 0 ? ordered[index + 1] : undefined;

  return (
    <PageShell route="research">
      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.summary}>{item.summary}</p>
          {pdf && (
            <a className={styles.pill} href={pdf.href}>
              download the pdf
            </a>
          )}
        </header>

        <div className={styles.columns}>
          <div className={styles.tocDesktop}>
            <Toc entries={toc} />
          </div>

          <div className={styles.hero}>
            <ResearchCover
              cover={item.cover}
              aspectRatio="16 / 9"
              className={styles.heroMedia}
            />
            <p className={styles.credit}>by {formatAuthors(authors)}</p>
          </div>

          <details className={styles.tocMobile}>
            <summary className={styles.tocSummary}>contents</summary>
            <div className={styles.tocMobileBody}>
              <Toc entries={toc} />
            </div>
          </details>

          <div className={styles.metaMobile}>
            <MetaPanel item={item} />
          </div>

          <div
            className={styles.body}
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <aside className={styles.metaDesktop} aria-label="details">
            <MetaPanel item={item} />
          </aside>
        </div>

        <footer className={styles.articleFooter}>
          <hr className={styles.divider} />
          <nav className={styles.footerNav} aria-label="research navigation">
            <Link className="link small" href="/research">
              ← all research
            </Link>
            {next && (
              <Link className="link small" href={`/research/${next.slug}`}>
                next: {next.title} →
              </Link>
            )}
          </nav>
        </footer>
      </article>
    </PageShell>
  );
}
