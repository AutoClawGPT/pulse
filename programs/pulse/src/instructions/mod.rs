pub mod close_pulse;
pub mod create_market;
pub mod deposit;
pub mod initialize_vault;
pub mod liquidate_pulse;
pub mod open_pulse;
pub mod redeem;
pub mod resolve;
pub mod trade_odds;
pub mod withdraw;

pub use close_pulse::*;
pub use create_market::*;
pub use deposit::*;
pub use initialize_vault::*;
pub use liquidate_pulse::*;
pub use open_pulse::*;
pub use redeem::*;
pub use resolve::*;
pub use trade_odds::*;
pub use withdraw::*;

use crate::constants::BPS;

pub fn implied_yes_bps(yes: u64, no: u64) -> Result<u64, crate::error::PulseError> {
    let d = yes.checked_add(no).ok_or(crate::error::PulseError::Overflow)?;
    if d == 0 {
        return Ok(5_000);
    }
    no.checked_mul(BPS)
        .and_then(|n| n.checked_div(d))
        .ok_or(crate::error::PulseError::Overflow)
}

pub fn swap(yes: u64, no: u64, buy_yes: bool, collat: u64) -> Result<(u64, u64, u64, u64), crate::error::PulseError> {
    let k = (yes as u128)
        .checked_mul(no as u128)
        .ok_or(crate::error::PulseError::Overflow)?;
    if buy_yes {
        let no_new = no.checked_add(collat).ok_or(crate::error::PulseError::Overflow)?;
        let yes_new = (k / no_new as u128) as u64;
        let yes_from_swap = yes.saturating_sub(yes_new);
        let yes_out = collat.saturating_add(yes_from_swap);
        Ok((yes_new, no_new, yes_out, 0))
    } else {
        let yes_new = yes.checked_add(collat).ok_or(crate::error::PulseError::Overflow)?;
        let no_new = (k / yes_new as u128) as u64;
        let no_from_swap = no.saturating_sub(no_new);
        let no_out = collat.saturating_add(no_from_swap);
        Ok((yes_new, no_new, 0, no_out))
    }
}

pub fn pulse_pnl(long: bool, size: u64, entry_bps: u64, mark_bps: u64) -> i64 {
    let delta = if long {
        mark_bps as i64 - entry_bps as i64
    } else {
        entry_bps as i64 - mark_bps as i64
    };
    (size as i128 * delta as i128 / BPS as i128) as i64
}

#[cfg(test)]
mod math_tests {
    use super::*;

    #[test]
    fn buy_yes_raises_implied() {
        let before = implied_yes_bps(1_000, 1_000).unwrap();
        let (yes, no, yes_out, no_out) = swap(1_000, 1_000, true, 100).unwrap();
        let after = implied_yes_bps(yes, no).unwrap();
        assert!(yes_out > 100);
        assert_eq!(no_out, 0);
        assert!(after > before);
    }

    #[test]
    fn long_pnl_positive_when_mark_rises() {
        let pnl = pulse_pnl(true, 1_000, 5_000, 7_000);
        assert_eq!(pnl, 200);
    }
}
