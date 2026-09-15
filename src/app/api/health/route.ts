import { NextResponse } from "next/server";
import { pingHelius } from "@/lib/helius";
import { PROGRAM_ID, CLUSTER } from "@/lib/ids";
import { pingPyth } from "@/lib/pyth";
import { snapshot } from "@/lib/store";
import { pingTelegram } from "@/lib/telegram";

export const dynamic = "force-dynamic";

async function pingPump(): Promise<{ ok: boolean; ms: number; detail: string }> {
  const t0 = Date.now();
  try {
    const WS = (await import("ws")).WebSocket;
    const ok = await new Promise<boolean>((resolve) => {
      const ws = new WS("wss://stream.pumpapi.io/");
      const timer = setTimeout(() => {
        ws.close();
        resolve(false);
      }, 4000);
      ws.on("open", () => {
        clearTimeout(timer);
        ws.close();
        resolve(true);
      });
      ws.on("error", () => {
        clearTimeout(timer);
        resolve(false);
      });
    });
    return { ok, ms: Date.now() - t0, detail: ok ? "stream open" : "timeout" };
  } catch (e) {
    return { ok: false, ms: Date.now() - t0, detail: String(e) };
  }
}

export async function GET() {
  const [helius, pyth, tg, pump] = await Promise.all([
    pingHelius(),
    pingPyth(),
    pingTelegram(),
    pingPump(),
  ]);
  const snap = snapshot();
  const apis = {
    pumpapi: pump,
    helius,
    pyth,
    telegram: tg,
  };
  const ok = pump.ok && helius.ok;
  return NextResponse.json({
    ok,
    ts: Date.now(),
    cluster: CLUSTER,
    programId: PROGRAM_ID,
    ingest: snap.ingest,
    solUsd: snap.solUsd,
    markets: snap.markets.length,
    apis,
  });
}
