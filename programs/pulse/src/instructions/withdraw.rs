use anchor_lang::prelude::*;

use crate::{
    constants::{PORTFOLIO_SEED, VAULT_SEED},
    error::PulseError,
    state::{Portfolio, Vault},
};

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, seeds = [VAULT_SEED], bump = vault.bump)]
    pub vault: Account<'info, Vault>,
    #[account(
        mut,
        seeds = [PORTFOLIO_SEED, owner.key().as_ref()],
        bump = portfolio.bump,
        has_one = owner @ PulseError::Unauthorized
    )]
    pub portfolio: Account<'info, Portfolio>,
    pub system_program: Program<'info, System>,
}

pub fn handle_withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    require!(amount > 0, PulseError::InvalidAmount);
    require!(ctx.accounts.portfolio.collateral >= amount, PulseError::Insufficient);
    ctx.accounts.portfolio.collateral -= amount;
    ctx.accounts.vault.total_deposits = ctx
        .accounts
        .vault
        .total_deposits
        .saturating_sub(amount);

    // Vault is program-owned; move lamports directly, leave rent.
    let vault_info = ctx.accounts.vault.to_account_info();
    let owner_info = ctx.accounts.owner.to_account_info();
    let rent = Rent::get()?.minimum_balance(vault_info.data_len());
    require!(
        vault_info.lamports() >= amount.saturating_add(rent),
        PulseError::Insufficient
    );
    **vault_info.try_borrow_mut_lamports()? -= amount;
    **owner_info.try_borrow_mut_lamports()? += amount;
    Ok(())
}
