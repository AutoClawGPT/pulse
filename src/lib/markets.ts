import { agentOnMarket } from "./agent";
import { hashSlot } from "./format";
import { getMarket, resolveMarket, upsertMarket } from "./store";
import { telegram } from "./telegram";
import { marketsFromCreate, marketId } from "./spawn";
import type { Market, TapeEvent } from "./types";

export { marketId };

export function maybeSpawnFromCreate(
  ev: TapeEvent,
  solUsd: number,
): Market[] {
  const spawned: Market[] = [];
  for (const m of marketsFromCreate(ev, solUsd)) {
    if (getMarket(m.id)) continue;
    upsertMarket(m);
    agentOnMarket(m);
    spawned.push(m);
  }
  if (spawned.length) {
    void telegram(
      `PULSE market ${spawned[0].symbol}\n${spawned.map((x) => x.template).join(" / ")}\n${ev.mint}`,
    );
  }
  return spawned;
}

export function resolveIfDue(
  m: Market,
  mcUsd: number | undefined,
  graduated: boolean,
  solUsd: number,
  slot: number,
) {
  if (m.status !== "open") return;
  const now = Date.now();
  if (m.template === "MC_100K_30M") {
    if (mcUsd != null && mcUsd >= m.strike) {
      resolveMarket(m.id, "YES", mcUsd, slot, hashSlot(`${m.id}:${mcUsd}:${slot}`));
      return;
    }
    if (now >= m.expiry) {
      resolveMarket(m.id, "NO", mcUsd ?? 0, slot, hashSlot(`${m.id}:exp:${slot}`));
    }
    return;
  }
  if (m.template === "SURVIVE_60M") {
    if (now >= m.expiry) {
      const yes = (mcUsd ?? 0) >= m.strike;
      resolveMarket(m.id, yes ? "YES" : "NO", mcUsd ?? 0, slot, hashSlot(`${m.id}:surv:${slot}`));
    }
    return;
  }
  if (m.template === "GRADUATE") {
    if (graduated) {
      resolveMarket(m.id, "YES", mcUsd ?? 0, slot, hashSlot(`${m.id}:grad:${slot}`));
      return;
    }
    if (now >= m.expiry) {
      resolveMarket(m.id, "NO", mcUsd ?? 0, slot, hashSlot(`${m.id}:nograd:${slot}`));
    }
    return;
  }
  if (m.template === "SOL_UP_15M" && now >= m.expiry) {
    const yes = solUsd >= m.strike;
    resolveMarket(m.id, yes ? "YES" : "NO", solUsd, slot, hashSlot(`${m.id}:sol:${solUsd}`));
  }
}
