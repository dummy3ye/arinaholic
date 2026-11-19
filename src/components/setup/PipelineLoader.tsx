"use client";

import dynamic from "next/dynamic";
import type { CSSProperties, ReactNode } from "react";
import type { Graph } from "@/lib/pipeline/types";
import styles from "./PipelineView.module.scss";

const PipelineView = dynamic(
  () => import("./PipelineView").then((module) => module.PipelineView),
  {
    ssr: false,
    loading: () => <div className={styles.placeholder} />,
  },
);

type Props = {
  graph: Graph;
  label: string;
  height: string;
  showChips?: boolean;
  legend?: ReactNode;
  scrollMinWidth?: string;
};

export function PipelineLoader({
  graph,
  label,
  height,
  showChips = true,
  legend,
  scrollMinWidth,
}: Props) {
  return (
    <div
      className={styles.slot}
      style={{ "--pipeline-height": height } as CSSProperties}
    >
      <PipelineView
        graph={graph}
        label={label}
        height={height}
        showChips={showChips}
        legend={legend}
        scrollMinWidth={scrollMinWidth}
      />
    </div>
  );
}
