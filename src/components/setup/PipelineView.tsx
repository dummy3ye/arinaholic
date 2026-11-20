"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPipeline } from "@/lib/pipeline/engine";
import {
  chipGroups,
  describeLane,
  describeNode,
  describeRoutes,
} from "@/lib/pipeline/graphs";
import type { Graph, HighlightLane, Selection } from "@/lib/pipeline/types";
import styles from "./PipelineView.module.scss";

type Props = {
  graph: Graph;
  label: string;
  height: string;
  showChips?: boolean;
  legend?: ReactNode;
  scrollMinWidth?: string;
};

type HoverTip = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const TOOLTIP_WIDTH = 238;

// `height` is part of the shared loader interface; the loader reserves the
// space, so this component only fills it.
export function PipelineView({
  graph,
  label,
  showChips = true,
  legend,
  scrollMinWidth,
}: Props) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descId = `${baseId}-desc`;
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ReturnType<typeof createPipeline> | null>(null);
  const canHoverRef = useRef(true);

  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<HoverTip | null>(null);
  const [pinned, setPinned] = useState<Selection | null>(null);
  const [focused, setFocused] = useState<Selection | null>(null);
  const [debugVisible, setDebugVisible] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  const groups = useMemo(() => chipGroups(graph), [graph]);
  const active = pinned ?? focused;

  const onHover = useCallback((nodeId: string | null, rect: DOMRect | null) => {
    if (!nodeId || !rect || !canHoverRef.current) {
      setHover(null);
      return;
    }
    setHover({
      id: nodeId,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  const onPin = useCallback((selection: Selection | null) => {
    setHover(null);
    setPinned(selection);
  }, []);

  useEffect(() => {
    canHoverRef.current = window.matchMedia("(hover: hover)").matches;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(motion.matches);
    motion.addEventListener("change", onChange);
    return () => motion.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !frame || !viewport) return;

    const engine = createPipeline(canvas, graph, {
      onHover,
      onPin,
      reducedMotion,
    });
    engineRef.current = engine;

    let resizeRaf = 0;
    const syncMeasurements = () => {
      setFrameSize({ w: frame.clientWidth, h: frame.clientHeight });
      setOverflowing(viewport.scrollWidth > viewport.clientWidth + 1);
      engine.resize();
    };
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(syncMeasurements);
    });
    resizeObserver.observe(frame);
    resizeObserver.observe(viewport);
    syncMeasurements();

    let visible = true;
    const syncPaused = () => engine.setPaused(!visible || document.hidden);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPaused();
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(frame);
    document.addEventListener("visibilitychange", syncPaused);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setHover(null);
      setPinned(null);
      setFocused(null);
    };
    window.addEventListener("keydown", onKeyDown);

    const onLane = (event: Event) => {
      const lane = (event as CustomEvent<HighlightLane | null>).detail;
      setHover(null);
      setPinned(lane ? { kind: "lane", lane } : null);
    };
    window.addEventListener("setup:lane", onLane);

    return () => {
      cancelAnimationFrame(resizeRaf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", syncPaused);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("setup:lane", onLane);
      engine.destroy();
      engineRef.current = null;
    };
  }, [graph, onHover, onPin, reducedMotion]);

  useEffect(() => {
    engineRef.current?.setSelection(active);
  }, [active]);

  useEffect(() => {
    engineRef.current?.setDebugVisible(debugVisible);
  }, [debugVisible]);

  const liveText = active
    ? active.kind === "node"
      ? describeNode(graph, active.id)
      : active.kind === "lane"
        ? describeLane(active.lane)
        : describeRoutes(graph, active.ids ?? [active.id])
    : showChips
      ? "hover a node, or pick a language."
      : "hover a node.";

  const tooltipNode = hover
    ? graph.nodes.find((node) => node.id === hover.id)
    : null;
  const tooltipStyle: CSSProperties | undefined =
    tooltipNode && hover
      ? (() => {
          const centre = hover.x + hover.width / 2;
          const preferred = centre + 12;
          const flipped = preferred + TOOLTIP_WIDTH > frameSize.w - 8;
          const left = flipped ? centre - TOOLTIP_WIDTH - 12 : preferred;
          const maxLeft = Math.max(8, frameSize.w - TOOLTIP_WIDTH - 8);
          return {
            left: `${Math.max(8, Math.min(left, maxLeft))}`,
            top: `${Math.max(8, Math.min(hover.y - 6, frameSize.h - 70))}`,
          };
        })()
      : undefined;

  const selectGroup = (ids: string[]) => {
    setHover(null);
    viewportRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    setPinned((current) =>
      current?.kind === "route" &&
      ids.every((id) => (current.ids ?? [current.id]).includes(id))
        ? null
        : { kind: "route", id: ids[0], ids },
    );
  };

  const viewportStyle = scrollMinWidth
    ? ({ "--scroll-min": scrollMinWidth } as CSSProperties)
    : undefined;
  const beforeFrame = graph.columns.length > 0;
  const hintBase = showChips
    ? "hover a node, or pick a language."
    : "hover a node.";
  const touchBase = showChips
    ? "tap a node, or pick a language."
    : "tap a node.";
  const swipeText = overflowing ? " · swipe to explore" : "";

  const controls = (
    <div className={styles.controls}>
      <fieldset
        className={styles.pills}
        aria-label={showChips ? "choose a language route" : "diagram controls"}
      >
        {showChips &&
          groups.map((group) => {
            const isActive =
              active?.kind === "route" &&
              group.ids.every((id) => (active.ids ?? [active.id]).includes(id));
            return (
              <button
                type="button"
                key={group.label}
                className={`${styles.pill} ${isActive ? styles.pillActive : ""}`}
                aria-pressed={isActive}
                onClick={() => selectGroup(group.ids)}
              >
                {group.label}
              </button>
            );
          })}
        {showChips && graph.loops.length > 0 && (
          <button
            type="button"
            className={`${styles.pill} ${debugVisible ? styles.pillActive : ""}`}
            aria-pressed={debugVisible}
            onClick={() => setDebugVisible((value) => !value)}
          >
            show debug loop
          </button>
        )}
      </fieldset>
      <p className={styles.hint}>
        <span className={styles.hintHover}>
          {hintBase}
          {swipeText}
        </span>
        <span className={styles.hintTouch}>
          {touchBase}
          {swipeText}
        </span>
      </p>
    </div>
  );

  return (
    <>
      {beforeFrame && controls}
      {beforeFrame && legend}

      <div
        className={`${styles.viewport} ${overflowing ? styles.viewportOverflow : ""}`}
        ref={viewportRef}
        style={viewportStyle}
      >
        <div className={styles.frame} ref={frameRef}>
          <figure
            className={styles.figure}
            aria-labelledby={titleId}
            aria-describedby={descId}
          >
            <canvas
              className={styles.canvas}
              ref={canvasRef}
              aria-hidden="true"
              tabIndex={-1}
            />
            <figcaption className={styles.srOnly}>
              <span id={titleId}>{label}.</span>
              <div id={descId}>
                <span>{liveText}</span>
                <ul>
                  {graph.routes.map((route) => (
                    <li key={route.id}>{describeRoutes(graph, [route.id])}</li>
                  ))}
                </ul>
              </div>
            </figcaption>
          </figure>
          {tooltipNode && tooltipStyle && (
            <div className={styles.tooltip} style={tooltipStyle}>
              <span className={styles.tooltipLabel}>{tooltipNode.label}</span>
              {tooltipNode.note && (
                <span className={styles.tooltipNote}>{tooltipNode.note}</span>
              )}
              {tooltipNode.href && (
                <a
                  className={styles.tooltipLink}
                  href={tooltipNode.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  more
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {!beforeFrame && controls}
      {!beforeFrame && legend}

      <p
        className={`${styles.live} ${showChips ? "" : styles.srOnly}`}
        aria-live="polite"
      >
        {liveText}
      </p>

      <div className={styles.nodeIndex}>
        {graph.nodes.map((node) => (
          <button
            type="button"
            key={node.id}
            className={styles.nodeButton}
            aria-label={describeNode(graph, node.id)}
            onFocus={() => setFocused({ kind: "node", id: node.id })}
            onBlur={() => setFocused(null)}
            onClick={() => onPin({ kind: "node", id: node.id })}
          >
            {node.label}
          </button>
        ))}
      </div>
    </>
  );
}
