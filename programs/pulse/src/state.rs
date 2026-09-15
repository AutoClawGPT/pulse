use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub authority: Pubkey,
    pub bump: u8,
    pub total_deposits: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Portfolio {
    pub owner: Pubkey,
    pub bump: u8,
    pub collateral: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum ResolveType {
    PythGte,
    PumpMcGte,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum Outcome {
    Undecided,
    Yes,
    No,
}

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub authority: Pubkey,
    pub bump: u8,
    pub underlying: Pubkey,
    pub resolve_type: ResolveType,
    pub strike: u64,
    pub expiry: i64,
    pub yes_mint: Pubkey,
    pub no_mint: Pubkey,
    pub yes_reserve: u64,
    pub no_reserve: u64,
    pub resolved: bool,
    pub outcome: Outcome,
    pub claimed_value: u64,
    pub claimed_slot: u64,
    pub claimed_hash: [u8; 32],
}

#[account]
#[derive(InitSpace)]
pub struct OddsPosition {
    pub owner: Pubkey,
    pub market: Pubkey,
    pub bump: u8,
    pub yes: u64,
    pub no: u64,
}

#[account]
#[derive(InitSpace)]
pub struct PulsePosition {
    pub owner: Pubkey,
    pub market: Pubkey,
    pub bump: u8,
    pub long: bool,
    pub size: u64,
    pub entry_bps: u64,
    pub margin: u64,
    pub open: bool,
}
