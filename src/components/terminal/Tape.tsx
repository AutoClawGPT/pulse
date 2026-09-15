"use client";

import { ageSec, fmtAge, fmtMc, fmtPct, shortMint } from "@/lib/format";
import type { Market, TapeEvent } from "@/lib/types";

export function Tape({
  tape,
  markets,
  solUsd,
  selected,
  onSelect,
}: {
  tape: TapeEvent[];
  markets: Market[];
  solUsd: number;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const byMint = new Map<string, Market[]>();
  for (const m of markets) {
    if (!m.mint) continue;
    const arr = byMint.get(m.mint) ?? [];
    arr.push(m);
    byMint.set(m.mint, arr);
  }

  const creates = tape.filter((t) => t.action === "create" || t.action === "migrate");
  const rows = creates.length ? creates : tape;

  return (
    <section className="panel" aria-label="Live tape">
      <div className="panel-h">
        <span>[ live tape ]</span>
        <span>{rows.length} prints</span>
      </div>
      <div className="overflow-auto flex-1" role="table" aria-label="Token tape">
        <div
          className="row text-[9px] text-[var(--muted)] uppercase tracking-[0.14em]"
          role="row"
        >
          <span>age</span>
          <span>token</span>
          <span>mc</span>
          <span>mkt</span>
          <span>yes</span>
        </div>
        {rows.length === 0 ? (
          <p className="p-4 text-[var(--muted)]" role="status">
            Waiting on pumpapi stream. New creates land here.
          </p>
        ) : (
          rows.slice(0, 80).map((ev, i) => {
            const mkts = ev.mint ? byMint.get(ev.mint) : undefined;
            const primary = mkts?.[0];
            const fresh = ageSec(ev.ts) < 8;
            return (
              <button
                key={ev.id}
                type="button"
                className="row w-full text-left"
                data-fresh={fresh}
                data-active={primary?.id === selected}
                onClick={() => primary && onSelect(primary.id)}
              >
                <span className="text-[var(--muted)]">{fmtAge(ageSec(ev.ts))}</span>
                <span className="min-w-0">
                  <span className="block truncate uppercase">{ev.symbol ?? "???"}</span>
                  <span className="block truncate text-[9px] text-[var(--muted)]">
                    {shortMint(ev.mint)} {ev.action}
                  </span>
                </span>
                <span>{fmtMc(ev.mcSol, solUsd)}</span>
                <span className={primary ? "text-[var(--ink)]" : "text-[var(--muted)]"}>
                  {primary ? primary.template.replaceAll("_", " ").slice(0, 8) : "—"}
                </span>
                <span className={i === 0 ? "text-[var(--hazard)]" : ""}>
                  {primary ? fmtPct(primary.implied) : "—"}
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
