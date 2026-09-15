"use client";

import { useCallback, useEffect, useState } from "react";
import type { LeaderboardRow, Market, OddsFill, PitMessage, PulsePosition, TapeEvent } from "@/lib/types";

export type PulseSnap = {
  tape: TapeEvent[];
  markets: Market[];
  positions: PulsePosition[];
  fills: OddsFill[];
  pit: PitMessage[];
  liqs: { id: string; ts: number; marketId: string; owner: string; pnl: number }[];
  solUsd: number;
  solTs: number;
  ingest: { pumpapi: boolean; helius: boolean; pyth: boolean; lastEvent: number };
  leaderboard: LeaderboardRow[];
};

export function usePulse() {
  const [data, setData] = useState<PulseSnap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/markets", { cache: "no-store" });
      if (!res.ok) throw new Error(`markets ${res.status}`);
      setData((await res.json()) as PulseSnap);
      setError(null);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 1500);
    return () => clearInterval(id);
  }, [refresh]);

  return { data, error, refresh };
}

export async function postOp(body: Record<string, unknown>) {
  const res = await fetch("/api/markets", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}
