use anchor_lang::prelude::*;

use crate::{
    constants::{ODDS_SEED, PORTFOLIO_SEED},
    error::PulseError,
    instructions::swap,
    state::{Market, OddsPosition, Portfolio},
};

#[derive(Accounts)]
pub struct TradeOdds<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(
        mut,
        seeds = [PORTFOLIO_SEED, owner.key().as_ref()],
        bump = portfolio.bump,
        has_one = owner @ PulseError::Unauthorized
    )]
    pub portfolio: Account<'info, Portfolio>,
    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + OddsPosition::INIT_SPACE,
        seeds = [ODDS_SEED, market.key().as_ref(), owner.key().as_ref()],
        bump
    )]
    pub odds: Account<'info, OddsPosition>,
    pub system_program: Program<'info, System>,
}

pub fn handle_trade_odds(ctx: Context<TradeOdds>, buy_yes: bool, collateral: u64) -> Result<()> {
    require!(collateral > 0, PulseError::InvalidAmount);
    let market = &mut ctx.accounts.market;
    require!(!market.resolved, PulseError::MarketClosed);
    let clock = Clock::get()?;
    require!(clock.unix_timestamp < market.expiry, PulseError::Expired);
    require!(ctx.accounts.portfolio.collateral >= collateral, PulseError::Insufficient);

    let (yes_new, no_new, yes_out, no_out) =
        swap(market.yes_reserve, market.no_reserve, buy_yes, collateral)?;
    market.yes_reserve = yes_new;
    market.no_reserve = no_new;
    ctx.accounts.portfolio.collateral -= collateral;

    let odds = &mut ctx.accounts.odds;
    odds.owner = ctx.accounts.owner.key();
    odds.market = market.key();
    odds.bump = ctx.bumps.odds;
    odds.yes = odds.yes.saturating_add(yes_out);
    odds.no = odds.no.saturating_add(no_out);
    Ok(())
}
