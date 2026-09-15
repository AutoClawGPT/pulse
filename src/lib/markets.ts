import { agentOnMarket } from "./agent";
import { INITIAL_RESERVE } from "./cpmm";
import { hashSlot } from "./format";
import { NOISE_FILTER_MIN_MC, TEMPLATES } from "./ids";
import { getMarket, resolveMarket, upsertMarket } from "./store";
import { telegram } from "./telegram";
import type { Market, TapeEvent, Template } from "./types";

export function marketId(mint: string, template: Template, createdAt: number): string {
  return `${template}:${mint}:${createdAt}`;
}

export function maybeSpawnFromCreate(
  ev: TapeEvent,
  solUsd: number,
): Market[] {
  if (ev.action !== "create") return [];
  if (!ev.mint || !ev.symbol) return [];
  const mcUsd = (ev.mcSol ?? 0) * (solUsd || 180);
  if (mcUsd < NOISE_FILTER_MIN_MC && (ev.mcSol ?? 0) * 180 < NOISE_FILTER_MIN_MC) {
    return [];
  }
  const spawned: Market[] = [];
  const specs = [TEMPLATES.MC_100K_30M, TEMPLATES.SURVIVE_60M, TEMPLATES.GRADUATE];
  for (const spec of specs) {
    const id = marketId(ev.mint, spec.template, ev.ts);
    if (getMarket(id)) continue;
    const m: Market = {
      id,
      template: spec.template,
      resolveType: spec.resolveType,
      strike: spec.strikeUsd,
      expiry: ev.ts + spec.durationMs,
      mint: ev.mint,
      symbol: ev.symbol,
      name: ev.name ?? ev.symbol,
      yesReserve: INITIAL_RESERVE,
      noReserve: INITIAL_RESERVE,
      implied: 0.5,
      status: "open",
      createdAt: ev.ts,
      question: spec.question(ev.symbol),
    };
    upsertMarket(m);
    agentOnMarket(m);
    spawned.push(m);
  }
  if (spawned.length) {
    void telegram(
      `PULSE market ${spawned[0].symbol}\n${spawned.map((m) => m.template).join(" / ")}\n${ev.mint}`,
    );
  }
  return spawned;
}

export function maybeResolveFromTrade(ev: TapeEvent, solUsd: number) {
  if (!ev.mint) return;
  const mcUsd = (ev.mcSol ?? 0) * (solUsd || 180);
  for (const spec of [TEMPLATES.MC_100K_30M, TEMPLATES.SURVIVE_60M, TEMPLATES.GRADUATE]) {
    // resolve any open market for this mint+template that has hit strike or expired
    // ids include createdAt so we scan via prefix
  }
  void mcUsd;
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
