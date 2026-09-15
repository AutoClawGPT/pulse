import { maybeSpawnFromCreate, resolveIfDue } from "./markets";
import { PUMP_WS, toTape, type PumpEvent } from "./pump-event";
import { fetchSolUsd } from "./pyth";
import {
  getMarket,
  markAll,
  pushTape,
  setIngestFlag,
  setSolUsd,
  snapshot,
} from "./store";

declare global {
  // eslint-disable-next-line no-var
  var __PULSE_INGEST__: { started: boolean } | undefined;
}

async function pumpLoop() {
  // Native WebSocket in Node 22
  const WS = (await import("ws")).WebSocket;
  let backoff = 500;
  for (;;) {
    try {
      await new Promise<void>((resolve, reject) => {
        const ws = new WS(PUMP_WS);
        ws.on("open", () => {
          backoff = 500;
          setIngestFlag("pumpapi", true);
        });
        ws.on("message", (data) => {
          try {
            const raw = JSON.parse(String(data)) as PumpEvent;
            const tape = toTape(raw);
            if (!tape) return;
            pushTape(tape);
            const sol = snapshot().solUsd;
            if (tape.action === "create") maybeSpawnFromCreate(tape, sol);
            if (tape.mint && (tape.action === "buy" || tape.action === "sell" || tape.action === "migrate")) {
              const mcUsd = (tape.mcSol ?? 0) * sol;
              for (const m of snapshot().markets) {
                if (m.mint !== tape.mint || m.status !== "open") continue;
                resolveIfDue(m, mcUsd, tape.action === "migrate", sol, 0);
              }
            }
          } catch {
            /* ignore malformed */
          }
        });
        ws.on("error", (e) => reject(e));
        ws.on("close", () => resolve());
      });
    } catch {
      setIngestFlag("pumpapi", false);
    }
    await new Promise((r) => setTimeout(r, backoff));
    backoff = Math.min(backoff * 2, 15_000);
  }
}

async function pythLoop() {
  for (;;) {
    const r = await fetchSolUsd();
    if (r.price) setSolUsd(r.price);
    markAll();
    const snap = snapshot();
    for (const m of snap.markets) {
      if (m.template === "SOL_UP_15M") {
        resolveIfDue(m, undefined, false, snap.solUsd, 0);
      }
    }
    void getMarket;
    await new Promise((r) => setTimeout(r, 8_000));
  }
}

export function startIngest() {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  // Vercel functions cannot hold the pumpapi WS. Browser tape + crank do.
  if (process.env.VERCEL) return;
  if (globalThis.__PULSE_INGEST__?.started) return;
  globalThis.__PULSE_INGEST__ = { started: true };
  void pumpLoop();
  void pythLoop();
}
