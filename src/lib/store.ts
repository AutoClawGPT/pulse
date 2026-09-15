import type {
  LeaderboardRow,
  LiqEvent,
  Market,
  OddsFill,
  PitMessage,
  PulsePosition,
  TapeEvent,
  VaultAccount,
} from "./types";
import { impliedYes, INITIAL_RESERVE, isLiquidatable, pulsePnl, tradeOdds } from "./cpmm";
import { hashSlot } from "./format";
import { AGENT_ID, TEMPLATES } from "./ids";

const TAPE_CAP = 400;
const PIT_CAP = 200;
const FILL_CAP = 300;

type State = {
  tape: TapeEvent[];
  markets: Map<string, Market>;
  positions: Map<string, PulsePosition>;
  fills: OddsFill[];
  pit: PitMessage[];
  liqs: LiqEvent[];
  vaults: Map<string, VaultAccount>;
  solUsd: number;
  solTs: number;
  ingest: { pumpapi: boolean; helius: boolean; pyth: boolean; lastEvent: number };
};

declare global {
  // eslint-disable-next-line no-var
  var __PULSE_STATE__: State | undefined;
}

function empty(): State {
  return {
    tape: [],
    markets: new Map(),
    positions: new Map(),
    fills: [],
    pit: [],
    liqs: [],
    vaults: new Map(),
    solUsd: 180,
    solTs: 0,
    ingest: { pumpapi: false, helius: false, pyth: false, lastEvent: 0 },
  };
}

function getState(): State {
  if (!globalThis.__PULSE_STATE__) {
    globalThis.__PULSE_STATE__ = empty();
    seedStanding();
  }
  return globalThis.__PULSE_STATE__;
}

function seedStanding() {
  const s = globalThis.__PULSE_STATE__;
  if (!s) return;
  const t = TEMPLATES.SOL_UP_15M;
  const now = Date.now();
  const id = standingId(now);
  if (s.markets.has(id)) return;
  const m: Market = {
    id,
    template: t.template,
    resolveType: t.resolveType,
    strike: s.solUsd,
    expiry: now + t.durationMs,
    symbol: "SOL",
    name: "Solana",
    yesReserve: INITIAL_RESERVE,
    noReserve: INITIAL_RESERVE,
    implied: 0.5,
    status: "open",
    createdAt: now,
    question: t.question(),
  };
  s.markets.set(id, m);
}

function standingId(now: number): string {
  const bucket = Math.floor(now / TEMPLATES.SOL_UP_15M.durationMs);
  return `sol-up-15m-${bucket}`;
}

export function snapshot() {
  const s = getState();
  ensureStanding();
  return {
    tape: s.tape.slice(0, 120),
    markets: [...s.markets.values()].sort((a, b) => b.createdAt - a.createdAt),
    positions: [...s.positions.values()],
    fills: s.fills.slice(0, 80),
    pit: s.pit.slice(0, 80),
    liqs: s.liqs.slice(0, 40),
    solUsd: s.solUsd,
    solTs: s.solTs,
    ingest: s.ingest,
    leaderboard: leaderboard(),
  };
}

function ensureStanding() {
  const s = getState();
  const id = standingId(Date.now());
  if (!s.markets.has(id)) seedStanding();
  for (const m of s.markets.values()) {
    if (m.template === "SOL_UP_15M" && m.status === "open" && Date.now() > m.expiry) {
      const up = (s.solUsd ?? 0) >= (m.strike || 0);
      resolveMarket(m.id, up ? "YES" : "NO", s.solUsd, 0, hashSlot(`pyth:${s.solUsd}:${m.id}`));
    }
  }
}

export function pushTape(ev: TapeEvent) {
  const s = getState();
  s.tape.unshift(ev);
  if (s.tape.length > TAPE_CAP) s.tape.length = TAPE_CAP;
  s.ingest.lastEvent = ev.ts;
  s.ingest.pumpapi = true;
}

