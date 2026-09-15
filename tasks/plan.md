# Implementation Plan: PULSE

## Overview
PULSE is a Solana-devnet prediction pit. Every qualifying pump.fun launch (and a standing 15m SOL print) auto-spawns markets. Two instruments share one vault: ODDS (YES/NO CPMM) and PULSE (levered event perp on the odds, with maintenance margin and liquidation back into the AMM). Auto-resolved by pumpapi + Helius + on-chain Pyth. One AI agent trades ODDS vs humans.

Locked by `/root/PULSE_HANDOFF.md`. Do not rebuild the product.

## Architecture Decisions
- Next.js 16 App Router at repo root so Vercel deploys the web app directly.
- One Anchor 1.2 program (`pulse`) with vault, market, odds CPMM, pulse positions, resolve/redeem.
- Crank is a long-lived Node process on this server (never on Vercel). It is the only writer of `create_market` / `resolve` / `liquidate`.
- Web app ingests pumpapi WS in the Next.js Node process for localhost; in production the crank POSTs to `/api/intake`.
- User wallets sign in the browser via `@solana/kit-plugin-wallet`. No custody keys for users.
- UI: Tactical Telemetry (industrial brutalist, dark CRT). Hazard red is the only accent. One live phosphor-green LED.

## Task List

### Phase 1: Foundation
- [x] Task 1: Scaffold Next.js 16 + Anchor 1.2 + env
- [ ] Task 2: Types, store, CPMM math, ingest
- [ ] Task 3: Terminal UI (tape, odds, ticket, pit, vault, bottom)
- [ ] Task 4: API routes (tape, markets, intake, pit, health, airdrop)

### Checkpoint: Foundation
- [ ] `next build` succeeds
- [ ] Localhost shows live pumpapi tape

### Phase 2: On-chain + crank
- [ ] Task 5: Anchor program (vault, market, trade_odds, pulse, resolve)
- [ ] Task 6: LiteSVM tests
- [ ] Task 7: Crank (create/resolve/liq + telegram + agent)

### Checkpoint: Core
- [ ] Program `cargo test` / `anchor build`
- [ ] Crank creates MC_100K_30M from live creates

### Phase 3: Ship
- [ ] Task 8: Phoenix Flight tab + Pyth/Helius callouts
- [ ] Task 9: GitHub AutoClawGPT/pulse
- [ ] Task 10: Vercel prod on team claw-gpt

## Risks
| Risk | Impact | Mitigation |
|---|---|---|
| pumpapi WS drop | High | Auto-reconnect + Helius parsed-tx fallback |
| Hermes blocked | Med | Read Pyth accounts via Helius RPC |
| Vercel has no long WS | High | Crank is the ingest; web is the display |
| Token-2022 mint init CU | Med | Share accounting on PDAs; mints optional |
