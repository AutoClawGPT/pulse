use anchor_lang::{prelude::*, system_program};

use crate::{
    constants::{PORTFOLIO_SEED, VAULT_SEED},
    error::PulseError,
    state::{Portfolio, Vault},
};

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, seeds = [VAULT_SEED], bump = vault.bump)]
    pub vault: Account<'info, Vault>,
    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + Portfolio::INIT_SPACE,
        seeds = [PORTFOLIO_SEED, owner.key().as_ref()],
        bump
    )]
    pub portfolio: Account<'info, Portfolio>,
    pub system_program: Program<'info, System>,
}

pub fn handle_deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    require!(amount > 0, PulseError::InvalidAmount);
    let cpi_accounts = system_program::Transfer {
        from: ctx.accounts.owner.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(system_program::ID, cpi_accounts);
    system_program::transfer(cpi_ctx, amount)?;

    let p = &mut ctx.accounts.portfolio;
    p.owner = ctx.accounts.owner.key();
    p.bump = ctx.bumps.portfolio;
    p.collateral = p.collateral.checked_add(amount).ok_or(PulseError::Overflow)?;
    ctx.accounts.vault.total_deposits = ctx
        .accounts
        .vault
        .total_deposits
        .checked_add(amount)
        .ok_or(PulseError::Overflow)?;
    Ok(())
}
