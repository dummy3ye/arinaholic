import type { ReactNode } from "react";
import { Shapes } from "@/components/decor/Shapes";
import type { RouteKey } from "@/lib/navigation/routes";

// Decorative circles are only shown on the home and contact pages.
const shapeRoutes = new Set<RouteKey>(["home", "contact"]);

export function PageShell({
  route,
  children,
}: {
  route: RouteKey;
  children: ReactNode;
}) {
  return (
    <>
      {shapeRoutes.has(route) ? <Shapes route={route} /> : null}
      <main>{children}</main>
    </>
  );
}
