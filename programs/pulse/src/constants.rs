use anchor_lang::prelude::*;

#[constant]
pub const VAULT_SEED: &[u8] = b"vault";

#[constant]
pub const MARKET_SEED: &[u8] = b"market";

#[constant]
pub const PORTFOLIO_SEED: &[u8] = b"portfolio";

#[constant]
pub const ODDS_SEED: &[u8] = b"odds";

#[constant]
pub const PULSE_SEED: &[u8] = b"pulse";

#[constant]
pub const YES_MINT_SEED: &[u8] = b"yes_mint";

#[constant]
pub const NO_MINT_SEED: &[u8] = b"no_mint";

#[constant]
pub const INITIAL_RESERVE: u64 = 1_000_000_000;

#[constant]
pub const MAINT_BPS: u64 = 1_000;

#[constant]
pub const BPS: u64 = 10_000;
