# Setup Page: Implementation Guide

Instructions for the coding agent. Read the whole document before writing code. This builds on `RESEARCH_SECTION_GUIDE.md`, so follow the same ground rules (Bun, Next.js app router, TypeScript, SCSS, reuse existing tokens, no UI libraries).

## 0. Goal

Rebuild `/setup` as the most memorable page on arinaholic.me: **a compile pipeline drawn on a 2D canvas, with particles flowing through it.**

- Languages (circles, sized by how much they are used) flow through the real toolchain (`clang`, `rustc`, `llvm ir`, …) into backends, then into the machines they run on (`archlinux`, `ubuntu`, `win11`, bare metal).
- Interpreted languages bypass LLVM and run directly on the targets. This is drawn **honestly** with dashed lines.
- A red dashed **debug loop** (`gdb · lldb`) carries bugs backwards from the machines to the source.
- A second, smaller strip below shows the **kernel patch loop**, from patch to `stable`.
- Hover or tap anything and every route through it lights up while the rest dims.

The look is the site's existing language: cream background, flat circles in blue, sage, red and ink, 1px lines, small lowercase text, **no gradients, no glow, no shadows**.

## 1. Hard constraints

- **2D canvas only.** No WebGL, no three.js, no canvas/animation libraries. Zero new dependencies.
- The engine is plain TypeScript with no React inside it. React only mounts the canvas and forwards state.
- 60fps on a mid-range laptop. Frame work stays under about 4ms (cap particles, cache the static layer).
- The page must be **fully usable without the canvas**: server-rendered text, keyboard access, and reduced-motion support (section 9).
- Do not restyle other pages.

## 2. Step zero: read the existing code

1. Find the color, font, and spacing tokens. A canvas cannot read SCSS variables, so check that the tokens exist as **CSS custom properties** on `:root`. If they only exist as SCSS variables, add a small `:root { --c-cream: …; --c-ink: …; --c-blue: …; --c-sage: …; --c-red: …; --c-gray: …; }` bridge from the same SCSS values. Do not duplicate the hex values by hand.
2. Find the existing `/setup` page and reuse its copy if any is worth keeping (arch with hyprland, kitty, fish and neovim).
3. Find the huge lowercase page-title component used on `/works` and `/research` and reuse it for `setup.`.

## 3. Files

```
app/setup/
  page.tsx                  (server: header, canvas mounts, legend sections)
  setup.module.scss
components/setup/
  PipelineView.tsx          ("use client": canvas, tooltip, route chips, live region)
  PipelineLoader.tsx        ("use client": next/dynamic wrapper, ssr: false)
  Legend.tsx                (server: the 3-column details list, doubles as no-JS fallback)
lib/pipeline/
  types.ts
  graphs.ts                 (compileGraph, kernelGraph: ALL content lives here)
  engine.ts                 (layout, edges, particles, draw, hit test; no React)
  theme.ts                  (reads CSS custom props + font from computed style)
```

Adapt names to repo conventions if they differ.

## 4. Page layout (`/setup`)

Top to bottom, all inside the standard content container:

1. **Header:** huge `setup.` and one intro line in the usual intro style, for example `from source to silicon. hover anything.` (placeholder copy, user will edit).
2. **Pipeline canvas** (the hero), full content width.
   - Desktop: height `clamp(520px, 46vw, 720px)`.
   - Directly above it, a 1px divider with the **column captions** (`source`, `toolchain`, `ir`, `backend`, `machine`) in small gray lowercase, each centered on its column's x. These are drawn in the canvas, so they align exactly.
