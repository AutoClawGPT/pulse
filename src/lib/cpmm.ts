/** Binary CPMM: complete-set mint + swap of the unwanted leg. */

export const INITIAL_RESERVE = 1_000;

export function impliedYes(yesReserve: number, noReserve: number): number {
  const d = yesReserve + noReserve;
  if (d <= 0) return 0.5;
  return noReserve / d;
}

export function tradeOdds(
  yesReserve: number,
  noReserve: number,
  buyYes: boolean,
  collateral: number,
): {
  yesReserve: number;
  noReserve: number;
  yesOut: number;
  noOut: number;
  implied: number;
} {
  if (collateral <= 0) {
    return {
      yesReserve,
      noReserve,
      yesOut: 0,
      noOut: 0,
      implied: impliedYes(yesReserve, noReserve),
    };
  }
  const k = yesReserve * noReserve;
  if (buyYes) {
    const noNew = noReserve + collateral;
    const yesNew = k / noNew;
    const yesFromSwap = yesReserve - yesNew;
    return {
      yesReserve: yesNew,
      noReserve: noNew,
      yesOut: collateral + yesFromSwap,
      noOut: 0,
      implied: impliedYes(yesNew, noNew),
    };
  }
  const yesNew = yesReserve + collateral;
  const noNew = k / yesNew;
  const noFromSwap = noReserve - noNew;
  return {
    yesReserve: yesNew,
    noReserve: noNew,
    yesOut: 0,
    noOut: collateral + noFromSwap,
    implied: impliedYes(yesNew, noNew),
  };
}

export const MAINT_BPS = 1000;
export const BPS = 10_000;

export function pulsePnl(
  long: boolean,
  size: number,
  entry: number,
  mark: number,
): number {
  const delta = long ? mark - entry : entry - mark;
  return size * delta;
}

export function pulseEquity(margin: number, pnl: number): number {
  return margin + pnl;
}

export function isLiquidatable(
  size: number,
  margin: number,
  pnl: number,
): boolean {
  const maint = (size * MAINT_BPS) / BPS;
  return pulseEquity(margin, pnl) < maint;
}

export function redeemPayout(
  outcome: "YES" | "NO",
  yesShares: number,
  noShares: number,
): number {
  return outcome === "YES" ? yesShares : noShares;
}
