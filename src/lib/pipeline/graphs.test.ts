import { describe, expect, it } from "vitest";
import {
  chipGroups,
  compileGraph,
  describeNode,
  describeRoutes,
  kernelGraph,
} from "@/lib/pipeline/graphs";

describe("pipeline graphs", () => {
  it("derives every route edge from real nodes", () => {
    for (const graph of [compileGraph, kernelGraph]) {
      const ids = new Set(graph.nodes.map((node) => node.id));
      for (const route of graph.routes) {
        for (const id of route.path) expect(ids.has(id)).toBe(true);
      }
      for (const [from, options] of Object.entries(graph.continuations)) {
        expect(ids.has(from)).toBe(true);
        for (const option of options) expect(ids.has(option.to)).toBe(true);
      }
    }
  });

  it("routes interpreted languages around llvm", () => {
    for (const route of compileGraph.routes) {
      if (route.lane === "runtime") expect(route.path).not.toContain("llvm");
    }
    expect(compileGraph.routes.find((route) => route.id === "go")?.lane).toBe(
      "native",
    );
  });

  it("describes a compiled route with its alternate backends", () => {
    const text = describeRoutes(compileGraph, ["rust"]);
    expect(text).toContain("rust");
    expect(text).toContain("rustc");
    expect(text).toContain("llvm ir");
    expect(text).toContain("x86-64 / aarch64 / cortex-m");
  });

  it("groups the two typescript routes under one chip", () => {
    const groups = chipGroups(compileGraph);
    expect(groups.map((group) => group.label)).toEqual([
      "c",
      "c++",
      "rust",
      "go",
      "python",
      "typescript",
      "javascript",
      "shell",
    ]);
    expect(groups.find((group) => group.label === "typescript")?.ids).toEqual([
      "ts-vite",
      "ts-next",
    ]);
  });

  it("describes nodes and keeps the review loop in the kernel graph", () => {
    expect(describeNode(compileGraph, "llvm")).toContain(
      "the middle of everything",
    );
    expect(kernelGraph.columns).toEqual([]);
    expect(kernelGraph.loops[0]).toMatchObject({
      from: "list",
      to: "patch",
      side: "top",
      resume: true,
    });
  });
});
