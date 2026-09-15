use anchor_lang::prelude::*;

#[error_code]
pub enum PulseError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Market is not open")]
    MarketClosed,
    #[msg("Market has expired")]
    Expired,
    #[msg("Market is not expired")]
    NotExpired,
    #[msg("Insufficient collateral")]
    Insufficient,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Position is not liquidatable")]
    NotLiquidatable,
    #[msg("Already resolved")]
    AlreadyResolved,
    #[msg("Not resolved")]
    NotResolved,
    #[msg("Overflow")]
    Overflow,
}
