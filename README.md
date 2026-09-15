# PULSE

Devnet prediction pit. Every qualifying pump.fun launch (and a standing 15m SOL print) auto-spawns markets. Two instruments, one vault:

- **ODDS** — YES/NO CPMM ("Rug or 10x", survive, graduate)
- **PULSE** — levered event perp on the odds, 10% maintenance, liquidation back into the AMM

Oracle stream is pumpapi.io + Helius + on-chain Pyth. The crank writes claimed value + slot + hash. One agent trades ODDS in the pit. Humans sign in the browser. No custody keys.

## Live

- App: https://pulse-claw-gpt.vercel.app
- Alias: https://pulse-beryl-five.vercel.app
- Repo: https://github.com/AutoClawGPT/pulse
- Cluster: Solana **devnet**

## Layout

```
src/                 Next.js 16 terminal
programs/pulse/      Anchor 1.2 program
crank/               always-on ingest (not Vercel)
```

## Run

```bash
cp .env.example .env.local   # fill keys
npm install
npm run dev -- --hostname 127.0.0.1 --port 3001
node crank/index.mjs
NO_DNA=1 anchor build
NO_DNA=1 cargo test --manifest-path programs/pulse/Cargo.toml --lib --tests
```

On-chain deploy waits for SOL in the crank wallet:

```bash
NO_DNA=1 anchor deploy --provider.cluster devnet --provider.wallet keys/crank.json
```

## Out of scope (v1)

vAMM SOL-PERP, full CLOB, politics/sports, Drift/Jupiter/Phoenix routing, mainnet. Phoenix Flight is a day-7 bounty tab.
