use anchor_lang::prelude::*;

use crate::{
    constants::{BPS, MAINT_BPS, PORTFOLIO_SEED, PULSE_SEED},
    error::PulseError,
    instructions::{implied_yes_bps, pulse_pnl, swap},
    state::{Market, Portfolio, PulsePosition},
};

#[derive(Accounts)]
pub struct LiquidatePulse<'info> {
    pub liquidator: Signer<'info>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    /// CHECK: owner of the underwater position
    pub owner: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [PORTFOLIO_SEED, owner.key().as_ref()],
        bump = portfolio.bump
    )]
    pub portfolio: Account<'info, Portfolio>,
    #[account(
        mut,
        seeds = [PULSE_SEED, market.key().as_ref(), owner.key().as_ref()],
        bump = pulse_pos.bump,
        has_one = market
    )]
    pub pulse_pos: Account<'info, PulsePosition>,
}

pub fn handle_liquidate_pulse(ctx: Context<LiquidatePulse>) -> Result<()> {
    let pos = &mut ctx.accounts.pulse_pos;
    require!(pos.open, PulseError::MarketClosed);
    require!(pos.owner == ctx.accounts.owner.key(), PulseError::Unauthorized);
    let market = &mut ctx.accounts.market;
    require!(!market.resolved, PulseError::AlreadyResolved);
    let mark = implied_yes_bps(market.yes_reserve, market.no_reserve)?;
    let pnl = pulse_pnl(pos.long, pos.size, pos.entry_bps, mark);
    let equity = (pos.margin as i64).saturating_add(pnl);
    let maint = pos.size.saturating_mul(MAINT_BPS) / BPS;
    require!(equity < maint as i64, PulseError::NotLiquidatable);

    let remnant = if equity > 0 { equity as u64 } else { 0 };
    if remnant > 0 {
        let buy_yes = !pos.long;
        let (yes_new, no_new, _, _) = swap(market.yes_reserve, market.no_reserve, buy_yes, remnant)?;
        market.yes_reserve = yes_new;
        market.no_reserve = no_new;
    }
    pos.open = false;
    pos.margin = 0;
    Ok(())
}
