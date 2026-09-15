"use client";

import { useState } from "react";
import { fmtPnl, shortMint } from "@/lib/format";
import type { LeaderboardRow, PitMessage, VaultAccount } from "@/lib/types";

export function Pit({
  pit,
  leaderboard,
  vault,
  onChat,
  onDeposit,
}: {
  pit: PitMessage[];
  leaderboard: LeaderboardRow[];
  vault: VaultAccount | null;
  onChat: (text: string) => void;
  onDeposit: (n: number) => void;
}) {
  const [text, setText] = useState("");
  return (
    <aside className="panel" aria-label="Pit">
      <div className="panel-h">
        <span>[ pit / agent ]</span>
        <span>HUMAN vs AGENT</span>
      </div>
      <div className="grid grid-rows-[auto_1fr_auto_auto] min-h-0 flex-1">
        <ul className="border-b border-[var(--line)] p-2 text-[11px]">
          {leaderboard.slice(0, 4).map((r) => (
            <li key={r.id} className="flex justify-between gap-2 py-0.5">
              <span className={r.kind === "AGENT" ? "text-[var(--hazard)]" : ""}>
                {r.kind} {shortMint(r.label, 3)}
              </span>
              <span>{fmtPnl(r.pnl)}</span>
            </li>
          ))}
        </ul>
        <div className="overflow-auto p-2 space-y-2" aria-live="polite">
          {pit.length === 0 ? (
            <p className="text-[var(--muted)]">Agent posts a one-line thesis when a market opens.</p>
          ) : (
            pit.map((m) => (
              <p key={m.id} className="text-[11px] leading-snug">
                <span className={m.from === "AGENT" ? "text-[var(--hazard)]" : "text-[var(--muted)]"}>
                  {m.from}
                </span>{" "}
                {m.text}
              </p>
            ))
          )}
        </div>
        <form
          className="border-t border-[var(--line)] p-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            onChat(text.trim());
            setText("");
          }}
        >
          <label className="sr-only" htmlFor="pit-chat">
            Pit message
          </label>
          <input
            id="pit-chat"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="say it in the pit"
            maxLength={280}
          />
          <button className="btn" type="submit">
            send
          </button>
        </form>
        <div className="border-t border-[var(--line)] p-2">
          <div className="panel-h !border-0 !px-0">
            <span>[ vault ]</span>
            <span>{vault ? `${vault.available.toFixed(3)} SOL free` : "connect"}</span>
          </div>
          <button className="btn w-full" type="button" onClick={() => onDeposit(1)}>
            paper deposit 1 SOL
          </button>
        </div>
      </div>
    </aside>
  );
}
