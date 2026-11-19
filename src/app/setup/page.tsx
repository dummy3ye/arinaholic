import type { Metadata } from "next";
import { Hero } from "@/components/content/Hero";
import { PageShell } from "@/components/content/PageShell";
import { Legend } from "@/components/setup/Legend";
import { PipelineLegend } from "@/components/setup/PipelineLegend";
import { PipelineLoader } from "@/components/setup/PipelineLoader";
import { compileGraph, kernelGraph } from "@/lib/pipeline/graphs";
import styles from "./setup.module.scss";

export const metadata: Metadata = {
  title: "setup",
  alternates: { canonical: "/setup" },
};

export default function SetupPage() {
  return (
    <PageShell route="setup">
      <section className="page setup-page">
        <Hero title="setup." lede="from source to silicon. hover anything." />
        <div className="sec">
          <PipelineLoader
            graph={compileGraph}
            height="clamp(680px, 52vw, 820px)"
            label="diagram of my toolchain, from source languages through compilers to operating systems"
            legend={<PipelineLegend />}
            scrollMinWidth="760px"
          />

          <div className={styles.kernel}>
            <div className={styles.kernelIntro}>
              <h2 className={styles.kernelHeading}>kernel loop.</h2>
              <p>every patch goes around at least once.</p>
            </div>
            <PipelineLoader
              graph={kernelGraph}
              height="220px"
              label="kernel patch loop from patch to stable"
              showChips={false}
              scrollMinWidth="720px"
            />
          </div>

          <Legend />
        </div>
      </section>
    </PageShell>
  );
}
