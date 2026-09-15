"use client";

import Link from "next/link";
import { Chrome } from "@/components/Chrome";
import { useLiveTape } from "@/hooks/use-live-tape";
import { usePulse } from "@/hooks/use-pulse";
import { fmtCountdown, fmtPct, shortMint } from "@/lib/format";
import { useMemo } from "react";

export default function MarketsPage() {
  const { data } = usePulse();
  const live = useLiveTape(data?.solUsd ?? 180);
  const markets = useMemo(() => {
    const map = new Map((data?.markets ?? []).map((m) => [m.id, m]));
    for (const m of live.markets) if (!map.has(m.id)) map.set(m.id, m);
    return [...map.values()].sort((a, b) => b.createdAt - a.createdAt);
  }, [data, live.markets]);

  return (
    <Chrome>
      <div className="page-body">
        <div className="panel-h">
          <span>[ markets / auto-spawned ]</span>
          <span>{markets.length} open+resolved</span>
        </div>
        <div
          className="row text-[9px] text-[var(--muted)] uppercase"
          style={{ gridTemplateColumns: "1.2fr 1fr 90px 90px 80px 80px" }}
        >
          <span>question</span>
          <span>template</span>
          <span>yes</span>
          <span>clock</span>
          <span>status</span>
          <span>mint</span>
        </div>
        {markets.map((m) => (
          <Link
            key={m.id}
            href="/"
            className="row"
            style={{ gridTemplateColumns: "1.2fr 1fr 90px 90px 80px 80px" }}
          >
            <span className="truncate">{m.question}</span>
            <span>{m.template}</span>
            <span>{fmtPct(m.implied)}</span>
            <span>{m.status === "open" ? fmtCountdown(m.expiry) : m.outcome ?? "—"}</span>
            <span>{m.status}</span>
            <span className="text-[var(--muted)]">{shortMint(m.mint, 3)}</span>
          </Link>
        ))}
      </div>
    </Chrome>
  );
}
