import { applyOddsTrade, getMarket, pushPit } from "./store";
import { AGENT_ID } from "./ids";
import type { Market } from "./types";

function thesis(m: Market): { buyYes: boolean; line: string } {
  let h = 0;
  const seed = m.mint ?? m.id;
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) >>> 0;
  const buyYes = h % 2 === 0;
  const side = buyYes ? "YES" : "NO";
  if (m.template === "MC_100K_30M") {
    return {
      buyYes,
      line: `${side} ${m.symbol} 100k / 30m. Curve heat ${m.implied.toFixed(2)}. ${buyYes ? "Tape has bid." : "Dev buy looks thin."}`,
    };
  }
  if (m.template === "SOL_UP_15M") {
    return {
      buyYes,
      line: `${side} SOL 15m print. Strike ${m.strike.toFixed(2)}.`,
    };
  }
  return {
    buyYes,
    line: `${side} ${m.symbol} ${m.template}. Implied ${(m.implied * 100).toFixed(0)}¢.`,
  };
}

export function agentOnMarket(m: Market) {
  const t = thesis(m);
  pushPit({
    id: `pit-${Date.now()}-${m.id}`,
    ts: Date.now(),
    from: "AGENT",
    wallet: AGENT_ID,
    text: t.line,
    marketId: m.id,
  });
  applyOddsTrade({
    owner: AGENT_ID,
    kind: "AGENT",
    marketId: m.id,
    buyYes: t.buyYes,
    collateral: 0.25,
  });
}
