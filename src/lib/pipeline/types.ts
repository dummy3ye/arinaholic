export type Lane = "llvm" | "native" | "runtime";
export type HighlightLane = Lane | "debug";
export type Color = "blue" | "sage" | "ink" | "red" | "cream";
type Kind = "lang" | "tool" | "ir" | "backend" | "target" | "stage";

type PNode = {
  id: string;
  label: string;
  short?: string;
  kind: Kind;
  col: number;
  /** Row index within the source column; used for even vertical rhythm. */
  row?: number;
  y: number;
  r: number;
  color: Color;
  note?: string;
  href?: string;
};

type Route = {
  id: string;
  label: string;
  lane: Lane;
  weight: number;
  path: string[];
  // One chip per language; the two typescript routes share a chip.
  chipLabel?: string;
};

type Continuation = { to: string; weight: number };

export type Loop = {
  id: string;
  label: string;
  from?: string | number;
  fromIds?: string[];
  to?: string;
  toIds?: string[];
  side: "top" | "bottom";
  color: Color;
  chance: number;
  resume: boolean;
  decay?: number;
};

export type Graph = {
  columns: string[];
  nodes: PNode[];
  routes: Route[];
  continuations: Record<string, Continuation[]>;
  edgeTools: Record<string, string[]>;
  loops: Loop[];
};

export type Selection =
  | { kind: "node"; id: string }
  | { kind: "route"; id: string; ids?: string[] }
  | { kind: "lane"; lane: HighlightLane };
