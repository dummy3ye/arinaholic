"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navRoutes } from "@/lib/navigation/routes";

export function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main">
      {navRoutes.map((route) => {
        const isActive =
          route.path === "/"
            ? pathname === route.path
            : pathname === route.path || pathname.startsWith(`${route.path}/`);
        return (
          <Link
            key={route.path}
            href={route.path}
            aria-current={isActive ? "page" : undefined}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}
