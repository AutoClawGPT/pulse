"use client";

import { useEffect, useRef, useState } from "react";
import { PUMP_WS, toTape, type PumpEvent } from "@/lib/pump-event";
import { marketsFromCreate } from "@/lib/spawn";
import type { Market, TapeEvent } from "@/lib/types";

const TAPE_CAP = 120;

export function useLiveTape(solUsd: number) {
  const [tape, setTape] = useState<TapeEvent[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [live, setLive] = useState(false);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    let stop = false;
    let ws: WebSocket | null = null;
    let backoff = 800;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      if (stop) return;
      ws = new WebSocket(PUMP_WS);
      ws.onopen = () => {
        backoff = 800;
        setLive(true);
      };
      ws.onmessage = (ev) => {
        try {
          const raw = JSON.parse(String(ev.data)) as PumpEvent;
          const row = toTape(raw);
          if (!row) return;
          setTape((prev) => {
            if (prev[0]?.id === row.id) return prev;
            return [row, ...prev].slice(0, TAPE_CAP);
          });
          if (row.action === "create") {
            const spawned = marketsFromCreate(row, solUsd);
            if (!spawned.length) return;
            setMarkets((prev) => {
              const next = [...prev];
              for (const m of spawned) {
                if (seen.current.has(m.id)) continue;
                seen.current.add(m.id);
                next.unshift(m);
              }
              return next.slice(0, 80);
            });
          }
        } catch {
          /* ignore */
        }
      };
      ws.onerror = () => ws?.close();
      ws.onclose = () => {
        setLive(false);
        if (stop) return;
        timer = setTimeout(connect, backoff);
        backoff = Math.min(backoff * 2, 12_000);
      };
    }

    connect();
    return () => {
      stop = true;
      if (timer) clearTimeout(timer);
      ws?.close();
    };
  }, [solUsd]);

  return { tape, markets, live };
}
