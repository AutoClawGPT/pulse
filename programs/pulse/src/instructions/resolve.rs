use anchor_lang::prelude::*;

use crate::{
    constants::VAULT_SEED,
    error::PulseError,
    state::{Market, Outcome, Vault},
};

#[derive(Accounts)]
pub struct Resolve<'info> {
    pub authority: Signer<'info>,
    #[account(seeds = [VAULT_SEED], bump = vault.bump, has_one = authority @ PulseError::Unauthorized)]
    pub vault: Account<'info, Vault>,
    #[account(mut, has_one = authority @ PulseError::Unauthorized)]
    pub market: Account<'info, Market>,
}

pub fn handle_resolve(
    ctx: Context<Resolve>,
    claimed_value: u64,
    claimed_slot: u64,
    claimed_hash: [u8; 32],
    yes: bool,
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    require!(!market.resolved, PulseError::AlreadyResolved);
    market.resolved = true;
    market.outcome = if yes { Outcome::Yes } else { Outcome::No };
    market.claimed_value = claimed_value;
    market.claimed_slot = claimed_slot;
    market.claimed_hash = claimed_hash;
    Ok(())
}
