import type { Graph, HighlightLane } from "./types";

// TODO(user): confirm the radius weights — these are a first guess at how much
// each language is actually used. Raise/lower `r` to change particle frequency.
export const compileGraph: Graph = {
  columns: ["source", "toolchain", "ir", "backend", "machine"],
  // Rows are explicit so the engine can use one even pitch. 0-3 are the
  // compiled group; 4-8 are the interpreted group (with a wider gap at 4).
  nodes: [
    {
      id: "c",
      label: "c",
      kind: "lang",
      col: 0,
      row: 0,
      y: 0,
      r: 32,
      color: "blue",
      note: "the one i trust most",
    },
    {
      id: "cpp",
      label: "c++",
      kind: "lang",
      col: 0,
      row: 1,
      y: 0.119,
      r: 28,
      color: "blue",
      note: "simulations, opengl",
    },
    {
      id: "rust",
      label: "rust",
      kind: "lang",
      col: 0,
      row: 2,
      y: 0.238,
      r: 28,
      color: "blue",
      note: "cli, tui tools",
    },
    {
      id: "go",
      label: "go",
      kind: "lang",
      col: 0,
      row: 3,
      y: 0.357,
      r: 20,
      color: "ink",
    },
    {
      id: "python",
      label: "python",
      kind: "lang",
      col: 0,
      row: 4,
      y: 0.524,
      r: 24,
      color: "sage",
    },
    {
      id: "ts",
      label: "typescript",
      short: "ts",
      kind: "lang",
      col: 0,
      row: 5,
      y: 0.643,
      r: 28,
      color: "sage",
    },
    {
      id: "js",
      label: "javascript",
      short: "js",
      kind: "lang",
      col: 0,
      row: 6,
      y: 0.762,
      r: 22,
      color: "sage",
    },
    {
      id: "shell",
      label: "shell",
      kind: "lang",
      col: 0,
      row: 7,
      y: 0.881,
      r: 24,
      color: "sage",
      note: "fish, sh",
    },
    {
      id: "clang",
      label: "clang",
      kind: "tool",
      col: 1,
      row: 0,
      y: 0,
      r: 22,
      color: "blue",
      note: "my preferred c and c++ compiler",
    },
    {
      id: "rustc",
      label: "rustc",
      kind: "tool",
      col: 1,
      row: 2,
      y: 0.238,
      r: 18,
      color: "blue",
    },
    {
      id: "gc",
      label: "gc",
      kind: "tool",
      col: 1,
      row: 3,
      y: 0.357,
      r: 16,
      color: "ink",
      note: "go's own compiler, no llvm",
    },
    {
      id: "cpython",
      label: "cpython",
      kind: "tool",
      col: 1,
      row: 4,
      y: 0.524,
      r: 18,
      color: "sage",
    },
    {
      id: "vite",
      label: "vite",
      kind: "tool",
      col: 1,
      row: 5,
      y: 0.643,
      r: 12,
      color: "sage",
    },
    {
      id: "bun",
      label: "bun",
      kind: "tool",
      col: 1,
      row: 6,
      y: 0.762,
      r: 18,
      color: "sage",
      note: "runtime, bundler, package manager",
    },
    {
      id: "next",
      label: "next.js",
      kind: "tool",
      col: 1,
      row: 7,
      y: 0.881,
      r: 14,
      color: "sage",
    },
    {
      id: "sh",
      label: "sh / fish",
      short: "sh",
      kind: "tool",
      col: 1,
      row: 8,
      y: 1,
      r: 16,
      color: "sage",
    },
    {
      id: "llvm",
      label: "llvm ir",
      kind: "ir",
      col: 2,
      row: 2,
      y: 0.238,
      r: 40,
      color: "blue",
      note: "the middle of everything",
    },
    {
      id: "x86",
      label: "x86-64",
      short: "x86",
      kind: "backend",
      col: 3,
      row: 0,
      y: 0,
      r: 16,
      color: "blue",
    },
    // TODO(user): confirm the aarch64 and embedded targets.
    {
      id: "arm64",
      label: "aarch64",
      short: "arm",
      kind: "backend",
      col: 3,
      row: 2,
      y: 0.238,
      r: 16,
      color: "blue",
    },
    {
      id: "cm",
      label: "cortex-m",
      short: "cm",
      kind: "backend",
      col: 3,
      row: 3,
      y: 0.357,
      r: 16,
      color: "blue",
    },
    {
      id: "arch",
      label: "archlinux",
      short: "arch",
      kind: "target",
      col: 4,
      row: 0,
      y: 0,
      r: 30,
      color: "ink",
      note: "daily driver",
    },
    {
      id: "ubuntu",
      label: "ubuntu",
      kind: "target",
      col: 4,
      row: 3,
      y: 0.357,
      r: 26,
      color: "ink",
    },
    {
      id: "win",
      label: "win11",
      kind: "target",
      col: 4,
      row: 6,
      y: 0.762,
      r: 26,
      color: "ink",
      note: "wsl, visual studio, embedded toolchains",
    },
    {
      id: "bare",
      label: "bare metal",
      short: "bare",
      kind: "target",
      col: 4,
      row: 8,
      y: 1,
      r: 22,
      color: "ink",
    },
  ],
  routes: [
    {
      id: "c",
      label: "c",
      lane: "llvm",
      weight: 5,
      path: ["c", "clang", "llvm"],
      chipLabel: "c",
    },
    {
      id: "cpp",
      label: "c++",
      lane: "llvm",
      weight: 4,
      path: ["cpp", "clang", "llvm"],
      chipLabel: "c++",
    },
    {
      id: "rust",
      label: "rust",
      lane: "llvm",
      weight: 4,
      path: ["rust", "rustc", "llvm"],
      chipLabel: "rust",
    },
    {
      id: "go",
      label: "go",
      lane: "native",
      weight: 2,
      path: ["go", "gc", "x86"],
      chipLabel: "go",
    },
    {
      id: "python",
      label: "python",
      lane: "runtime",
      weight: 3,
      path: ["python", "cpython"],
      chipLabel: "python",
    },
    {
      id: "ts-vite",
      label: "typescript via vite",
      lane: "runtime",
      weight: 2,
      path: ["ts", "vite", "bun"],
      chipLabel: "typescript",
    },
    {
      id: "ts-next",
      label: "typescript via next.js",
      lane: "runtime",
      weight: 2,
      path: ["ts", "next", "bun"],
      chipLabel: "typescript",
    },
    {
      id: "js",
      label: "javascript",
      lane: "runtime",
      weight: 3,
      path: ["js", "bun"],
      chipLabel: "javascript",
    },
    {
      id: "shell",
      label: "shell",
      lane: "runtime",
      weight: 3,
      path: ["shell", "sh"],
      chipLabel: "shell",
    },
  ],
  continuations: {
    llvm: [
      { to: "x86", weight: 5 },
      { to: "arm64", weight: 2 },
      { to: "cm", weight: 2 },
    ],
    x86: [
      { to: "arch", weight: 5 },
      { to: "ubuntu", weight: 3 },
      { to: "win", weight: 3 },
    ],
    arm64: [
      { to: "ubuntu", weight: 2 },
      { to: "arch", weight: 1 },
    ],
    cm: [{ to: "bare", weight: 1 }],
    cpython: [
      { to: "arch", weight: 3 },
      { to: "ubuntu", weight: 2 },
      { to: "win", weight: 1 },
    ],
    bun: [
      { to: "arch", weight: 3 },
      { to: "ubuntu", weight: 2 },
      { to: "win", weight: 2 },
    ],
    sh: [
      { to: "arch", weight: 4 },
      { to: "ubuntu", weight: 2 },
    ],
  },
  edgeTools: {
    "c>clang": ["make", "cmake"],
    "cpp>clang": ["cmake", "ninja"],
    "rust>rustc": ["cargo"],
  },
  loops: [
    {
      id: "debug",
      label: "gdb · lldb",
      fromIds: ["c", "cpp", "rust"],
      toIds: ["arch", "ubuntu", "bare"],
      side: "bottom",
      color: "red",
      chance: 0.18,
      resume: false,
    },
  ],
};

