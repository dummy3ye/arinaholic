import { readTheme, type Theme } from "./theme";
import type {
  Color,
  Graph,
  HighlightLane,
  Lane,
  Loop,
  Selection,
} from "./types";

type Point = { x: number; y: number };

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type Edge = {
  key: string;
  a: string;
  b: string;
  points: Point[];
  lengths: number[];
  total: number;
  lane: Lane;
  color?: Color;
  loop?: Loop;
};

type LayoutNode = {
  id: string;
  label: string;
  col: number;
  radius: number;
  x: number;
  y: number;
  color: Color;
};

type Particle = {
  routeId: string;
  edge: Edge;
  t: number;
  speed: number;
  size: number;
  alpha: number;
  loopCount: number;
  fading: boolean;
};

type Highlight = {
  nodes: Set<string>;
  edges: Set<string>;
  routes: Set<string>;
};

type Options = {
  onHover(nodeId: string | null, rect: DOMRect | null): void;
  onPin(selection: Selection | null): void;
  reducedMotion: boolean;
};

type LabelPlacement = {
  x: number;
  y: number;
  align: CanvasTextAlign;
  baseline: CanvasTextBaseline;
  box: Bounds;
  width: number;
  top: number;
  bottom: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const lanePriority: Record<Lane, number> = { runtime: 1, native: 2, llvm: 3 };
const ROW_SPAN = 8.4; // rows 0..8 plus the 0.4 group gap
const FRAME_PAD = 32;
const LABEL_GAP = 12;
const LABEL_SIZE = 12;

function emptyBounds(): Bounds {
  return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
}

function includeBox(target: Bounds, box: Bounds) {
  target.minX = Math.min(target.minX, box.minX);
  target.minY = Math.min(target.minY, box.minY);
  target.maxX = Math.max(target.maxX, box.maxX);
  target.maxY = Math.max(target.maxY, box.maxY);
}

function cubic(a: Point, b: Point, c: Point, d: Point, t: number): Point {
  const u = 1 - t;
  return {
    x:
      u * u * u * a.x +
      3 * u * u * t * b.x +
      3 * u * t * t * c.x +
      t * t * t * d.x,
    y:
      u * u * u * a.y +
      3 * u * u * t * b.y +
      3 * u * t * t * c.y +
      t * t * t * d.y,
  };
}

function sample(points: Point[]) {
  const lengths = [0];
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    lengths.push(lengths[i - 1] + Math.hypot(dx, dy));
  }
  return { lengths, total: lengths[lengths.length - 1] || 1 };
}

function pointAt(edge: Edge, t: number): Point {
  const target = clamp(t, 0, 1) * edge.total;
  let low = 0;
  let high = edge.lengths.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (edge.lengths[mid] < target) low = mid + 1;
    else high = mid;
  }
  const i = Math.max(1, low);
  const span = edge.lengths[i] - edge.lengths[i - 1] || 1;
  const local = (target - edge.lengths[i - 1]) / span;
  const a = edge.points[i - 1];
  const b = edge.points[i];
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local };
}

function normalAt(edge: Edge): Point {
  const a = edge.points[28];
  const b = edge.points[36];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  return { x: -dy / length, y: dx / length };
}

function extremePoint(edge: Edge, side: "top" | "bottom"): Point {
  let best = edge.points[0];
  for (const point of edge.points) {
    if (side === "bottom" ? point.y > best.y : point.y < best.y) best = point;
  }
  return best;
}

function loopIds(loop: Loop): string[] {
  if (loop.fromIds) return [...loop.fromIds];
  return typeof loop.from === "string" ? [loop.from] : [];
}

