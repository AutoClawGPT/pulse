export type ResolveType = "PythGte" | "PumpMcGte";

export type Template =
  | "MC_100K_30M"
  | "SURVIVE_60M"
  | "GRADUATE"
  | "SOL_UP_15M";

export type MarketStatus = "open" | "resolved" | "void";

export type TapeEvent = {
  id: string;
  ts: number;
  action: string;
  mint?: string;
  symbol?: string;
  name?: string;
  mcSol?: number;
  pool?: string;
  signature?: string;
  uri?: string;
};

export type Market = {
  id: string;
  template: Template;
  resolveType: ResolveType;
  strike: number;
  expiry: number;
  mint?: string;
  symbol: string;
  name: string;
  yesReserve: number;
  noReserve: number;
  implied: number;
  status: MarketStatus;
  outcome?: "YES" | "NO";
  claimedValue?: number;
  claimedSlot?: number;
  claimedHash?: string;
  createdAt: number;
  question: string;
};

export type PulsePosition = {
  id: string;
  owner: string;
  marketId: string;
  long: boolean;
  size: number;
  entry: number;
  margin: number;
  mark: number;
  pnl: number;
  status: "open" | "closed" | "liquidated";
  openedAt: number;
};

export type OddsFill = {
  id: string;
  ts: number;
  owner: string;
  kind: "HUMAN" | "AGENT";
  marketId: string;
  buyYes: boolean;
  collateral: number;
  yesOut: number;
  noOut: number;
  implied: number;
};

export type PitMessage = {
  id: string;
  ts: number;
  from: "AGENT" | "HUMAN";
  wallet?: string;
  text: string;
  marketId?: string;
};

export type VaultAccount = {
  owner: string;
  deposited: number;
  available: number;
};

export type LeaderboardRow = {
  id: string;
  kind: "HUMAN" | "AGENT";
  label: string;
  pnl: number;
  trades: number;
};

export type LiqEvent = {
  id: string;
  ts: number;
  positionId: string;
  marketId: string;
  owner: string;
  pnl: number;
};

export type IntakePayload = {
  type:
    | "tape"
    | "market"
    | "resolve"
    | "mark"
    | "liq"
    | "fill"
    | "pit"
    | "sol";
  payload: unknown;
};

export type HealthStatus = {
  ok: boolean;
  ts: number;
  cluster: string;
  programId: string;
  apis: Record<
    string,
    { ok: boolean; ms?: number; detail?: string }
  >;
};
