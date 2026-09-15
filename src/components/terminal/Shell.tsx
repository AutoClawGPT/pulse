"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useSession } from "@/components/providers";
import { useLiveTape } from "@/hooks/use-live-tape";
import { postOp, usePulse } from "@/hooks/use-pulse";
import { AGENT_ID } from "@/lib/ids";
import { BottomStrip } from "./BottomStrip";
import { Header } from "./Header";
import { OddsBoard } from "./OddsBoard";
import { Pit } from "./Pit";
import { PulseTicket } from "./PulseTicket";
import { Tape } from "./Tape";

function beep() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    o.type = "square";
    g.gain.value = 0.03;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.07);
  } catch {
    /* ignore */
  }
}

export function Shell() {
  const { data, error } = usePulse();
  const live = useLiveTape(data?.solUsd ?? 180);
  const { address } = useSession();
  const owner = address ?? "paper-desk";
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [airdropping, setAirdropping] = useState(false);
  const reduce = useReducedMotion();
  const seen = useRef(new Set<string>());

  const markets = useMemo(() => {
    const map = new Map((data?.markets ?? []).map((m) => [m.id, m]));
    for (const m of live.markets) {
      if (!map.has(m.id)) map.set(m.id, m);
    }
    return [...map.values()].sort((a, b) => b.createdAt - a.createdAt);
  }, [data, live.markets]);

  const tape = live.tape.length ? live.tape : (data?.tape ?? []);

  const market = useMemo(() => {
    return markets.find((m) => m.id === selected) ?? markets[0] ?? null;
  }, [markets, selected]);

  useEffect(() => {
    for (const m of markets) {
      if (seen.current.has(m.id)) continue;
      seen.current.add(m.id);
      if (seen.current.size > 1 && !reduce) beep();
    }
  }, [markets, reduce]);

  const vault = data
    ? {
        owner,
        deposited: 10,
        available:
          data.positions
            .filter((p) => p.owner === owner && p.status === "open")
            .reduce((a, p) => a - p.margin, 10) || 10,
      }
    : null;

  async function trade(buyYes: boolean) {
    if (!market) return;
    setBusy(true);
    await postOp({ op: "trade", owner, marketId: market.id, buyYes, collateral: 0.2 });
    setBusy(false);
  }

  async function openPx(long: boolean, size: number, margin: number) {
    if (!market) return;
    setBusy(true);
    await postOp({ op: "open_pulse", owner, marketId: market.id, long, size, margin });
    setBusy(false);
  }

  async function chat(text: string) {
    await fetch("/api/pit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from: "HUMAN", wallet: owner, text, marketId: market?.id }),
    });
  }

  async function airdrop() {
    if (!address) return;
    setAirdropping(true);
    await fetch("/api/airdrop", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ address }),
    });
    setAirdropping(false);
  }

  return (
    <div className="terminal">
      <Header
        live={live.live || Boolean(data?.ingest.pumpapi)}
        solUsd={data?.solUsd ?? 0}
        helius={Boolean(data?.ingest.helius)}
        pyth={Boolean(data?.ingest.pyth) || (data?.solUsd ?? 0) > 0}
        onAirdrop={airdrop}
        airdropping={airdropping}
      />
      <div className="terminal-main">
        <Tape
          tape={tape}
          markets={markets}
          solUsd={data?.solUsd ?? 180}
          selected={market?.id ?? null}
          onSelect={setSelected}
        />
        <div className="panel min-h-0">
          <OddsBoard market={market} onBuy={trade} busy={busy} />
          <PulseTicket market={market} onOpen={openPx} busy={busy} />
        </div>
        <Pit
          pit={data?.pit ?? []}
          leaderboard={data?.leaderboard ?? []}
          vault={vault}
          onChat={chat}
          onDeposit={(n) => void postOp({ op: "deposit", owner, amount: n })}
        />
      </div>
      <BottomStrip
        fills={data?.fills ?? []}
        positions={(data?.positions ?? []).filter((p) => p.owner === owner || p.owner === AGENT_ID)}
        liqs={data?.liqs ?? []}
      />
      {error ? (
        <div className="fixed bottom-24 left-3 z-40 border border-[var(--hazard)] bg-[var(--bg)] px-3 py-2 text-[var(--hazard)]" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
