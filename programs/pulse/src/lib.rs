pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("5R6eUuZYg158N9TELM8cr2yLNWWzMgmbknx5aDuMeZyv");

#[program]
pub mod pulse {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        handle_initialize_vault(ctx)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        handle_deposit(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        handle_withdraw(ctx, amount)
    }

    pub fn create_market(
        ctx: Context<CreateMarket>,
        underlying: Pubkey,
        resolve_type: ResolveType,
        strike: u64,
        expiry: i64,
    ) -> Result<()> {
        handle_create_market(ctx, underlying, resolve_type, strike, expiry)
    }

    pub fn trade_odds(ctx: Context<TradeOdds>, buy_yes: bool, collateral: u64) -> Result<()> {
        handle_trade_odds(ctx, buy_yes, collateral)
    }

    pub fn open_pulse(ctx: Context<OpenPulse>, long: bool, size: u64, margin: u64) -> Result<()> {
        handle_open_pulse(ctx, long, size, margin)
    }

    pub fn close_pulse(ctx: Context<ClosePulse>) -> Result<()> {
        handle_close_pulse(ctx)
    }

    pub fn liquidate_pulse(ctx: Context<LiquidatePulse>) -> Result<()> {
        handle_liquidate_pulse(ctx)
    }

    pub fn resolve(
        ctx: Context<Resolve>,
        claimed_value: u64,
        claimed_slot: u64,
        claimed_hash: [u8; 32],
        yes: bool,
    ) -> Result<()> {
        handle_resolve(ctx, claimed_value, claimed_slot, claimed_hash, yes)
    }

    pub fn redeem(ctx: Context<Redeem>) -> Result<()> {
        handle_redeem(ctx)
    }
}
