import type { TapeEvent } from "./types";

export type PumpEvent = {
  action?: string;
  mint?: string;
  symbol?: string;
  name?: string;
  marketCapQuote?: number;
  pool?: string;
  signature?: string;
  timestamp?: number;
  uri?: string;
};

export const PUMP_WS = "wss://stream.pumpapi.io/";

export function toTape(ev: PumpEvent): TapeEvent | null {
  const action = ev.action ?? "";
  if (!["create", "buy", "sell", "migrate"].includes(action)) return null;
  if (ev.pool && ev.pool !== "pump" && action !== "migrate" && action !== "create") {
    return null;
  }
  return {
    id: ev.signature ?? `${action}-${ev.mint}-${ev.timestamp}`,
    ts: ev.timestamp ?? Date.now(),
    action,
    mint: ev.mint,
    symbol: ev.symbol,
    name: ev.name,
    mcSol: ev.marketCapQuote,
    pool: ev.pool,
    signature: ev.signature,
    uri: ev.uri,
  };
}
