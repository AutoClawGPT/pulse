import assert from "node:assert/strict";
import test from "node:test";

function impliedYes(yesReserve, noReserve) {
  const d = yesReserve + noReserve;
  if (d <= 0) return 0.5;
  return noReserve / d;
}

function tradeOdds(yesReserve, noReserve, buyYes, collateral) {
  const k = yesReserve * noReserve;
  if (buyYes) {
    const noNew = noReserve + collateral;
    const yesNew = k / noNew;
    return {
      yesOut: collateral + (yesReserve - yesNew),
      noOut: 0,
      implied: impliedYes(yesNew, noNew),
    };
  }
  const yesNew = yesReserve + collateral;
  const noNew = k / yesNew;
  return {
    yesOut: 0,
    noOut: collateral + (noReserve - noNew),
    implied: impliedYes(yesNew, noNew),
  };
}

test("buy YES lifts implied", () => {
  const before = impliedYes(1000, 1000);
  const r = tradeOdds(1000, 1000, true, 100);
  assert.equal(r.noOut, 0);
  assert.ok(r.yesOut > 100);
  assert.ok(r.implied > before);
});

test("buy NO lowers implied", () => {
  const r = tradeOdds(1000, 1000, false, 100);
  assert.ok(r.implied < 0.5);
  assert.ok(r.noOut > 100);
});
