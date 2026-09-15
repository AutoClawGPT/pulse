use {
    anchor_lang::{prelude::Pubkey, InstructionData},
    solana_keypair::Keypair,
    solana_signer::Signer,
};

#[test]
fn discriminators_and_pdas_are_stable() {
    let program_id = pulse::id();
    let payer = Keypair::new();
    let vault = Pubkey::find_program_address(&[pulse::constants::VAULT_SEED], &program_id).0;
    let portfolio = Pubkey::find_program_address(
        &[pulse::constants::PORTFOLIO_SEED, payer.pubkey().as_ref()],
        &program_id,
    )
    .0;
    assert_ne!(vault, portfolio);
    assert!(!pulse::instruction::InitializeVault {}.data().is_empty());
    assert!(
        !pulse::instruction::Deposit {
            amount: 1_000_000_000
        }
        .data()
        .is_empty()
    );
}
