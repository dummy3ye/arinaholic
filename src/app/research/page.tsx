import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/content/Hero";
import { PageShell } from "@/components/content/PageShell";
import { getAllResearch } from "@/lib/research";
import { Gallery } from "./Gallery";
import { StaticGrid } from "./StaticGrid";

export const metadata: Metadata = {
  title: "research",
  alternates: { canonical: "/research" },
};

export default function ResearchPage() {
  const items = getAllResearch();

  return (
    <PageShell route="research">
      <section className="page">
        <Hero title="research." lede="notes, experiments and write-ups." />
        <div className="sec">
          <Suspense fallback={<StaticGrid items={items} />}>
            <Gallery items={items} />
          </Suspense>
        </div>
      </section>
    </PageShell>
  );
}