// TODO(user): confirm whether the kernel builds use LLVM=1 (clang). If they do,
// add a `clang` marker on the patch>qemu edge in edgeTools.
export const kernelGraph: Graph = {
  columns: [],
  nodes: [
    {
      id: "patch",
      label: "patch",
      kind: "stage",
      col: 0,
      y: 0.42,
      r: 18,
      color: "ink",
      note: "small fixes: wifi, media, staging drivers",
    },
    {
      id: "qemu",
      label: "qemu",
      kind: "tool",
      col: 1,
      y: 0.58,
      r: 16,
      color: "ink",
      note: "boot it in a vm (virtme-ng)",
    },
    {
      id: "ksft",
      label: "kselftest",
      short: "ksft",
      kind: "tool",
      col: 2,
      y: 0.42,
      r: 16,
      color: "ink",
    },
    {
      id: "b4",
      label: "b4",
      kind: "tool",
      col: 3,
      y: 0.58,
      r: 16,
      color: "ink",
      note: "prep the series, cover letter, versions",
    },
    {
      id: "send",
      label: "git send-email",
      short: "send",
      kind: "tool",
      col: 4,
      y: 0.42,
      r: 16,
      color: "ink",
    },
    {
      id: "list",
      label: "mailing list",
      short: "list",
      kind: "stage",
      col: 5,
      y: 0.58,
      r: 18,
      color: "ink",
      note: "everything is public on the list",
    },
    {
      id: "next",
      label: "linux-next",
      short: "next",
      kind: "stage",
      col: 6,
      y: 0.42,
      r: 16,
      color: "blue",
    },
    {
      id: "main",
      label: "mainline",
      short: "main",
      kind: "stage",
      col: 7,
      y: 0.58,
      r: 18,
      color: "blue",
    },
    {
      id: "stable",
      label: "stable",
      kind: "stage",
      col: 8,
      y: 0.42,
      r: 20,
      color: "blue",
    },
  ],
  routes: [
    {
      id: "kernel",
      label: "kernel patch loop",
      lane: "native",
      weight: 3,
      path: [
        "patch",
        "qemu",
        "ksft",
        "b4",
        "send",
        "list",
        "next",
        "main",
        "stable",
      ],
    },
  ],
  continuations: {},
  edgeTools: {},
  loops: [
    {
      id: "review",
      label: "v2, v3 …",
      from: "list",
      to: "patch",
      side: "top",
      color: "red",
      chance: 0.35,
      resume: true,
      decay: 0.5,
    },
  ],
};