export function createPipeline(
  canvas: HTMLCanvasElement,
  graph: Graph,
  opts: Options,
) {
  const ctx = canvas.getContext("2d")!;
  const bgLayer = document.createElement("canvas");
  const bgCtx = bgLayer.getContext("2d")!;
  const fgLayer = document.createElement("canvas");
  const fgCtx = fgLayer.getContext("2d")!;
  if (!ctx || !bgCtx || !fgCtx) {
    return {
      resize() {},
      setSelection() {},
      setDebugVisible() {},
      setPaused() {},
      destroy() {},
    };
  }

  let theme: Theme = readTheme();
  let width = 0;
  let height = 0;
  let ratio = 1;
  let scale = 1;
  let viewFit = 1;
  let viewX = 0;
  let viewY = 0;
  let columnCount = 1;
  let plotLeft = 0;
  let plotRight = 0;
  let captionY = 0;
  let destroyed = false;
  let paused = false;
  let debugVisible = false;
  let raf = 0;
  let lastTime = 0;
  let selection: Selection | null = null;
  let hoverId: string | null = null;
  let hoverLoopId: string | null = null;
  const particles: Particle[] = [];
  const accumulators = new Map<string, number>();
  const pulses = new Map<string, number>();
  const inkItems: { name: string; box: Bounds }[] = [];
  let layoutNodes = new Map<string, LayoutNode>();
  let edges = new Map<string, Edge>();
  const routeById = new Map(graph.routes.map((route) => [route.id, route]));

  function laneForSource(id: string): Lane {
    const route = graph.routes.find((item) => item.path.includes(id));
    return route?.lane ?? "native";
  }

  function setViewTransform(target: CanvasRenderingContext2D) {
    target.setTransform(
      ratio * viewFit,
      0,
      0,
      ratio * viewFit,
      ratio * viewX,
      ratio * viewY,
    );
  }

  function clearLayer(target: CanvasRenderingContext2D) {
    target.save();
    target.setTransform(1, 0, 0, 1, 0, 0);
    target.clearRect(0, 0, target.canvas.width, target.canvas.height);
    target.restore();
  }

  function drawLayer(layer: HTMLCanvasElement) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(layer, 0, 0);
    ctx.restore();
  }

  function compositeBackground() {
    clearLayer(ctx);
    drawLayer(bgLayer);
  }

  function compositeForeground() {
    drawLayer(fgLayer);
  }

  function toLayout(point: Point): Point {
    return { x: (point.x - viewX) / viewFit, y: (point.y - viewY) / viewFit };
  }

  function toCssRect(node: LayoutNode) {
    const x = node.x * viewFit + viewX;
    const y = node.y * viewFit + viewY;
    const size = node.radius * viewFit;
    return new DOMRect(x - size, y - size, size * 2, size * 2);
  }

  function measureLabel(text: string, weight: 500 | 600 = 600) {
    fgCtx.save();
    fgCtx.font = `${weight} ${LABEL_SIZE}px ${theme.labelFont}`;
    const metrics = fgCtx.measureText(text);
    const top = -(metrics.fontBoundingBoxAscent ?? 9);
    const bottom = metrics.fontBoundingBoxDescent ?? 3;
    fgCtx.restore();
    return { width: metrics.width, top, bottom };
  }

  function textBox(
    x: number,
    y: number,
    width: number,
    top: number,
    bottom: number,
    align: CanvasTextAlign,
    baseline: CanvasTextBaseline,
  ): Bounds {
    const left =
      align === "right" ? x - width : align === "center" ? x - width / 2 : x;
    const upper = baseline === "top" ? y + top : y - width * 0 + top;
    const lower = baseline === "top" ? y + bottom : y + bottom;
    return {
      minX: left - 2,
      minY: upper - 2,
      maxX: left + width + 2,
      maxY: lower + 2,
    };
  }

  function labelPlacement(node: LayoutNode, label: string): LabelPlacement {
    const metrics = measureLabel(label);
    const main = graph.columns.length > 0;
    if (main && node.col === 0) {
      const x = node.x - node.radius - LABEL_GAP;
      return {
        x,
        y: node.y,
        align: "right",
        baseline: "middle",
        box: textBox(
          x,
          node.y,
          metrics.width,
          metrics.top,
          metrics.bottom,
          "right",
          "middle",
        ),
        ...metrics,
      };
    }
    if (main && node.col === columnCount - 1) {
      const x = node.x + node.radius + LABEL_GAP;
      return {
        x,
        y: node.y,
        align: "left",
        baseline: "middle",
        box: textBox(
          x,
          node.y,
          metrics.width,
          metrics.top,
          metrics.bottom,
          "left",
          "middle",
        ),
        ...metrics,
      };
    }
    const y = node.y + node.radius + LABEL_GAP;
    return {
      x: node.x,
      y,
      align: "center",
      baseline: "top",
      box: textBox(
        node.x,
        y,
        metrics.width,
        metrics.top,
        metrics.bottom,
        "center",
        "top",
      ),
      ...metrics,
    };
  }

  function addEdge(
    key: string,
    aId: string,
    bId: string,
    lane: Lane,
    loop?: Loop,
  ) {
    const a = layoutNodes.get(aId);
    const b = layoutNodes.get(bId);
    if (!a || !b) return;

    const existing = edges.get(key);
    if (existing) {
      if (loop || lanePriority[lane] > lanePriority[existing.lane]) {
        existing.lane = loop ? existing.lane : lane;
        existing.loop = loop;
        edges.set(key, existing);
      }
      return;
    }

    let start = { x: a.x, y: a.y };
    let end = { x: b.x, y: b.y };
    let controls: [Point, Point];
    if (loop) {
      const bottom = loop.side === "bottom";
      start = { x: a.x + (bottom ? a.radius : -a.radius), y: a.y };
      end = { x: b.x + (bottom ? -b.radius : b.radius), y: b.y };
      // Clamp the dip by horizontal distance so a long arc cannot dive out of
      // the frame. The second control is solved so the curve's lowest point
      // lands on that depth while the first control leaves the node sideways.
      const dip = Math.min(72, Math.abs(end.x - start.x) * 0.12);
      const target = bottom
        ? Math.min(height - FRAME_PAD - 18, Math.max(start.y, end.y) + dip)
        : Math.max(FRAME_PAD + 18, Math.min(start.y, end.y) - dip);
      const first = { x: start.x + (bottom ? 40 : -40), y: start.y };
      const second = {
        x: end.x + (bottom ? -40 : 40),
        y: (8 * target - start.y - 3 * first.y - end.y) / 3,
      };
      controls = [first, second];
    } else {
      const dx = b.x - a.x;
      controls = [
        { x: a.x + dx * 0.45, y: a.y },
        { x: b.x - dx * 0.45, y: b.y },
      ];
    }

    const points: Point[] = [];
    for (let i = 0; i <= 64; i += 1) {
      const point = cubic(start, controls[0], controls[1], end, i / 64);
      if (loop) {
        point.y =
          loop.side === "bottom"
            ? Math.min(point.y, height - FRAME_PAD - 18)
            : Math.max(point.y, FRAME_PAD + 18);
      }
      points.push(point);
    }
    const { lengths, total } = sample(points);
    edges.set(key, {
      key,
      a: aId,
      b: bId,
      points,
      lengths,
      total,
      lane,
      color: loop ? loop.color : undefined,
      loop,
    });
  }

  function rowFraction(row: number) {
    return (row + (row > 3 ? 0.4 : 0)) / ROW_SPAN;
  }

  function loopLabelPoint(edge: Edge): Point {
    return extremePoint(edge, edge.loop?.side ?? "bottom");
  }

  function loopLabelY(edge: Edge, point: Point) {
    return point.y + (edge.loop?.side === "bottom" ? 14 : -10);
  }

  function addInk(name: string, box: Bounds, bounds: Bounds) {
    includeBox(bounds, box);
    inkItems.push({ name, box });
  }

  function layout() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    ratio = Math.min(
      typeof devicePixelRatio === "number" ? devicePixelRatio : 1,
      2,
    );
    scale = clamp(width / 1440, 0.6, 1);
    inkItems.length = 0;

    for (const target of [canvas, bgLayer, fgLayer]) {
      target.width = Math.round(width * ratio);
      target.height = Math.round(height * ratio);
    }

    const main = graph.columns.length > 0;
    columnCount =
      graph.columns.length ||
      Math.max(...graph.nodes.map((node) => node.col)) + 1;
    const columns = Math.max(1, columnCount - 1);
    const radiusOf = (id: string) =>
      Math.max(
        8,
        (graph.nodes.find((node) => node.id === id)?.r ?? 12) * scale,
      );

    let firstLabelWidth = 0;
    let lastLabelWidth = 0;
    let firstRadius = 0;
    let lastRadius = 0;
    for (const node of graph.nodes) {
      const widthOfLabel = measureLabel(node.label).width;
      if (node.col === 0) {
        firstLabelWidth = Math.max(firstLabelWidth, widthOfLabel);
        firstRadius = Math.max(firstRadius, radiusOf(node.id));
      }
      if (node.col === columnCount - 1) {
        lastLabelWidth = Math.max(lastLabelWidth, widthOfLabel);
        lastRadius = Math.max(lastRadius, radiusOf(node.id));
      }
    }

    const firstX = main
      ? FRAME_PAD + firstLabelWidth + LABEL_GAP + firstRadius
      : Math.max(FRAME_PAD + firstLabelWidth / 2, FRAME_PAD + firstRadius);
    const lastX = main
      ? width - FRAME_PAD - lastRadius - LABEL_GAP - lastLabelWidth
      : Math.min(
          width - FRAME_PAD - lastLabelWidth / 2,
          width - FRAME_PAD - lastRadius,
        );
    const span = Math.max(80, lastX - firstX);
    plotLeft = firstX;
    plotRight = firstX + span;
    captionY = FRAME_PAD + 8;

    const topY = FRAME_PAD + 48;
    const bottomY = main ? height - FRAME_PAD - 88 : height - FRAME_PAD - 44;

    layoutNodes = new Map(
      graph.nodes.map((node) => {
        const frac = node.row === undefined ? node.y : rowFraction(node.row);
        return [
          node.id,
          {
            id: node.id,
            label: node.label,
            col: node.col,
            radius: radiusOf(node.id),
            x: firstX + (node.col / columns) * span,
            y: topY + frac * (bottomY - topY),
            color: node.color,
          },
        ];
      }),
    );

    edges = new Map();
    for (const route of graph.routes) {
      for (let i = 0; i < route.path.length - 1; i += 1) {
        addEdge(
          `${route.path[i]}>${route.path[i + 1]}`,
          route.path[i],
          route.path[i + 1],
          route.lane,
        );
      }
    }
    for (const [from, continuations] of Object.entries(graph.continuations)) {
      for (const continuation of continuations) {
        addEdge(
          `${from}>${continuation.to}`,
          from,
          continuation.to,
          laneForSource(from),
        );
      }
    }
    for (const loop of graph.loops) {
      const starts = loop.fromIds
        ? loop.fromIds
            .map((id) => layoutNodes.get(id))
            .filter((node): node is LayoutNode => Boolean(node))
        : typeof loop.from === "number"
          ? [...layoutNodes.values()].filter((node) => node.col === loop.from)
          : [layoutNodes.get(loop.from ?? "")].filter(
              (node): node is LayoutNode => Boolean(node),
            );
      const ends = loop.toIds ? loop.toIds : [loop.to ?? ""];
      starts.forEach((start, index) => {
        const end = ends[index % ends.length];
        addEdge(`loop:${loop.id}:${start.id}`, start.id, end, "native", loop);
      });
    }

    const bounds = emptyBounds();
    for (const node of layoutNodes.values()) {
      addInk(
        `node:${node.id}`,
        {
          minX: node.x - node.radius - 2,
          minY: node.y - node.radius - 2,
          maxX: node.x + node.radius + 2,
          maxY: node.y + node.radius + 2,
        },
        bounds,
      );
      addInk(`label:${node.id}`, labelPlacement(node, node.label).box, bounds);
    }
    for (const edge of edges.values()) {
      const margin = edge.loop ? 9 : 3;
      for (const point of edge.points) {
        includeBox(bounds, {
          minX: point.x - margin,
          minY: point.y - margin,
          maxX: point.x + margin,
          maxY: point.y + margin,
        });
      }
      if (edge.loop) {
        const point = loopLabelPoint(edge);
        const y = loopLabelY(edge, point);
        const metrics = measureLabel(edge.loop!.label);
        addInk(
          `label:${edge.loop!.id}`,
          textBox(
            point.x,
            y,
            metrics.width,
            metrics.top,
            metrics.bottom,
            "center",
            "middle",
          ),
          bounds,
        );
      }
    }
    if (main) {
      graph.columns.forEach((caption, col) => {
        const metrics = measureLabel(caption);
        const x =
          plotLeft +
          (col / Math.max(1, graph.columns.length - 1)) *
            (plotRight - plotLeft);
        addInk(
          `caption:${caption}`,
          textBox(
            x,
            captionY,
            metrics.width,
            metrics.top,
            metrics.bottom,
            "center",
            "middle",
          ),
          bounds,
        );
      });
    }

    const contentWidth = Math.max(1, bounds.maxX - bounds.minX);
    const contentHeight = Math.max(1, bounds.maxY - bounds.minY);
    viewFit = Math.min(
      1,
      (width - FRAME_PAD * 2) / contentWidth,
      (height - FRAME_PAD * 2) / contentHeight,
    );
    viewX = (width - contentWidth * viewFit) / 2 - bounds.minX * viewFit;
    viewY = (height - contentHeight * viewFit) / 2 - bounds.minY * viewFit;
    for (const target of [ctx, bgCtx, fgCtx]) setViewTransform(target);

    if (
      typeof process !== "undefined" &&
      process.env.NODE_ENV !== "production"
    ) {
      const offenders = inkItems
        .map(({ name, box }) => ({ name, box }))
        .filter(({ box }) => {
          const left = box.minX * viewFit + viewX;
          const right = box.maxX * viewFit + viewX;
          const top = box.minY * viewFit + viewY;
          const bottom = box.maxY * viewFit + viewY;
          return (
            left < FRAME_PAD - 1 ||
            top < FRAME_PAD - 1 ||
            right > width - FRAME_PAD + 1 ||
            bottom > height - FRAME_PAD + 1
          );
        });
      if (offenders.length) {
        console.warn("pipeline: ink outside frame padding", offenders);
      }
    }

    particles.length = 0;
    accumulators.clear();
    pulses.clear();
    rebuildStatic();
    drawFrame(0);
  }

  function reachableChain(routeId: string) {
    const route = routeById.get(routeId);
    if (!route) return { nodes: new Set<string>(), edges: new Set<string>() };
    const nodeIds = new Set(route.path);
    const edgeKeys = new Set<string>();
    for (let i = 0; i < route.path.length - 1; i += 1) {
      edgeKeys.add(`${route.path[i]}>${route.path[i + 1]}`);
    }
    const queue = [route.path[route.path.length - 1]];
    for (let step = 0; step < 5 && queue.length; step += 1) {
      const next: string[] = [];
      for (const id of queue) {
        for (const continuation of graph.continuations[id] ?? []) {
          edgeKeys.add(`${id}>${continuation.to}`);
          nodeIds.add(continuation.to);
          if (!next.includes(continuation.to)) next.push(continuation.to);
        }
      }
      queue.splice(0, queue.length, ...next);
    }
    return { nodes: nodeIds, edges: edgeKeys };
  }

  function laneHighlight(lane: HighlightLane): Highlight {
    const nodes = new Set<string>();
    const edgeKeys = new Set<string>();
    const routes = new Set<string>();

    if (lane === "debug") {
      for (const edge of edges.values()) {
        if (!edge.loop) continue;
        edgeKeys.add(edge.key);
        nodes.add(edge.a);
        nodes.add(edge.b);
      }
      return { nodes, edges: edgeKeys, routes };
    }

    for (const route of graph.routes) {
      if (route.lane !== lane) continue;
      routes.add(route.id);
      const chain = reachableChain(route.id);
      chain.nodes.forEach((id) => nodes.add(id));
      chain.edges.forEach((key) => edgeKeys.add(key));
    }
    return { nodes, edges: edgeKeys, routes };
  }

  function loopIsHovered(loop: Loop) {
    if (hoverLoopId === loop.id) return true;
    if (!selection || selection.kind !== "node") return false;
    return (
      loopIds(loop).includes(selection.id) ||
      (loop.to ? loop.to === selection.id : false) ||
      (loop.toIds ?? []).includes(selection.id)
    );
  }

  function computeHighlight(): Highlight | null {
    const active: Selection | null =
      selection ?? (hoverId ? { kind: "node", id: hoverId } : null);
    if (!active) return null;

    if (active.kind === "lane") return laneHighlight(active.lane);

    const nodes = new Set<string>();
    const edgeKeys = new Set<string>();
    const routes = new Set<string>();

    if (active.kind === "node") {
      nodes.add(active.id);
      for (const route of graph.routes) {
        const chain = reachableChain(route.id);
        if (chain.nodes.has(active.id)) {
          routes.add(route.id);
          chain.nodes.forEach((id) => nodes.add(id));
          chain.edges.forEach((key) => edgeKeys.add(key));
        }
      }
    } else {
      for (const id of active.ids ?? [active.id]) {
        routes.add(id);
        const chain = reachableChain(id);
        chain.nodes.forEach((item) => nodes.add(item));
        chain.edges.forEach((key) => edgeKeys.add(key));
      }
    }

    // Debug arcs only light up through their toggle or legend; other loops,
    // such as the review cycle, light up when their endpoints or arc are hovered.
    for (const loop of graph.loops) {
      if (loop.id === "debug" || !loopIsHovered(loop)) continue;
      const loopEdges = [...edges.values()].filter(
        (edge) => edge.loop?.id === loop.id,
      );
      if (!loopEdges.length) continue;
      loopEdges.forEach((edge) => {
        edgeKeys.add(edge.key);
        nodes.add(edge.a);
        nodes.add(edge.b);
      });
    }
    return { nodes, edges: edgeKeys, routes };
  }

  function debugLaneActive() {
    return selection?.kind === "lane" && selection.lane === "debug";
  }

  function debugRelevant() {
    const active: Selection | null =
      selection ?? (hoverId ? { kind: "node", id: hoverId } : null);
    if (!active) return true;
    if (active.kind === "lane") return active.lane === "debug";
    const debugIds = new Set<string>();
    for (const loop of graph.loops) {
      if (loop.id !== "debug") continue;
      loopIds(loop).forEach((id) => debugIds.add(id));
      (loop.toIds ?? (loop.to ? [loop.to] : [])).forEach((id) =>
        debugIds.add(id),
      );
    }
    if (active.kind === "node") return debugIds.has(active.id);
    return (active.ids ?? [active.id]).some((id) => debugIds.has(id));
  }

  function loopAppearance(loop: Loop, highlight: Highlight | null) {
    if (loop.id === "debug") {
      const active = debugVisible || debugLaneActive();
      const opacity = active
        ? 0.9
        : !selection && !hoverId
          ? 0.14
          : debugRelevant()
            ? 0.3
            : 0;
      return {
        opacity,
        labelAlpha: active ? 0.95 : opacity > 0 ? 0.55 : 0,
        arrowSize: 6,
        lineWidth: active ? 1.5 : 1,
      };
    }
    const active = Boolean(
      highlight &&
      [...highlight.edges].some((key) => key.startsWith(`loop:${loop.id}:`)),
    );
    return {
      opacity: active ? 1 : 0.6,
      labelAlpha: active ? 1 : 0.9,
      arrowSize: 8,
      lineWidth: 1.5,
    };
  }

  function colorFor(edge: Edge): string {
    if (edge.color) return theme.colors[edge.color];
    if (edge.lane === "llvm") return theme.colors.blue;
    if (edge.lane === "runtime") return theme.colors.sage;
    return theme.colors.ink;
  }

  function haloText(
    target: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    alpha: number,
    weight: 500 | 600 = 500,
  ) {
    target.save();
    target.globalAlpha = alpha;
    target.font = `${weight} ${LABEL_SIZE}px ${theme.labelFont}`;
    target.lineJoin = "round";
    target.lineWidth = 4;
    target.strokeStyle = theme.colors.bgRaised;
    target.textAlign = "center";
    target.textBaseline = "middle";
    target.strokeText(text, x, y);
    target.fillStyle = theme.colors.ink;
    target.fillText(text, x, y);
    target.restore();
  }

  function drawLoopLabel(edge: Edge, text: string, alpha: number) {
    if (alpha <= 0) return;
    const point = loopLabelPoint(edge);
    const y = loopLabelY(edge, point);
    fgCtx.save();
    fgCtx.globalAlpha = alpha;
    fgCtx.font = `600 ${LABEL_SIZE}px ${theme.labelFont}`;
    fgCtx.textAlign = "center";
    fgCtx.textBaseline = "middle";
    fgCtx.lineJoin = "round";
    fgCtx.lineWidth = 4;
    fgCtx.strokeStyle = theme.colors.bgRaised;
    fgCtx.strokeText(text, point.x, y);
    fgCtx.fillStyle = theme.colors.red;
    fgCtx.fillText(text, point.x, y);
    fgCtx.restore();
  }

  function drawLoopArrow(edge: Edge, alpha: number, size: number) {
    if (alpha <= 0) return;
    const tip = pointAt(edge, 0.96);
    const before = pointAt(edge, 0.9);
    const angle = Math.atan2(tip.y - before.y, tip.x - before.x);
    bgCtx.save();
    bgCtx.globalAlpha = alpha;
    bgCtx.fillStyle = colorFor(edge);
    bgCtx.translate(tip.x, tip.y);
    bgCtx.rotate(angle);
    bgCtx.beginPath();
    bgCtx.moveTo(0, 0);
    bgCtx.lineTo(-size, size * 0.55);
    bgCtx.lineTo(-size, -size * 0.55);
    bgCtx.closePath();
    bgCtx.fill();
    bgCtx.restore();
  }

  function strokeEdge(
    edge: Edge,
    alpha: number,
    lineWidth: number,
    dashed: boolean,
    dim = false,
  ) {
    if (alpha <= 0) return;
    bgCtx.save();
    bgCtx.globalAlpha = alpha;
    bgCtx.filter = dim ? "saturate(0.4)" : "none";
    bgCtx.strokeStyle = colorFor(edge);
    bgCtx.lineWidth = lineWidth;
    bgCtx.lineCap = dashed ? "round" : "butt";
    if (dashed) bgCtx.setLineDash([4, 4]);
    bgCtx.beginPath();
    bgCtx.moveTo(edge.points[0].x, edge.points[0].y);
    for (let i = 1; i < edge.points.length; i += 1) {
      bgCtx.lineTo(edge.points[i].x, edge.points[i].y);
    }
    bgCtx.stroke();
    bgCtx.restore();
  }

  function rebuildStatic() {
    if (!width || !height) return;
    const highlight = computeHighlight();
    clearLayer(bgCtx);
    clearLayer(fgCtx);

    if (graph.columns.length) {
      bgCtx.save();
      bgCtx.fillStyle = theme.colors.gray;
      bgCtx.font = `500 ${LABEL_SIZE}px ${theme.labelFont}`;
      bgCtx.textBaseline = "middle";
      bgCtx.letterSpacing = "1px";
      graph.columns.forEach((caption, col) => {
        bgCtx.textAlign = "center";
        bgCtx.fillText(
          caption,
          plotLeft +
            (col / Math.max(1, graph.columns.length - 1)) *
              (plotRight - plotLeft),
          captionY,
        );
      });
      bgCtx.restore();
    }

    // Regular paths first, then loops, so an arc can never hide a node or label.
    for (const edge of edges.values()) {
      if (edge.loop) continue;
      const base =
        edge.lane === "llvm" ? 0.35 : edge.lane === "runtime" ? 0.55 : 0.3;
      const dim = Boolean(highlight && !highlight.edges.has(edge.key));
      strokeEdge(
        edge,
        base * (dim ? 0.35 : 1),
        1,
        edge.lane === "runtime",
        dim,
      );
    }

    for (const edge of edges.values()) {
      if (!edge.loop) continue;
      const look = loopAppearance(edge.loop, highlight);
      strokeEdge(edge, look.opacity, look.lineWidth, true);
      drawLoopArrow(edge, look.opacity, look.arrowSize);
    }

    for (const [key, tools] of Object.entries(graph.edgeTools)) {
      const edge = edges.get(key);
      if (!edge) continue;
      const relevant =
        highlight &&
        (highlight.edges.has(key) ||
          highlight.nodes.has(edge.a) ||
          highlight.nodes.has(edge.b));
      if (!relevant) continue;
      const point = pointAt(edge, 0.5);
      const normal = normalAt(edge);
      const side = key === "c>clang" ? -1 : key === "cpp>clang" ? 1 : -1;
      fgCtx.save();
      fgCtx.globalAlpha = 0.85;
      fgCtx.strokeStyle = theme.colors.gray;
      fgCtx.lineWidth = 1;
      fgCtx.beginPath();
      fgCtx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      fgCtx.stroke();
      fgCtx.restore();
      haloText(
        fgCtx,
        tools.join(" · "),
        point.x + normal.x * 12 * side,
        point.y + normal.y * 12 * side,
        0.95,
      );
    }

    const labelledLoops = new Set<string>();
    for (const edge of edges.values()) {
      if (!edge.loop || labelledLoops.has(edge.loop.id)) continue;
      labelledLoops.add(edge.loop.id);
      drawLoopLabel(
        edge,
        edge.loop.label,
        loopAppearance(edge.loop, highlight).labelAlpha,
      );
    }

    for (const node of layoutNodes.values()) {
      const dim = Boolean(highlight && !highlight.nodes.has(node.id));
      const active = Boolean(highlight) && !dim;
      const alpha = dim ? 0.35 : 1;
      const isRuntime = node.color === "sage";
      fgCtx.save();
      fgCtx.globalAlpha = alpha;
      fgCtx.filter = dim ? "saturate(0.4)" : "none";
      fgCtx.fillStyle = isRuntime
        ? theme.colors.runtimeSoft
        : theme.colors[node.color];
      fgCtx.beginPath();
      fgCtx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      fgCtx.fill();
      if (isRuntime || active) {
        fgCtx.strokeStyle = isRuntime
          ? theme.colors.sage
          : theme.colors[node.color];
        fgCtx.lineWidth = isRuntime ? 1.5 : 2;
        fgCtx.stroke();
      }
      fgCtx.restore();

      const placement = labelPlacement(node, node.label);
      fgCtx.save();
      fgCtx.globalAlpha = dim ? 0.55 : 1;
      fgCtx.filter = dim ? "saturate(0.4)" : "none";
      fgCtx.font = `${active ? 600 : 500} ${LABEL_SIZE}px ${theme.labelFont}`;
      fgCtx.lineJoin = "round";
      fgCtx.lineWidth = 4;
      fgCtx.strokeStyle = theme.colors.bgRaised;
      fgCtx.textAlign = placement.align;
      fgCtx.textBaseline = placement.baseline;
      fgCtx.strokeText(node.label, placement.x, placement.y);
      fgCtx.fillStyle = theme.colors.ink;
      fgCtx.fillText(node.label, placement.x, placement.y);
      fgCtx.restore();
    }
  }

  function particleColor(particle: Particle): string {
    if (particle.edge.color) return theme.colors[particle.edge.color];
    if (particle.edge.lane === "llvm") return theme.colors.blue;
    if (particle.edge.lane === "runtime") return theme.colors.sage;
    return theme.colors.ink;
  }

  function drawFrame(dt: number) {
    const highlight = computeHighlight();
    const debugActive = debugVisible || debugLaneActive();
    compositeBackground();

    if (dt > 0) {
      for (const particle of particles) {
        particle.alpha = Math.min(1, particle.alpha + dt * 3);
        if (particle.fading) particle.alpha -= dt * 2.6;
      }
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        if (particles[i].alpha <= 0 || particles[i].t > 1.05)
          particles.splice(i, 1);
      }
    }

    for (const particle of particles) {
      if (particle.edge.color === "red" && !debugActive) continue;
      const point = pointAt(particle.edge, particle.t);
      const selected = highlight
        ? highlight.routes.has(particle.routeId)
        : true;
      ctx.save();
      ctx.globalAlpha = clamp(particle.alpha * (selected ? 1 : 0.12), 0, 1);
      ctx.fillStyle = particleColor(particle);
      ctx.beginPath();
      ctx.arc(point.x, point.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const [id, elapsed] of pulses) {
      const node = layoutNodes.get(id);
      if (!node || elapsed <= 0) continue;
      const progress = elapsed / 0.4;
      const radius = node.radius * (1 + 0.12 * Math.sin(progress * Math.PI));
      ctx.save();
      ctx.globalAlpha = (1 - progress) * 0.5;
      ctx.strokeStyle = theme.colors[node.color];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    compositeForeground();
  }

  function chooseContinuation(id: string): string | null {
    const options = graph.continuations[id] ?? [];
    if (!options.length) return null;
    const total = options.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const option of options) {
      roll -= option.weight;
      if (roll <= 0) return option.to;
    }
    return options[options.length - 1].to;
  }

  function loopFor(nodeId: string): Loop | undefined {
    return graph.loops.find((loop) => loopIds(loop).includes(nodeId));
  }

  function loopEdgeFor(loop: Loop, nodeId: string) {
    return edges.get(`loop:${loop.id}:${nodeId}`);
  }

  function advance(particle: Particle, dt: number) {
    particle.t += (dt * particle.speed) / particle.edge.total;
    if (particle.t < 1) return;

    const arrived = particle.edge.b;
    pulses.set(arrived, 0.4);

    if (particle.edge.loop) {
      const loop = particle.edge.loop;
      if (!loop.resume) {
        particle.fading = true;
        return;
      }
      const route = routeById.get(particle.routeId);
      const index = route?.path.indexOf(loop.to ?? "") ?? -1;
      if (route && index >= 0 && index + 1 < route.path.length) {
        const next = edges.get(`${loop.to}>${route.path[index + 1]}`);
        if (next) {
          particle.edge = next;
          particle.t = 0;
          particle.loopCount += 1;
          return;
        }
      }
      particle.fading = true;
      return;
    }

    const loop = loopFor(arrived);
    if (loop && particle.loopCount < 4) {
      const chance =
        loop.chance * Math.pow(loop.decay ?? 0.5, particle.loopCount);
      const edge = loopEdgeFor(loop, arrived);
      if (edge && Math.random() < chance) {
        particle.edge = edge;
        particle.t = 0;
        particle.loopCount += 1;
        return;
      }
    }

    const next = chooseContinuation(arrived);
    const edge = next ? edges.get(`${arrived}>${next}`) : undefined;
    if (edge) {
      particle.edge = edge;
      particle.t = 0;
    } else {
      particle.fading = true;
    }
  }

  function spawn(routeId: string) {
    if (particles.length >= 60) return;
    const route = routeById.get(routeId);
    if (!route || route.path.length < 2) return;
    const edge = edges.get(`${route.path[0]}>${route.path[1]}`);
    if (!edge) return;
    particles.push({
      routeId,
      edge,
      t: 0,
      speed: 110 + Math.random() * 40,
      size: (2 + Math.random() * 0.5) * clamp(scale, 0.8, 1),
      alpha: 0,
      loopCount: 0,
      fading: false,
    });
  }

  function tick(time: number) {
    if (destroyed || paused || opts.reducedMotion) return;
    const dt = Math.min((time - lastTime) / 1000 || 0, 0.05);
    lastTime = time;

    // The kernel strip has no flowing particles; stray stationary dots read as
    // artifacts. Its review cycle is carried by the arc and arrow instead.
    if (graph.columns.length) {
      for (const route of graph.routes) {
        const rate = route.weight * 0.6;
        let acc = (accumulators.get(route.id) ?? 0) + dt * rate;
        if (acc >= 1) {
          spawn(route.id);
          acc -= 1;
        }
        accumulators.set(route.id, acc);
      }
    }

    for (const particle of particles) advance(particle, dt);
    for (const [id, elapsed] of pulses) {
      const next = elapsed - dt;
      if (next <= 0) pulses.delete(id);
      else pulses.set(id, next);
    }

    drawFrame(dt);
    raf = requestAnimationFrame(tick);
  }

  function hitTest(point: Point) {
    let foundNode: LayoutNode | null = null;
    let best = Infinity;
    for (const node of layoutNodes.values()) {
      const distance = Math.hypot(node.x - point.x, node.y - point.y);
      if (distance <= node.radius + 6 && distance < best) {
        foundNode = node;
        best = distance;
      }
    }
    if (foundNode) return { node: foundNode, loopId: null as string | null };

    for (const edge of edges.values()) {
      if (!edge.loop) continue;
      for (let i = 0; i < edge.points.length - 1; i += 1) {
        const a = edge.points[i];
        const b = edge.points[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const lengthSq = dx * dx + dy * dy || 1;
        const t = clamp(
          ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq,
          0,
          1,
        );
        const distance = Math.hypot(
          point.x - (a.x + dx * t),
          point.y - (a.y + dy * t),
        );
        if (distance <= 8) {
          return { node: null, loopId: edge.loop.id };
        }
      }
    }
    return { node: null, loopId: null as string | null };
  }

  function localPoint(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    return toLayout({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  const onMove = (event: MouseEvent) => {
    const point = localPoint(event);
    const hit = hitTest(point);
    const id = hit.node?.id ?? null;
    if (id !== hoverId || hit.loopId !== hoverLoopId) {
      hoverId = id;
      hoverLoopId = hit.loopId;
      rebuildStatic();
      if (opts.reducedMotion || paused) drawFrame(0);
    }
    canvas.style.cursor = hit.node || hit.loopId ? "pointer" : "default";
    opts.onHover(id, hit.node ? toCssRect(hit.node) : null);
  };

  const onLeave = () => {
    if (hoverId || hoverLoopId) {
      hoverId = null;
      hoverLoopId = null;
      rebuildStatic();
      if (opts.reducedMotion || paused) drawFrame(0);
    }
    canvas.style.cursor = "default";
    opts.onHover(null, null);
  };

  const onClick = (event: MouseEvent) => {
    const point = localPoint(event);
    const hit = hitTest(point);
    opts.onPin(hit.node ? { kind: "node", id: hit.node.id } : null);
  };

  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("mouseleave", onLeave);
  canvas.addEventListener("click", onClick);

  document.fonts?.ready.then(() => {
    if (destroyed) return;
    theme = readTheme();
    layout();
  });

  layout();
  if (!opts.reducedMotion) raf = requestAnimationFrame(tick);

  return {
    resize() {
      if (destroyed) return;
      layout();
    },
    setSelection(next: Selection | null) {
      if (destroyed) return;
      selection = next;
      rebuildStatic();
      if (opts.reducedMotion || paused) drawFrame(0);
    },
    setDebugVisible(next: boolean) {
      if (destroyed || next === debugVisible) return;
      debugVisible = next;
      rebuildStatic();
      if (opts.reducedMotion || paused) drawFrame(0);
    },
    setPaused(next: boolean) {
      if (destroyed || opts.reducedMotion || next === paused) return;
      paused = next;
      if (paused) {
        cancelAnimationFrame(raf);
      } else {
        lastTime = performance.now();
        raf = requestAnimationFrame(tick);
      }
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("click", onClick);
      particles.length = 0;
      pulses.clear();
      accumulators.clear();
    },
  };
}
