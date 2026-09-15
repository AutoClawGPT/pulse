"use client";

import { fmtPnl, fmtPct, shortMint } from "@/lib/format";
import type { OddsFill, PulsePosition } from "@/lib/types";

export function BottomStrip({
  fills,
  positions,
  liqs,
}: {
  fills: OddsFill[];
  positions: PulsePosition[];
  liqs: { id: string; ts: number; marketId: string; owner: string; pnl: number }[];
}) {
  const openPx = positions.filter((p) => p.status === "open");
  return (
    <footer className="grid grid-cols-3 gap-px bg-[var(--line)] text-[11px]" aria-label="PnL strip">
      <div className="bg-[var(--bg)] overflow-auto px-3 py-2">
        <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">fills</div>
        {fills.slice(0, 4).map((f) => (
          <div key={f.id} className="flex justify-between">
            <span>
              {f.kind} {f.buyYes ? "YES" : "NO"} {shortMint(f.marketId, 2)}
            </span>
            <span>{fmtPct(f.implied)}</span>
          </div>
        ))}
        {fills.length === 0 ? <div className="text-[var(--muted)]">no fills</div> : null}
      </div>
      <div className="bg-[var(--bg)] overflow-auto px-3 py-2">
        <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">pulse</div>
        {openPx.slice(0, 4).map((p) => (
          <div key={p.id} className="flex justify-between">
            <span>
              {p.long ? "LONG" : "SHORT"} {shortMint(p.marketId, 2)}
            </span>
            <span className={p.pnl < 0 ? "text-[var(--hazard)]" : ""}>{fmtPnl(p.pnl)}</span>
          </div>
        ))}
        {openPx.length === 0 ? <div className="text-[var(--muted)]">no open pulse</div> : null}
      </div>
      <div className="bg-[var(--bg)] overflow-auto px-3 py-2">
        <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">liqs / resolve</div>
        {liqs.slice(0, 4).map((l) => (
          <div key={l.id} className="hazard-row -mx-3 px-3">
            LIQ {shortMint(l.owner, 3)} {fmtPnl(l.pnl)}
          </div>
        ))}
        {liqs.length === 0 ? <div className="text-[var(--muted)]">no liquidations</div> : null}
      </div>
    </footer>
  );
}
