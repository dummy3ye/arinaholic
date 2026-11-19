import type { RouteKey } from "@/lib/navigation/routes";

export function Shapes({ route }: { route: RouteKey }) {
  return (
    <div className="shapes" data-route={route} aria-hidden="true">
      <div className="shape blue" />
      <div className="shape red" />
      <div className="shape sage" />
    </div>
  );
}