export function upsertMarket(m: Market) {
  const s = getState();
  m.implied = impliedYes(m.yesReserve, m.noReserve);
  s.markets.set(m.id, m);
}

export function getMarket(id: string): Market | undefined {
  return getState().markets.get(id);
}

export function resolveMarket(
  id: string,
  outcome: "YES" | "NO",
  claimedValue: number,
  claimedSlot: number,
  claimedHash: string,
) {
  const s = getState();
  const m = s.markets.get(id);
  if (!m || m.status !== "open") return;
  m.status = "resolved";
  m.outcome = outcome;
  m.claimedValue = claimedValue;
  m.claimedSlot = claimedSlot;
  m.claimedHash = claimedHash;
  m.implied = outcome === "YES" ? 1 : 0;
  for (const p of s.positions.values()) {
    if (p.marketId !== id || p.status !== "open") continue;
    const mark = outcome === "YES" ? 1 : 0;
    p.mark = mark;
    p.pnl = pulsePnl(p.long, p.size, p.entry, mark);
    p.status = "closed";
  }
}

export function setSolUsd(price: number) {
  const s = getState();
  s.solUsd = price;
  s.solTs = Date.now();
  s.ingest.pyth = true;
  markAll();
}

export function setIngestFlag(k: keyof State["ingest"], v: boolean | number) {
  const s = getState();
  // @ts-expect-error index
  s.ingest[k] = v;
}

export function markAll() {
  const s = getState();
  for (const p of s.positions.values()) {
    if (p.status !== "open") continue;
    const m = s.markets.get(p.marketId);
    if (!m) continue;
    p.mark = m.implied;
    p.pnl = pulsePnl(p.long, p.size, p.entry, p.mark);
    if (isLiquidatable(p.size, p.margin, p.pnl)) {
      liquidate(p.id);
    }
  }
}

export function liquidate(positionId: string) {
  const s = getState();
  const p = s.positions.get(positionId);
  if (!p || p.status !== "open") return;
  p.status = "liquidated";
  const m = s.markets.get(p.marketId);
  if (m && m.status === "open") {
    const buyYes = !p.long;
    const traded = tradeOdds(m.yesReserve, m.noReserve, buyYes, Math.max(0.01, p.margin * 0.5));
    m.yesReserve = traded.yesReserve;
    m.noReserve = traded.noReserve;
    m.implied = traded.implied;
  }
  s.liqs.unshift({
    id: `liq-${positionId}-${Date.now()}`,
    ts: Date.now(),
    positionId: p.id,
    marketId: p.marketId,
    owner: p.owner,
    pnl: p.pnl,
  });
  if (s.liqs.length > 80) s.liqs.length = 80;
}

export function applyOddsTrade(input: {
  owner: string;
  kind: OddsFill["kind"];
  marketId: string;
  buyYes: boolean;
  collateral: number;
}): OddsFill | { error: string } {
  const s = getState();
  const m = s.markets.get(input.marketId);
  if (!m) return { error: "market missing" };
  if (m.status !== "open") return { error: "market closed" };
  if (Date.now() > m.expiry) return { error: "expired" };
  if (input.collateral <= 0) return { error: "size" };
  const vault = ensureVault(input.owner);
  if (vault.available < input.collateral) return { error: "insufficient vault" };
  const traded = tradeOdds(m.yesReserve, m.noReserve, input.buyYes, input.collateral);
  m.yesReserve = traded.yesReserve;
  m.noReserve = traded.noReserve;
  m.implied = traded.implied;
  vault.available -= input.collateral;
  const fill: OddsFill = {
    id: `fill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now(),
    owner: input.owner,
    kind: input.kind,
    marketId: m.id,
    buyYes: input.buyYes,
    collateral: input.collateral,
    yesOut: traded.yesOut,
    noOut: traded.noOut,
    implied: traded.implied,
  };
  s.fills.unshift(fill);
  if (s.fills.length > FILL_CAP) s.fills.length = FILL_CAP;
  markAll();
  return fill;
}

export function openPulse(input: {
  owner: string;
  marketId: string;
  long: boolean;
  size: number;
  margin: number;
}): PulsePosition | { error: string } {
  const s = getState();
  const m = s.markets.get(input.marketId);
  if (!m || m.status !== "open") return { error: "market closed" };
  if (input.size <= 0 || input.margin <= 0) return { error: "size" };
  const vault = ensureVault(input.owner);
  if (vault.available < input.margin) return { error: "insufficient vault" };
  vault.available -= input.margin;
  const pos: PulsePosition = {
    id: `px-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    owner: input.owner,
    marketId: m.id,
    long: input.long,
    size: input.size,
    entry: m.implied,
    margin: input.margin,
    mark: m.implied,
    pnl: 0,
    status: "open",
    openedAt: Date.now(),
  };
  s.positions.set(pos.id, pos);
  return pos;
}

