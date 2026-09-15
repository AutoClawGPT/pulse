"use client";

import { Chrome } from "@/components/Chrome";
import { usePulse } from "@/hooks/use-pulse";
import { fmtPnl, shortMint } from "@/lib/format";

export default function BoardPage() {
  const { data } = usePulse();
  const rows = data?.leaderboard ?? [];
  return (
    <Chrome>
      <div className="page-body p-6">
        <h1 className="font-[family-name:var(--font-display)] text-5xl uppercase">HUMAN vs AGENT</h1>
        <p className="mt-2 text-[var(--muted)]">PULSE.AGENT.01 trades ODDS only. Humans sign in the browser.</p>
        <div className="mt-8 max-w-xl">
          <div className="row text-[9px] text-[var(--muted)] uppercase" style={{ gridTemplateColumns: "80px 1fr 80px 80px" }}>
            <span>kind</span>
            <span>id</span>
            <span>trades</span>
            <span>pnl</span>
          </div>
          {rows.length === 0 ? (
            <p className="p-4 text-[var(--muted)]">No fills yet. Open the pit.</p>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="row" style={{ gridTemplateColumns: "80px 1fr 80px 80px" }}>
                <span className={r.kind === "AGENT" ? "text-[var(--hazard)]" : ""}>{r.kind}</span>
                <span className="truncate">{shortMint(r.label, 6)}</span>
                <span>{r.trades}</span>
                <span>{fmtPnl(r.pnl)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </Chrome>
  );
}