3. **Legend row** under the canvas (HTML, small gray text), four items with tiny 10px glyphs: solid blue dot = `through llvm`, solid ink dot = `own native compiler`, dashed sage = `runtime or interpreter`, dashed red = `debug loop`.
4. **Route chips and live text** (section 8.4).
5. **`kernel loop.`** as an h2 in the same style as `summary` headings on article pages, one intro line, then the **second canvas** (same engine, `kernelGraph`), height about 260px desktop.
6. **The details:** a 3-column text list (like the home page's works / kernel / setup columns). Section 10.

Do **not** add the page-edge decoration circles on this page. The canvas is the decoration.

## 5. Data model (`lib/pipeline/types.ts`)

Content is defined as **routes** (paths through nodes). Edges are **derived** from routes, so the author never draws an edge by hand.

```ts
export type Lane = "llvm" | "native" | "runtime";        // sets edge style + particle color
export type Color = "blue" | "sage" | "ink" | "red" | "cream";
export type Kind = "lang" | "tool" | "ir" | "backend" | "target" | "stage";

export type PNode = {
  id: string;
  label: string;
  short?: string;          // used on small screens
  kind: Kind;
  col: number;             // column index (0..columns.length-1)
  y: number;               // 0..1 inside the plot area
  r: number;               // radius in px at a 1440px-wide canvas
  color: Color;
  note?: string;           // tooltip text, lowercase, one line
  href?: string;           // optional: tooltip shows an underlined link
};

export type Route = {
  id: string;
  label: string;
  lane: Lane;
  weight: number;          // particle spawn rate multiplier
  path: string[];          // node ids, first is the spawn node
};

export type Continuation = { to: string; weight: number };

export type Loop = {
  id: string;
  label: string;           // drawn on the arc, e.g. "gdb · lldb"
  from: string | number;   // node id, or column index meaning "any terminal in that column"
  to: string;              // node id
  side: "top" | "bottom";
  color: Color;
  chance: number;          // probability a particle arriving at `from` takes the loop
  resume: boolean;         // true: re-enter its route at `to`; false: fade out at `to`
  decay?: number;          // multiply chance by this on each repeat (default 0.5)
};

export type Graph = {
  columns: string[];                                   // captions, in order
  nodes: PNode[];
  routes: Route[];
  continuations: Record<string, Continuation[]>;       // when a path ends at X, pick one and continue
  edgeTools: Record<string, string[]>;                 // "c>clang": ["make","cmake"] → small ring markers on that edge
  loops: Loop[];
  vertical?: never;                                    // orientation is decided at runtime, not in data
};
```

Rules the engine must follow:

- A particle spawns at `route.path[0]` with probability proportional to `route.weight × node.r` and follows `path`.
- If it ends at a node that has `continuations`, it picks one by weight and keeps going until it reaches a node with none (a terminal), where it fades out.
- On arriving at any node with a loop whose `from` matches, it rolls `chance` for that loop.
- Edge styles: if any route using an edge has lane `llvm`, the edge is solid, blue-tinted. Otherwise `native` gives solid ink, and `runtime` gives dashed sage (`setLineDash([4, 6])`).

## 6. Compile graph content (`compileGraph`)

Columns: `source`, `toolchain`, `ir`, `backend`, `machine`.

**Everything below marked `TODO(user)` is a guess. Keep the structure, but mark guesses with a `// TODO(user): confirm` comment in the code.**

### 6.1 Nodes

| id | label | col | y | r | color | note |
|---|---|---|---|---|---|---|
| c | c | 0 | .06 | 32 | blue | the one i trust most |
| cpp | c++ | 0 | .17 | 28 | blue | simulations, opengl |
| rust | rust | 0 | .28 | 28 | blue | cli, tui tools |
| go | go | 0 | .42 | 20 | ink | |
| python | python | 0 | .58 | 24 | sage | |
| ts | typescript | 0 | .70 | 28 | sage | |
| js | javascript | 0 | .80 | 22 | sage | |
| shell | shell | 0 | .92 | 24 | sage | fish, sh |
| clang | clang | 1 | .12 | 22 | blue | my preferred c and c++ compiler |
| rustc | rustc | 1 | .28 | 18 | blue | |
| gc | gc | 1 | .42 | 16 | ink | go's own compiler, no llvm |
| cpython | cpython | 1 | .58 | 18 | sage | |
| vite | vite | 1 | .66 | 12 | sage | |
| bun | bun | 1 | .75 | 18 | sage | runtime, bundler, package manager |
| next | next.js | 1 | .84 | 14 | sage | |
| sh | sh / fish | 1 | .92 | 16 | sage | |
| llvm | llvm ir | 2 | .20 | 40 | blue | the middle of everything |
| x86 | x86-64 | 3 | .16 | 16 | blue | |
| arm64 | aarch64 | 3 | .32 | 16 | blue | TODO(user) |
| cm | cortex-m | 3 | .50 | 16 | blue | TODO(user): confirm embedded targets |
| arch | archlinux | 4 | .14 | 30 | ink | daily driver |
| ubuntu | ubuntu | 4 | .36 | 26 | ink | |
| win | win11 | 4 | .58 | 26 | ink | wsl, visual studio, embedded toolchains |
| bare | bare metal | 4 | .80 | 22 | ink | microcontrollers |

Language radius `r` here is an initial guess at "how much I use it". It lives in data so the user can tune it. Use a `weight` of `1..5` per language if the agent prefers computing `r = 12 + weight * 4`.

### 6.2 Routes

| id | lane | weight | path |
|---|---|---|---|
| c | llvm | 5 | c → clang → llvm → (x86 or arm64 or cm, via continuations) |
| cpp | llvm | 4 | cpp → clang → llvm → … |
| rust | llvm | 4 | rust → rustc → llvm → … |
| go | native | 2 | go → gc → x86 |
| python | runtime | 3 | python → cpython |
| ts-vite | runtime | 2 | ts → vite → bun |
| ts-next | runtime | 2 | ts → next → bun |
| js | runtime | 3 | js → bun |
| shell | runtime | 3 | shell → sh |

### 6.3 Continuations

```ts
continuations: {
  llvm:    [{ to: "x86", weight: 5 }, { to: "arm64", weight: 2 }, { to: "cm", weight: 2 }],
  x86:     [{ to: "arch", weight: 5 }, { to: "ubuntu", weight: 3 }, { to: "win", weight: 3 }],
  arm64:   [{ to: "ubuntu", weight: 2 }, { to: "arch", weight: 1 }],
  cm:      [{ to: "bare", weight: 1 }],
  cpython: [{ to: "arch", weight: 3 }, { to: "ubuntu", weight: 2 }, { to: "win", weight: 1 }],
  bun:     [{ to: "arch", weight: 3 }, { to: "ubuntu", weight: 2 }, { to: "win", weight: 2 }],
  sh:      [{ to: "arch", weight: 4 }, { to: "ubuntu", weight: 2 }],
},
```

### 6.4 Build tool markers

Tiny 5px rings placed at the midpoint of an edge, with a small gray label beside them:

```ts
edgeTools: {
  "c>clang":      ["make", "cmake"],
  "cpp>clang":    ["cmake", "ninja"],
  "rust>rustc":   ["cargo"],
},
```

### 6.5 Debug loop

```ts
loops: [{
  id: "debug", label: "gdb · lldb", from: 4, to: "c", side: "bottom",
  color: "red", chance: 0.18, resume: false,
}],
```

Red particles travel **right to left** along an arc under the whole diagram, from the machine column back to the source column, labeled `gdb · lldb`. This echoes the home page: coffee, terminals and debugging.

## 7. Kernel graph content (`kernelGraph`)

Single row, orientation horizontal, with each stage in its own column. Alternate `y` values (.42 / .58) so the row waves slightly instead of sitting rigid. `columns` captions can be empty or omitted for this strip.

| id | label | note |
|---|---|---|
| patch | patch | small fixes: wifi, media, staging drivers |
| qemu | qemu | boot it in a vm (virtme-ng) |
| ksft | kselftest | |
| b4 | b4 | prep the series, cover letter, versions |
| send | git send-email | |
| list | mailing list | everything is public on the list |
| next | linux-next | |
| main | mainline | |
| stable | stable | backports |

One route: `patch → qemu → ksft → b4 → send → list → next → main → stable`, lane `native`, weight 3.

Review loop:

```ts
loops: [{
  id: "review", label: "v2, v3 …", from: "list", to: "patch", side: "top",
  color: "red", chance: 0.35, resume: true, decay: 0.5,
}],
```

So some patches bounce back on a top arc from `mailing list` to `patch` and go around again, with a lower chance each time. It shows real kernel review in motion.

`// TODO(user): confirm whether kernel builds use LLVM=1 (clang). If yes, add a small `clang` ring marker on the patch>qemu edge via edgeTools.`

## 8. Engine (`lib/pipeline/engine.ts`)

The engine is a class or closure with this surface:

```ts
export function createPipeline(canvas: HTMLCanvasElement, graph: Graph, opts: {
  onHover(nodeId: string | null, rect: DOMRect | null): void;
  onPin(selection: Selection | null): void;
  reducedMotion: boolean;
}): {
  resize(): void;
  setSelection(sel: Selection | null): void;   // programmatic (chips, Esc)
  setPaused(p: boolean): void;
  destroy(): void;
};
type Selection = { kind: "node" | "route"; id: string };
```

### 8.1 Layout

- `x = padX + col × (W − 2·padX) / (columns − 1)`, with `padX ≈ max(56, W × 0.06)`.
- `y = padTop + node.y × plotH`, where `padTop` leaves room for the column captions + divider, and `plotH` leaves room for the bottom loop arc.
- Node radius scales by `clamp(W / 1440, 0.6, 1)`.
- **Orientation:** if `W < 760`, switch to **vertical**: swap axes (columns become rows top → bottom, `y` becomes x). On vertical, labels are drawn only for nodes on the active route or hovered node, and use `short` when present. Otherwise the labels would collide.
- Labels: canvas text at 13px (11px for tool markers), weight 500, lowercase. Language and target labels go **beside** the node (left of source circles, right of targets), and the other labels go under the node.

### 8.2 Edges

- Build the union of consecutive pairs in each route `path` and each continuation, deduped by `"a>b"`.
- Draw each as a cubic bezier with horizontal tangents (control points at `x ± dx × 0.5`), 1px, color = `--c-gray` at 0.35 alpha.
- Pre-sample each curve into about 64 points with cumulative lengths, so a particle at parameter `t` maps to a position by a cheap lookup.
- The loop arcs use the same sampler (a big shallow arc above or below the plot, with short risers).

### 8.3 Particles and drawing

- Typed arrays or a pooled array of particles. **Cap: 220 desktop, 90 mobile.**
- Particle: `{ route, pathIndex, edge, t, speed, size, alpha, loopCount }`. Speed is a constant px/s along the edge (about 70 to 110, small random variation), converted to `dt/len`.
- Spawn from a time accumulator per route (rate ∝ weight), with the delta time capped at 50ms.
- Size 2.5 to 4px × scale. Fade alpha in over the first 8% of its first edge and out at the last edge.
- On arriving at a node: trigger a **pulse** on that node (radius × 1.0 → 1.12 and back over 400ms, ease-out). Keep it subtle.
- Draw order: captions and divider, edges, edge-tool markers, **particles**, nodes, labels, loop arcs and labels.
- **Cache the static layer** (captions, edges, nodes, labels) into an offscreen canvas. Rebuild it only when the canvas size or selection changes. Each frame: `drawImage(static)` → draw particles → draw pulses.
- Pixel ratio: `Math.min(devicePixelRatio, 2)`. Set `canvas.width/height` to CSS size × ratio and `ctx.setTransform(ratio,0,0,ratio,0,0)`. Offset 1px lines by 0.5px so they stay crisp.
- No `shadowBlur`, no gradients, no `globalCompositeOperation` tricks.
- Wait for `document.fonts.ready` before the first static draw, and redraw when it resolves, so the canvas text uses the site's font. Take the family from `getComputedStyle(document.body).fontFamily`.

### 8.4 Interaction

State: `idle → hover(node) → pinned(node | route)`.

- **Hover** (mouse): nearest node within `r + 6px`. Cursor becomes `pointer`.
- **Click or tap:** pins the node. Clicking empty canvas, or pressing `Esc`, clears it.
- **Highlight set:** for a node, every route whose path (or continuation chain) includes it. For a route, its path plus all reachable continuation edges.
  - Edges, particles and nodes in the set render normally.
  - Everything else drops to **alpha 0.12** (nodes 0.35, so labels stay readable).
  - Rebuild the static layer on change (it is cheap).
- **Tooltip:** one small HTML element (not canvas text), absolutely positioned near the node. It shows the label in bold, the `note` in gray, and an underlined link if `href` exists. It must stay within the canvas bounds. It is not shown on touch devices (the live text below replaces it).
- **Route chips** (HTML, under the canvas): one small pill button per language route (`c`, `c++`, `rust`, `go`, `python`, `typescript`, `javascript`, `shell`), same pill style as the research page's `download the pdf` button. Clicking selects that route (same as pinning). The selected chip gets the active style.
- **Live text** under the chips, `aria-live="polite"`: the selected route described in plain words, for example
  `rust → cargo → rustc → llvm ir → x86-64 / aarch64 / cortex-m → archlinux / ubuntu / win11 / bare metal`.
  Generate it from the data with a `describeRoute()` helper, joining alternate continuations with ` / `. When nothing is selected, show a quiet hint line: `hover a node, or pick a language.`
- **Mobile tour:** on vertical (mobile) orientation, if nothing is pinned, auto-select route after route every 3.5s (looping) so the page shows its logic without hover. Stop the tour as soon as the user taps anything. Never run the tour on desktop and never when reduced motion is on.

## 9. Performance, accessibility, fallbacks

- `<canvas aria-hidden="true">` inside a `<figure role="img" aria-label="diagram of my toolchain, from source languages through compilers to operating systems">` with a visually hidden `<figcaption>` that says the live text exists.
- Everything the canvas shows is also available as server-rendered text in the legend section and as the route chips. A keyboard user can Tab to the chips and operate the whole interaction without the canvas.
- Chips and all interactive controls have the site's visible blue focus ring.
- **Reduced motion** (`prefers-reduced-motion: reduce`): no animation loop. Draw one static frame with particles placed at seeded pseudo-random positions along their edges, and redraw only on resize and selection. Hover and selection still work (instant, no pulses).
- **Pause** the loop when the canvas is off screen (`IntersectionObserver`) and when `document.hidden`. Resume on return.
- Use `ResizeObserver` on the container (debounced to rAF) for resize.
- Clean up everything in `destroy()` (rAF, observers, listeners). It must survive React strict mode's double mount.
- The page JS for `/setup` should stay small (target under about 25KB gzipped on top of the framework). Do not ship the engine to other routes: load it via `next/dynamic` with `ssr: false` inside the client wrapper `PipelineLoader`.
- While loading, reserve the canvas's height (no layout shift), with a thin 1px outline of the area and nothing else.

## 10. The details section (server-rendered)

Below the kernel strip: a 3-column grid (stacks to 1 column under 900px) styled like the three columns on the home page: lowercase heading, gray text, underlined links. Six blocks:

1. **languages:** c, c++, rust, go, typescript, javascript, python, shell. Underlined link: `and a few more on github`.
2. **compilers and build:** clang and llvm first, then rustc, gc, cmake, ninja, make, cargo.
3. **debug and kernel:** gdb, lldb. For the kernel: qemu, virtme-ng, kselftest, b4, git send-email. Works from mainline, linux-next and stable.
4. **runtimes:** bun, next.js, vite.
5. **systems:** arch (hyprland, kitty, fish, neovim with my own config), ubuntu, win11 (wsl, visual studio for game and graphics dev, embedded toolchains).
6. **hardware:** `TODO(user): laptop or desktop, cpu, gpu, boards`.

Keep the copy short and lowercase, and keep every block as real text so it is indexable and works with no JS.

## 11. Order of work

1. Read the repo (section 2), add the CSS custom property bridge if missing.
2. `types.ts`, `graphs.ts`, with both graphs fully populated.
3. `theme.ts`, then `engine.ts` with layout and the static layer only (no particles). Verify the picture.GOoddnight
4. Add edges and tool markers, then particles and pulses.
5. Add hover, pinning, tooltip, route chips, live text.
6. Add loops (debug arc and review arc).
7. Vertical layout, the mobile tour, reduced motion, pausing.
8. Server-rendered legend and details, the page header, the wrapper and loader.
9. Polish: spacing, label collisions, focus styles.

## 12. Acceptance checklist

- [ ] `/setup` shows `setup.`, the canvas under a 1px divider with the five column captions, the legend row, the chips and the live text.
- [ ] Particles flow along every route, and the three lanes look different (solid blue, solid ink, dashed sage).
- [ ] Go and the interpreted languages visibly **bypass** `llvm ir`.
- [ ] Red particles run along the bottom arc labeled `gdb · lldb`.
- [ ] Hovering `llvm ir` lights up c, c++ and rust routes and dims all the others. Hovering `win11` lights every route that can end there.
- [ ] Clicking pins, and clicking empty space or pressing `Esc` clears. Chips do the same and update the live text.
- [ ] The kernel strip loops some patches back through the top arc and lets the rest reach `stable`.
- [ ] Text on the canvas uses the site's font and is crisp at DPR 1, 2 and 3. 1px lines are not blurry.
- [ ] Under 760px the layout goes vertical, labels show only for the active route, and the tour runs until the first tap.
- [ ] `prefers-reduced-motion` gives a still frame, with selection still working.
- [ ] The animation pauses off screen and in hidden tabs. There are no leaks after navigating away and back, and no strict-mode double loops.
- [ ] With JS disabled, the header, legend and details still render.
- [ ] No new dependencies. Build, lint and typecheck pass. No `any`.
- [ ] Nothing visible changed on other pages.

## 13. Out of scope

WebGL or shaders, sound, drag-and-drop of nodes, physics, a settings panel, dark mode (unless the site already has it), and any dependency.

## 14. When unsure

Prefer the site's existing patterns, fewer lines, and fewer dependencies. If something here conflicts with the repo, choose the smallest sensible option and leave a one-line `// NOTE:` comment. When finished, report: files created or changed, any deviations, and every `TODO(user)` the user needs to fill in (language weights, embedded targets, kernel build flags, hardware, tooltip notes, intro copy).