export function closePulse(id: string, owner: string): PulsePosition | { error: string } {
  const s = getState();
  const p = s.positions.get(id);
  if (!p) return { error: "missing" };
  if (p.owner !== owner) return { error: "not owner" };
  if (p.status !== "open") return { error: "already closed" };
  const m = s.markets.get(p.marketId);
  p.mark = m?.implied ?? p.mark;
  p.pnl = pulsePnl(p.long, p.size, p.entry, p.mark);
  p.status = "closed";
  const vault = ensureVault(owner);
  vault.available += Math.max(0, p.margin + p.pnl);
  return p;
}

export function ensureVault(owner: string): VaultAccount {
  const s = getState();
  let v = s.vaults.get(owner);
  if (!v) {
    v = { owner, deposited: 10, available: 10 };
    s.vaults.set(owner, v);
  }
  return v;
}

export function deposit(owner: string, amount: number) {
  const v = ensureVault(owner);
  v.deposited += amount;
  v.available += amount;
  return v;
}

export function withdraw(owner: string, amount: number) {
  const v = ensureVault(owner);
  if (v.available < amount) return { error: "insufficient" as const };
  v.available -= amount;
  v.deposited -= amount;
  return v;
}

export function pushPit(msg: PitMessage) {
  const s = getState();
  s.pit.unshift(msg);
  if (s.pit.length > PIT_CAP) s.pit.length = PIT_CAP;
}

export function leaderboard(): LeaderboardRow[] {
  const s = getState();
  const map = new Map<string, LeaderboardRow>();
  const agent: LeaderboardRow = {
    id: AGENT_ID,
    kind: "AGENT",
    label: AGENT_ID,
    pnl: 0,
    trades: 0,
  };
  map.set(AGENT_ID, agent);
  for (const f of s.fills) {
    const id = f.kind === "AGENT" ? AGENT_ID : f.owner;
    const row = map.get(id) ?? {
      id,
      kind: f.kind,
      label: f.kind === "AGENT" ? AGENT_ID : f.owner,
      pnl: 0,
      trades: 0,
    };
    const m = s.markets.get(f.marketId);
    if (m?.status === "resolved" && m.outcome) {
      const won = f.buyYes === (m.outcome === "YES");
      row.pnl += won ? f.yesOut + f.noOut - f.collateral : -f.collateral;
    }
    row.trades += 1;
    map.set(id, row);
  }
  for (const p of s.positions.values()) {
    const id = p.owner === AGENT_ID ? AGENT_ID : p.owner;
    const row = map.get(id) ?? {
      id,
      kind: p.owner === AGENT_ID ? "AGENT" : "HUMAN",
      label: id,
      pnl: 0,
      trades: 0,
    };
    row.pnl += p.pnl;
    map.set(id, row);
  }
  return [...map.values()].sort((a, b) => b.pnl - a.pnl);
}

