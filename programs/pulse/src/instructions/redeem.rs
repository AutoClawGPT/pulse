use anchor_lang::prelude::*;

use crate::{
    constants::{ODDS_SEED, PORTFOLIO_SEED},
    error::PulseError,
    state::{Market, OddsPosition, Outcome, Portfolio},
};

#[derive(Accounts)]
pub struct Redeem<'info> {
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
        seeds = [ODDS_SEED, market.key().as_ref(), owner.key().as_ref()],
        bump = odds.bump,
        has_one = owner @ PulseError::Unauthorized,
        has_one = market
    )]
    pub odds: Account<'info, OddsPosition>,
}

pub fn handle_redeem(ctx: Context<Redeem>) -> Result<()> {
    let market = &ctx.accounts.market;
    require!(market.resolved, PulseError::NotResolved);
    let payout = match market.outcome {
        Outcome::Yes => ctx.accounts.odds.yes,
        Outcome::No => ctx.accounts.odds.no,
        Outcome::Undecided => 0,
    };
    ctx.accounts.portfolio.collateral = ctx
        .accounts
        .portfolio
        .collateral
        .checked_add(payout)
        .ok_or(PulseError::Overflow)?;
    ctx.accounts.odds.yes = 0;
    ctx.accounts.odds.no = 0;
    Ok(())
}
