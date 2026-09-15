import { INITIAL_RESERVE } from "./cpmm";
import { NOISE_FILTER_MIN_MC, TEMPLATES } from "./ids";
import type { Market, TapeEvent, Template } from "./types";

export function marketId(mint: string, template: Template, createdAt: number): string {
  return `${template}:${mint}:${createdAt}`;
}

export function marketsFromCreate(ev: TapeEvent, solUsd: number): Market[] {
  if (ev.action !== "create" || !ev.mint || !ev.symbol) return [];
  const mcUsd = (ev.mcSol ?? 0) * (solUsd || 180);
  if (mcUsd < NOISE_FILTER_MIN_MC && (ev.mcSol ?? 0) * 180 < NOISE_FILTER_MIN_MC) {
    return [];
  }
  const specs = [TEMPLATES.MC_100K_30M, TEMPLATES.SURVIVE_60M, TEMPLATES.GRADUATE];
  return specs.map((spec) => ({
    id: marketId(ev.mint!, spec.template, ev.ts),
    template: spec.template,
    resolveType: spec.resolveType,
    strike: spec.strikeUsd,
    expiry: ev.ts + spec.durationMs,
    mint: ev.mint,
    symbol: ev.symbol!,
    name: ev.name ?? ev.symbol!,
    yesReserve: INITIAL_RESERVE,
    noReserve: INITIAL_RESERVE,
    implied: 0.5,
    status: "open" as const,
    createdAt: ev.ts,
    question: spec.question(ev.symbol!),
  }));
}
