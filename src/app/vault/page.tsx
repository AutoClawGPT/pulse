"use client";

import { Chrome } from "@/components/Chrome";
import { useSession } from "@/components/providers";
import { postOp, usePulse } from "@/hooks/use-pulse";
import { fmtPnl } from "@/lib/format";

export default function VaultPage() {
  const { address } = useSession();
  const owner = address ?? "paper-desk";
  const { data, refresh } = usePulse();
  const open = (data?.positions ?? []).filter((p) => p.owner === owner && p.status === "open");
  const locked = open.reduce((a, p) => a + p.margin, 0);

  async function bump(op: "deposit" | "withdraw") {
    await postOp({ op, owner, amount: 1 });
    await refresh();
  }

  return (
    <Chrome>
      <div className="page-body p-6 max-w-2xl">
        <h1 className="font-[family-name:var(--font-display)] text-5xl uppercase">Vault</h1>
        <p className="mt-2 text-[var(--muted)]">One vault for ODDS and PULSE. Paper credit until on-chain deploy.</p>
        <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-[var(--line)] pt-4">
          <dt className="text-[var(--muted)]">Owner</dt>
          <dd className="break-all">{owner}</dd>
          <dt className="text-[var(--muted)]">Open pulse margin</dt>
          <dd>{locked.toFixed(3)} SOL</dd>
          <dt className="text-[var(--muted)]">Open positions</dt>
          <dd>{open.length}</dd>
        </dl>
        <div className="mt-6 flex gap-2">
          <button className="btn" type="button" onClick={() => void bump("deposit")}>
            deposit 1 SOL
          </button>
          <button className="btn" type="button" onClick={() => void bump("withdraw")}>
            withdraw 1 SOL
          </button>
        </div>
        <h2 className="mt-10 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">open pulse</h2>
        {open.length === 0 ? (
          <p className="mt-2 text-[var(--muted)]">No open Pulse tickets.</p>
        ) : (
          open.map((p) => (
            <div key={p.id} className="mt-2 flex justify-between border-b border-[var(--line)] py-2">
              <span>
                {p.long ? "LONG" : "SHORT"} {p.size}
              </span>
              <span className={p.pnl < 0 ? "text-[var(--hazard)]" : ""}>{fmtPnl(p.pnl)}</span>
            </div>
          ))
        )}
      </div>
    </Chrome>
  );
}
