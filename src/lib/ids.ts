export const PROGRAM_ID =
  process.env.NEXT_PUBLIC_PROGRAM_ID ??
  "5R6eUuZYg158N9TELM8cr2yLNWWzMgmbknx5aDuMeZyv";

export const CLUSTER = process.env.NEXT_PUBLIC_CLUSTER ?? "devnet";

export const CRANK_PUBKEY = "7NYFbLRYbqPwQ1Sze3CfLhcmZaWvsxuoWwxCiyQDgxic";

export const AGENT_ID = "PULSE.AGENT.01";

export const PYTH_SOL_USD_FEED =
  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

/** Legacy Pyth SOL/USD price account on Solana mainnet. */
export const PYTH_SOL_USD_ACCOUNT =
  "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG";

export const SOL_MINT = "So11111111111111111111111111111111111111112";

export const NOISE_FILTER_MIN_MC = 20_000;

export const TEMPLATES = {
  MC_100K_30M: {
    template: "MC_100K_30M" as const,
    resolveType: "PumpMcGte" as const,
    strikeUsd: 100_000,
    durationMs: 30 * 60 * 1000,
    label: "Rug or 10x",
    question: (sym: string) => `Will ${sym} print $100k MC in 30m?`,
  },
  SURVIVE_60M: {
    template: "SURVIVE_60M" as const,
    resolveType: "PumpMcGte" as const,
    strikeUsd: 20_000,
    durationMs: 60 * 60 * 1000,
    label: "Survive 60m",
    question: (sym: string) => `Will ${sym} still be above $20k MC in 60m?`,
  },
  GRADUATE: {
    template: "GRADUATE" as const,
    resolveType: "PumpMcGte" as const,
    strikeUsd: 69_000,
    durationMs: 24 * 60 * 60 * 1000,
    label: "Graduate",
    question: (sym: string) => `Will ${sym} graduate the curve?`,
  },
  SOL_UP_15M: {
    template: "SOL_UP_15M" as const,
    resolveType: "PythGte" as const,
    strikeUsd: 0,
    durationMs: 15 * 60 * 1000,
    label: "SOL 15m",
    question: () => "Will SOL print higher in 15m?",
  },
};
