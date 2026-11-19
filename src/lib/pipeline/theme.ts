import type { Color } from "./types";

export type Theme = {
  colors: Record<Color, string> & {
    gray: string;
    inkBody: string;
    lineStrong: string;
    bgRaised: string;
    runtimeSoft: string;
  };
  labelFont: string;
};

// Canvas cannot read SCSS variables, and some site tokens use color-mix(), so
// resolve each custom property through a throwaway element's computed color.
function resolveColor(value: string): string {
  if (!value) return "#000000";
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.color = value;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color || value;
  probe.remove();
  return resolved;
}

export function readTheme(): Theme {
  const root = getComputedStyle(document.documentElement);
  const get = (name: string) => root.getPropertyValue(name).trim();

  return {
    colors: {
      cream: resolveColor(get("--c-cream") || get("--bg")),
      ink: resolveColor(get("--c-ink") || get("--ink")),
      blue: resolveColor(get("--c-blue") || get("--llvm") || get("--blue")),
      sage: resolveColor(get("--c-sage") || get("--runtime")),
      red: resolveColor(get("--c-red") || get("--debug") || get("--red")),
      gray: resolveColor(get("--c-gray") || get("--muted")),
      inkBody: resolveColor(get("--c-ink-body") || get("--ink-body")),
      lineStrong: resolveColor(get("--c-line-strong") || get("--line-strong")),
      bgRaised: resolveColor(get("--c-bg-raised") || get("--bg-raised")),
      runtimeSoft: resolveColor(
        get("--c-runtime-soft") || get("--runtime-soft"),
      ),
    },
    labelFont: getComputedStyle(document.body).fontFamily || "sans-serif",
  };
}
