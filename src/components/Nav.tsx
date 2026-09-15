"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "PIT" },
  { href: "/live", label: "LIVE" },
  { href: "/markets", label: "MARKETS" },
  { href: "/vault", label: "VAULT" },
  { href: "/board", label: "BOARD" },
  { href: "/phoenix", label: "PHOENIX" },
  { href: "/agents", label: "AGENTS" },
  { href: "/roll", label: "ROLL" },
  { href: "/skill.md", label: "SKILL.md" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav
      className="flex items-stretch gap-px overflow-x-auto border-b border-[var(--line)] bg-[var(--line)]"
      aria-label="PULSE tabs"
    >
      {TABS.map((t) => {
        const on = t.href === "/" ? path === "/" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className="shrink-0 px-4 py-2 text-[10px] uppercase tracking-[0.16em]"
            style={{
              background: on ? "#0a0a0a" : "#121212",
              color: on ? "#eaeaea" : "#8c8c8c",
              borderBottom: on ? "2px solid #e61919" : "2px solid transparent",
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