const labelOf = (graph: Graph, id: string) =>
  graph.nodes.find((node) => node.id === id)?.label ?? id;

/** Plain-language description of a route, including its alternative endings. */
export function describeRoutes(graph: Graph, ids: string[]): string {
  const routes = graph.routes.filter((item) => ids.includes(item.id));
  if (routes.length === 0) return "";
  if (routes.length > 1) {
    return [
      ...new Set(routes.map((route) => describeRoutes(graph, [route.id]))),
    ].join(" · ");
  }

  const route = routes[0];
  const parts = route.path.map((id) => labelOf(graph, id));
  const seen = new Set(route.path);
  let frontier = [route.path[route.path.length - 1]];

  for (let depth = 0; depth < 3; depth += 1) {
    const labels: string[] = [];
    const next: string[] = [];
    for (const id of frontier) {
      for (const continuation of graph.continuations[id] ?? []) {
        if (seen.has(continuation.to)) continue;
        seen.add(continuation.to);
        labels.push(labelOf(graph, continuation.to));
        next.push(continuation.to);
      }
    }
    if (labels.length === 0) break;
    parts.push([...new Set(labels)].join(" / "));
    frontier = next;
  }

  return parts.join(" → ");
}

export function describeNode(graph: Graph, id: string): string {
  const node = graph.nodes.find((item) => item.id === id);
  if (!node) return "";
  const routes = graph.routes.filter((route) => route.path.includes(id)).length;
  const tail = node.note
    ? ` — ${node.note}`
    : routes
      ? ` — ${routes} route${routes === 1 ? "" : "s"}`
      : "";
  return `${node.label}${tail}`;
}

export function chipGroups(graph: Graph): { label: string; ids: string[] }[] {
  const groups: { label: string; ids: string[] }[] = [];
  for (const route of graph.routes) {
    if (!route.chipLabel) continue;
    const existing = groups.find((group) => group.label === route.chipLabel);
    if (existing) existing.ids.push(route.id);
    else groups.push({ label: route.chipLabel, ids: [route.id] });
  }
  return groups;
}

export function describeLane(lane: HighlightLane): string {
  switch (lane) {
    case "llvm":
      return "through llvm — c, c++ and rust, compiled before the backends";
    case "native":
      return "own native compiler — go skips llvm and targets x86 directly";
    case "runtime":
      return "runtime or interpreter — python, typescript, javascript and shell";
    case "debug":
      return "the debug loop — gdb and lldb carry bugs from the machine back to source";
  }
}
