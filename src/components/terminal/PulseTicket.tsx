"use client";

import { useState } from "react";
import type { Market } from "@/lib/types";

export function PulseTicket({
  market,
  onOpen,
  busy,
}: {
  market: Market | null;
  onOpen: (long: boolean, size: number, margin: number) => void;
  busy: boolean;
}) {
  const [size, setSize] = useState("1");
  const [margin, setMargin] = useState("0.2");
  const disabled = !market || market.status !== "open" || busy;

  return (
    <form
      className="border-t border-[var(--line)] p-3"
      aria-label="Pulse ticket"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
        <span>[ pulse ticket ]</span>
        <span>maint 10%</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase text-[var(--muted)]">Size (SOL)</span>
          <input
            inputMode="decimal"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            aria-label="Pulse size in SOL"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase text-[var(--muted)]">Margin</span>
          <input
            inputMode="decimal"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            aria-label="Pulse margin in SOL"
          />
        </label>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          className="btn btn-hazard"
          type="button"
          disabled={disabled}
          onClick={() => onOpen(true, Number(size), Number(margin))}
        >
          Long odds
        </button>
        <button
          className="btn"
          type="button"
          disabled={disabled}
          onClick={() => onOpen(false, Number(size), Number(margin))}
        >
          Short odds
        </button>
      </div>
    </form>
  );
}
