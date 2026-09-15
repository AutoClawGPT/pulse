use anchor_lang::prelude::*;

use crate::{
    constants::{PORTFOLIO_SEED, PULSE_SEED},
    error::PulseError,
    instructions::{implied_yes_bps, pulse_pnl},
    state::{Market, Portfolio, PulsePosition},
};

#[derive(Accounts)]
pub struct ClosePulse<'info> {
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
        mut,
        seeds = [PULSE_SEED, market.key().as_ref(), owner.key().as_ref()],
        bump = pulse_pos.bump,
        has_one = owner @ PulseError::Unauthorized,
        has_one = market
    )]
    pub pulse_pos: Account<'info, PulsePosition>,
}

pub fn handle_close_pulse(ctx: Context<ClosePulse>) -> Result<()> {
    let pos = &mut ctx.accounts.pulse_pos;
    require!(pos.open, PulseError::MarketClosed);
    let mark = if ctx.accounts.market.resolved {
        match ctx.accounts.market.outcome {
            crate::state::Outcome::Yes => 10_000,
            crate::state::Outcome::No => 0,
            crate::state::Outcome::Undecided => {
                implied_yes_bps(ctx.accounts.market.yes_reserve, ctx.accounts.market.no_reserve)?
            }
        }
    } else {
        implied_yes_bps(ctx.accounts.market.yes_reserve, ctx.accounts.market.no_reserve)?
    };
    let pnl = pulse_pnl(pos.long, pos.size, pos.entry_bps, mark);
    let equity = (pos.margin as i64).saturating_add(pnl);
    let credit = if equity > 0 { equity as u64 } else { 0 };
    ctx.accounts.portfolio.collateral = ctx
        .accounts
        .portfolio
        .collateral
        .checked_add(credit)
        .ok_or(PulseError::Overflow)?;
    pos.open = false;
    pos.margin = 0;
    Ok(())
}
