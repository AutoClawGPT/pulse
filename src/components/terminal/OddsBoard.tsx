"use client";

import { fmtCountdown, fmtOdds, fmtPct } from "@/lib/format";
import type { Market } from "@/lib/types";

export function OddsBoard({
  market,
  onBuy,
  busy,
}: {
  market: Market | null;
  onBuy: (buyYes: boolean) => void;
  busy: boolean;
}) {
  if (!market) {
    return (
      <section className="flex flex-1 flex-col p-6" aria-label="Odds">
        <h2 className="font-[family-name:var(--font-display)] text-5xl uppercase leading-[0.9] tracking-[-0.05em]">
          Select a print
        </h2>
        <p className="mt-4 max-w-[42ch] text-[var(--muted)]">
          Left tape is live pump.fun. Click a row to load YES/NO depth and a Pulse ticket.
        </p>
      </section>
    );
  }

  const yes = market.implied;
  const no = 1 - yes;
  const remain = Math.max(0, market.expiry - Date.now());
  const hazard = remain < 60_000 && market.status === "open";

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label="Odds depth">
      <div className="panel-h">
        <span>[ odds / {market.template} ]</span>
        <span className={hazard ? "text-[var(--hazard)]" : ""}>
          {market.status === "open" ? fmtCountdown(market.expiry) : market.status}
        </span>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          {market.symbol} · {market.resolveType}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(28px,5vw,64px)] uppercase leading-[0.88] tracking-[-0.05em]">
          {market.question}
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-px bg-[var(--line)]">
          <div className="bg-[var(--bg)] p-4">
            <div className="text-[10px] text-[var(--muted)]">YES</div>
            <div className="font-[family-name:var(--font-display)] text-5xl leading-none">
              {fmtPct(yes)}
            </div>
            <div className="mt-1 text-[10px] text-[var(--muted)]">{fmtOdds(yes)}</div>
            <div
              className="mt-3 h-2 bg-[var(--line)]"
              aria-hidden
            >
              <div
                className="h-2 bg-[var(--hazard)]"
                style={{ width: `${Math.round(yes * 100)}%` }}
              />
            </div>
            <button
              className="btn btn-hazard mt-4 w-full"
              type="button"
              disabled={busy || market.status !== "open"}
              onClick={() => onBuy(true)}
            >
              Buy YES
            </button>
          </div>
          <div className="bg-[var(--bg)] p-4">
            <div className="text-[10px] text-[var(--muted)]">NO</div>
            <div className="font-[family-name:var(--font-display)] text-5xl leading-none">
              {fmtPct(no)}
            </div>
            <div className="mt-1 text-[10px] text-[var(--muted)]">{fmtOdds(no)}</div>
            <div className="mt-3 h-2 bg-[var(--line)]" aria-hidden>
              <div
                className="h-2 bg-[var(--ink)]"
                style={{ width: `${Math.round(no * 100)}%` }}
              />
            </div>
            <button
              className="btn mt-4 w-full"
              type="button"
              disabled={busy || market.status !== "open"}
              onClick={() => onBuy(false)}
            >
              Buy NO
            </button>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
          <dt className="text-[var(--muted)]">YES reserve</dt>
          <dd>{market.yesReserve.toFixed(2)}</dd>
          <dt className="text-[var(--muted)]">NO reserve</dt>
          <dd>{market.noReserve.toFixed(2)}</dd>
          <dt className="text-[var(--muted)]">Strike</dt>
          <dd>
            {market.resolveType === "PythGte"
              ? `SOL ${market.strike.toFixed(2)}`
              : `$${market.strike.toLocaleString()}`}
          </dd>
          {market.claimedHash ? (
            <>
              <dt className="text-[var(--muted)]">Oracle hash</dt>
              <dd>{market.claimedHash}</dd>
            </>
          ) : null}
        </dl>
      </div>
    </section>
  );
}
