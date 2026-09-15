use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::{
    constants::{INITIAL_RESERVE, MARKET_SEED, NO_MINT_SEED, VAULT_SEED, YES_MINT_SEED},
    error::PulseError,
    state::{Market, Outcome, ResolveType, Vault},
};

#[derive(Accounts)]
#[instruction(underlying: Pubkey, resolve_type: ResolveType, strike: u64, expiry: i64)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    #[account(seeds = [VAULT_SEED], bump = vault.bump, has_one = authority @ PulseError::Unauthorized)]
    pub vault: Account<'info, Vault>,
    #[account(
        init,
        payer = payer,
        space = 8 + Market::INIT_SPACE,
        seeds = [MARKET_SEED, underlying.as_ref(), &expiry.to_le_bytes()],
        bump
    )]
    pub market: Account<'info, Market>,
    #[account(
        init,
        payer = payer,
        seeds = [YES_MINT_SEED, market.key().as_ref()],
        bump,
        mint::decimals = 6,
        mint::authority = market,
        mint::token_program = token_program
    )]
    pub yes_mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = payer,
        seeds = [NO_MINT_SEED, market.key().as_ref()],
        bump,
        mint::decimals = 6,
        mint::authority = market,
        mint::token_program = token_program
    )]
    pub no_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handle_create_market(
    ctx: Context<CreateMarket>,
    underlying: Pubkey,
    resolve_type: ResolveType,
    strike: u64,
    expiry: i64,
) -> Result<()> {
    let clock = Clock::get()?;
    require!(expiry > clock.unix_timestamp, PulseError::Expired);
    let market = &mut ctx.accounts.market;
    market.authority = ctx.accounts.authority.key();
    market.bump = ctx.bumps.market;
    market.underlying = underlying;
    market.resolve_type = resolve_type;
    market.strike = strike;
    market.expiry = expiry;
    market.yes_mint = ctx.accounts.yes_mint.key();
    market.no_mint = ctx.accounts.no_mint.key();
    market.yes_reserve = INITIAL_RESERVE;
    market.no_reserve = INITIAL_RESERVE;
    market.resolved = false;
    market.outcome = Outcome::Undecided;
    market.claimed_value = 0;
    market.claimed_slot = 0;
    market.claimed_hash = [0u8; 32];
    Ok(())
}
