use anchor_lang::prelude::*;

use crate::{
    constants::{PORTFOLIO_SEED, PULSE_SEED},
    error::PulseError,
    instructions::implied_yes_bps,
    state::{Market, Portfolio, PulsePosition},
};

#[derive(Accounts)]
pub struct OpenPulse<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub market: Account<'info, Market>,
    #[account(
        mut,
        seeds = [PORTFOLIO_SEED, owner.key().as_ref()],
        bump = portfolio.bump,
        has_one = owner @ PulseError::Unauthorized
    )]
    pub portfolio: Account<'info, Portfolio>,
    #[account(
        init,
        payer = owner,
        space = 8 + PulsePosition::INIT_SPACE,
        seeds = [PULSE_SEED, market.key().as_ref(), owner.key().as_ref()],
        bump
    )]
    pub pulse_pos: Account<'info, PulsePosition>,
    pub system_program: Program<'info, System>,
}

pub fn handle_open_pulse(ctx: Context<OpenPulse>, long: bool, size: u64, margin: u64) -> Result<()> {
    require!(size > 0 && margin > 0, PulseError::InvalidAmount);
    let market = &ctx.accounts.market;
    require!(!market.resolved, PulseError::MarketClosed);
    let clock = Clock::get()?;
    require!(clock.unix_timestamp < market.expiry, PulseError::Expired);
    require!(ctx.accounts.portfolio.collateral >= margin, PulseError::Insufficient);

    ctx.accounts.portfolio.collateral -= margin;
    let pos = &mut ctx.accounts.pulse_pos;
    pos.owner = ctx.accounts.owner.key();
    pos.market = market.key();
    pos.bump = ctx.bumps.pulse_pos;
    pos.long = long;
    pos.size = size;
    pos.entry_bps = implied_yes_bps(market.yes_reserve, market.no_reserve)?;
    pos.margin = margin;
    pos.open = true;
    Ok(())
}
