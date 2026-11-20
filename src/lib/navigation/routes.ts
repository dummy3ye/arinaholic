export type RouteKey =
  | "home"
  | "works"
  | "research"
  | "kernel"
  | "setup"
  | "contact";

export type Route = {
  key: RouteKey;
  path: string;
  label: string;
  title: string;
};

export const routes: Route[] = [
  { key: "home", path: "/", label: "home", title: "sagittarius" },
  { key: "works", path: "/works", label: "works", title: "works" },
  { key: "kernel", path: "/works/kernel", label: "kernel", title: "kernel" },
  { key: "research", path: "/research", label: "research", title: "research" },
  { key: "setup", path: "/setup", label: "setup", title: "setup" },
  { key: "contact", path: "/contact", label: "contact", title: "contact" },
];

// Kernel is nested under works, not shown in the top-level nav.
export const navRoutes = routes.filter(
  (route) => route.key !== "home" && route.key !== "kernel",
);
